import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface TenantContext {
    userId: string;
    teamId: string;
    role: string;
}

/**
 * Retrieves the current tenant context (User ID and Team ID) safely.
 * If no session exists, it can optionally redirect or throw.
 */
export async function getTenantContext(shouldRedirect = true): Promise<TenantContext | null> {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id || !user?.team_id) {
        if (shouldRedirect) {
            // Default to 'en' if we can't determine it, but ideally we'd pass it in.
            // For now, redirecting to a stable login path.
            redirect("/en/cms/login");
        }
        return null;
    }

    return {
        userId: user.id,
        teamId: user.team_id,
        role: user.team_role || "MEMBER",
    };
}

/**
 * Utility to ensure the user is an admin of their team or system.
 */
export async function ensureAdmin() {
    const context = await getTenantContext();
    if (!context) return null;

    if (context.role !== "ADMIN" && context.role !== "OWNER") {
        throw new Error("Unauthorized: Admin access required.");
    }

    return context;
}
