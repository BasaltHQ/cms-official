"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

export async function deleteLandingPage(pageId: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        // Find the next available page before deletion
        const nextPage = await prismadb.landingPage.findFirst({
            where: {
                id: { not: pageId }
            },
            orderBy: { updatedAt: "desc" },
            select: { id: true }
        });

        await prismadb.landingPage.delete({
            where: {
                id: pageId
            }
        });

        await logActivity("Delete Landing Page", "Landing Page", `Deleted page ID: ${pageId}`);

        revalidatePath("/cms/landing");
        return { success: true, nextPageId: nextPage?.id ?? null };
    } catch (error) {
        console.error("[DELETE_LANDING_PAGE]", error);
        return { success: false, error: "Failed to delete page", nextPageId: null };
    }
}
