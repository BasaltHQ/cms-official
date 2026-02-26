"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

import { getTenantContext } from "@/lib/tenant";

export async function saveLandingPage(id: string, data: any) {
    try {
        const context = await getTenantContext(false);
        if (!context) return { success: false, error: "Unauthorized" };

        const { teamId } = context;

        // Verify ownership
        const existingPage = await prismadb.landingPage.findFirst({
            where: { id, team_id: teamId }
        });

        if (!existingPage) {
            return { success: false, error: "Unauthorized: Page not found in your workspace" };
        }

        // Extract title from data if available
        const title = data?.root?.props?.title;

        await prismadb.landingPage.update({
            where: { id },
            data: {
                content: data,
                title: title ? title : undefined, // Only update if title exists
                updatedAt: new Date(),
            },
        });
        revalidatePath(`/cms/landing`);
        revalidatePath(`/landing`);

        await logActivity(
            "Update Landing Page",
            "Landing Page",
            `Updated content for page ID: ${id}`,
            {
                pageId: id,
                sectionsCount: Array.isArray(data) ? data.length : (Array.isArray(data?.content) ? data.content.length : 0)
            }
        );

        return { success: true };
    } catch (error) {
        console.error("Failed to save landing page:", error);
        return { success: false, error: "Failed to save" };
    }
}
