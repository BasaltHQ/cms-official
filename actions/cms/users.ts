"use server";

import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function getUsers(query?: string) {
    const where: any = {};
    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } }
        ];
    }

    const users = await prismadb.users.findMany({
        where,
        include: {
            assigned_role: true
        },
        orderBy: { created_on: 'desc' }
    });

    return users;
}

export async function getRoles() {
    const roles = await prismadb.role.findMany({
        orderBy: { name: 'asc' }
    });

    if (roles.length === 0) {
        // Seed default roles
        await prismadb.role.createMany({
            data: [
                { name: "Admin", permissions: ["cms.access", "users.manage", "settings.manage", "content.manage"], description: "Full access to all system features." },
                { name: "Editor", permissions: ["cms.access", "content.manage"], description: "Can manage content but not system settings." },
                { name: "Viewer", permissions: ["cms.access"], description: "Read-only access." }
            ]
        });
        return await prismadb.role.findMany({ orderBy: { name: 'asc' } });
    }

    return roles;
}

export async function upsertUser(data: any) {
    try {
        const { id, ...updateData } = data;

        // If creating new user, verify email uniqueness
        if (!id) {
            const existing = await prismadb.users.findUnique({ where: { email: updateData.email } });
            if (existing) throw new Error("Email already exists");
        }

        if (id) {
            if (updateData.password) {
                if (updateData.password.length < 6) throw new Error("Password must be at least 6 characters");
                updateData.password = await hash(updateData.password, 12);
            }
            await prismadb.users.update({
                where: { id },
                data: updateData
            });
        } else {
            if (updateData.password) {
                if (updateData.password.length < 6) throw new Error("Password must be at least 6 characters");
                updateData.password = await hash(updateData.password, 12);
            }
            await prismadb.users.create({
                data: {
                    ...updateData,
                    created_on: new Date(),
                    userStatus: "ACTIVE", // Default to active for manually created users
                    is_admin: false, // Default to false, rely on role
                }
            });
        }

        revalidatePath("/cms/settings/team");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to upsert user:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUser(id: string) {
    try {
        // Soft delete or hard delete? Prudence suggests soft delete usually, but for now specific request implied management including delete.
        // Let's do hard delete for now as per "delete" request, or check if constraints exist.
        // Users have many relations. Soft delete (status=INACTIVE) is safer.
        // But user explicitly asked for "delete".
        // Let's implement Delete but fallback to Deactivate if relations prevent it?
        // Actually, let's just delete for now and rely on constraints throwing error if needed, or cascading.
        // Safe approach: Update status to INACTIVE (Deactivate) is a separate action.
        // Delete = Hard Delete.

        await prismadb.users.delete({ where: { id } });
        revalidatePath("/cms/settings/team");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to delete user. They may have active records." };
    }
}

export async function toggleUserStatus(id: string, status: "ACTIVE" | "INACTIVE" | "PENDING") {
    try {
        await prismadb.users.update({
            where: { id },
            data: { userStatus: status }
        });
        revalidatePath("/cms/settings/team");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function requestPasswordReset(email: string) {
    try {
        const user = await prismadb.users.findUnique({ where: { email } });

        // Always return success to prevent email enumeration, but log internally if needed
        if (user) {

            // Generate secure random password (12 chars)
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            let tempPassword = "";
            for (let i = 0; i < 12; i++) {
                tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const hashedTempPassword = await hash(tempPassword, 12);

            await prismadb.users.update({
                where: { id: user.id },
                data: {
                    password: hashedTempPassword,
                    forcePasswordReset: true
                }
            });

            // Send Email
            try {
                const sendEmail = (await import("@/lib/sendmail")).default;
                await sendEmail({
                    to: user.email,
                    from: process.env.EMAIL_FROM || "admin@ledger1.ai",
                    subject: "Your Temporary Password - Ledger1 CMS",
                    text: `A password reset was requested for your account.\n\nTemporary Password: ${tempPassword}\n\nPlease login and change your password immediately.`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #4f46e5;">Password Reset Request</h2>
                            <p>A password reset was requested for your account.</p>
                            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <strong>Temporary Password:</strong>
                                <div style="font-family: monospace; font-size: 18px; margin-top: 5px; color: #111;">${tempPassword}</div>
                            </div>
                            <p>Please <a href="${process.env.NEXT_PUBLIC_APP_URL}/cms/login">login here</a> and change your password immediately.</p>
                        </div>
                    `
                });
            } catch (e) {
                console.error("Failed to send temp password email", e);
                // Continue to log activity even if email fails? Yes.
            }

            try {
                const { logActivityInternal } = await import("@/actions/audit");
                await logActivityInternal(user.id, "Requested Password Reset", "Security", `Temporary password generated for ${email}`);
            } catch (e) {
                console.error("Failed to log activity", e);
            }
        }

        return { success: true, message: "If an account exists, a temporary password has been sent." };
    } catch (error) {
        console.error("Request password reset failed", error);
        return { success: false, error: "Verification failed" };
    }
}

export async function resetUserPassword(userId: string) {
    try {
        const user = await prismadb.users.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        // Generate secure random password (12 chars)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let newPassword = "";
        for (let i = 0; i < 12; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const hashedPassword = await hash(newPassword, 12);

        await prismadb.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        // Dynamically import sendEmail to avoid top-level issues if any
        const sendEmail = (await import("@/lib/sendmail")).default;

        await sendEmail({
            to: user.email,
            from: process.env.EMAIL_FROM || "admin@ledger1.ai",
            subject: "Your Password Has Been Reset - Ledger1 CMS",
            text: `Your password has been reset by an administrator.\n\nNew Password: ${newPassword}\n\nPlease login and change this password immediately.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Password Reset</h2>
                    <p>Your password for Ledger1 CMS has been reset by an administrator.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>New Password:</strong>
                        <div style="font-family: monospace; font-size: 18px; margin-top: 5px; color: #111;">${newPassword}</div>
                    </div>
                    <p>Please <a href="https://ledger1.ai/cms/login">login here</a> and change your password immediately.</p>
                </div>
            `
        });

        return { success: true, message: "Password reset and emailed to user." };
    } catch (error: any) {
        console.error("Reset password failed:", error);
        return { success: false, error: error.message || "Failed to reset password" };
    }
}
