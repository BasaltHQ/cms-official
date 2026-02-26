import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify Platform Admin Status
        const adminUser = await prismadb.users.findUnique({
            where: { email: session.user.email },
            include: { assigned_team: true }
        });

        const isPlatformAdmin = adminUser?.is_admin || adminUser?.assigned_team?.slug === "basalt";

        if (!isPlatformAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const { teamName, slug, resetPassword } = await req.json();

        if (!teamName || teamName.trim() === "") {
            return new NextResponse("Team name is required", { status: 400 });
        }

        const targetUser = await prismadb.users.findUnique({
            where: { id: params.userId },
            include: { assigned_team: true }
        });

        if (!targetUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Generate or use provided slug
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        // Create the new team and set user as owner
        const newTeam = await prismadb.team.create({
            data: {
                name: teamName,
                slug: finalSlug,
                owner_id: targetUser.id,
                status: "ACTIVE",
                subscription_plan: "FREE",
            }
        });

        // Initialize update data object
        let updateData: any = {
            team_id: newTeam.id,
            team_role: "OWNER" // Give them ownership
        };

        // Conditionally hash and inject the new password if provided
        if (resetPassword && resetPassword.trim() !== "") {
            const bcrypt = require("bcryptjs");
            const hashedPassword = await bcrypt.hash(resetPassword, 12);
            updateData.password = hashedPassword;
        }

        // Update the user to belong to this team and set role to OWNER (and maybe new password)
        await prismadb.users.update({
            where: { id: targetUser.id },
            data: updateData
        });

        return NextResponse.json({ success: true, team: newTeam });

    } catch (error) {
        console.error("[SPAWN_TEAM_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
