"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { WordPressService } from "@/lib/wordpress/service";
import { Data } from "@measured/puck";
import { puckToFlatsomeShortcode } from "@/lib/wordpress/puck-to-flatsome";

export async function syncToWordPress(pageId: string, puckData: Data, manualWpUrl?: string) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const page = await prismadb.landingPage.findUnique({
            where: { id: pageId }
        });

        if (!page) return { success: false, error: "Page not found" };

        let wpPageId = (page as any).wordpressPostId;
        let wpPostType = (page as any).wordpressPostType;

        const wpService = new WordPressService((session.user as any).id);

        // DIAGNOSTIC: Check who we are in WordPress
        try {
            const me = await wpService.getCurrentUser();
            console.log(`[WP_SYNC_DIAGNOSTIC] Authenticated as: ${me.name} (ID: ${me.id}) | Roles: ${me.roles?.join(', ')}`);

            // If user is not an administrator or editor, they likely can't sync
            const canEdit = me.roles?.some((role: string) => ['administrator', 'editor', 'author'].includes(role));
            if (!canEdit) {
                console.warn(`[WP_SYNC_WARNING] User ${me.name} has roles [${me.roles?.join(', ')}] which may lack edit permissions.`);
            }
        } catch (diagError) {
            console.error("[WP_SYNC_DIAGNOSTIC_FAIL] Could not verify WP user role. Auth might be totally broken.");
        }

        // Handle Linking if manual URL provided
        if (!wpPageId && manualWpUrl) {
            // Remove trailing slash
            const cleanUrl = manualWpUrl.replace(/\/$/, "");
            const slug = cleanUrl.split("/").pop(); // Simplistic slug extraction

            // NOTE: In future we could try to look up page by slug here.
            // For now, we proceed to create a new page if ID is missing.
        }

        // If still no ID, create new!
        if (!wpPageId) {
            const newPage = await wpService.createPage({
                title: (puckData.root?.props?.title || page.title || "New Page") as any,
                content: "" as any,
                status: 'publish'
            });

            wpPageId = newPage.id;
            wpPostType = 'page';

            // Save link to DB
            await prismadb.landingPage.update({
                where: { id: pageId },
                data: {
                    wordpressPostId: wpPageId,
                    wordpressPostType: 'page',
                    wordpressPostDate: new Date()
                } as any
            });
        }

        const wpPage = { wordpressPostId: wpPageId, wordpressPostType: wpPostType };

        // Generate Flatsome Shortcodes from Puck Data
        // This makes the content editable in the UX Builder
        const title = puckData.root?.props?.title || page.title;
        const contentHtml = puckToFlatsomeShortcode(puckData);

        const updateData: any = {
            title: title,
        };

        if (contentHtml) {
            updateData.content = contentHtml;
        }

        let result;
        if (wpPage.wordpressPostType === 'page') {
            result = await wpService.updatePage(wpPage.wordpressPostId, updateData);
        } else {
            result = await wpService.updatePost(wpPage.wordpressPostId, updateData);
        }

        // If it was an XML-RPC success, it might have a different structure
        if ((result as any).success && (result as any).raw) {
            return {
                success: true,
                data: result,
                message: "Synced successfully via XML-RPC (REST API fallback)"
            };
        }

        return { success: true, data: result };

    } catch (error: any) {
        console.error("[SYNC_TO_WP]", error);
        return { success: false, error: error.message };
    }
}
