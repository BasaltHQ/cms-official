"use server";

import { prismadb } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function getAllLandingPages() {
    try {
        const context = await getTenantContext(false);
        if (!context) {
            return { error: "Unauthorized" };
        }

        const pages = await prismadb.landingPage.findMany({
            where: { team_id: context.teamId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                isPublished: true,
                updatedAt: true,
                createdAt: true,
                content: true, // Fetch content to extract thumbnail
            }
        });

        const pagesWithThumbnails = pages.map((page: any) => {
            let thumbnail = null;
            try {
                // Puck content structure: { content: [ ...blocks... ], root: { ... } }
                // or sometimes just an array of blocks depending on version? Assuming Puck v0.16+ standard structure.
                // However, we can simply search the JSON string or object for image-like keys.

                // Safe parsing if it's a string, though Prisma handles Json type
                const contentData = page.content;

                if (contentData && Array.isArray(contentData)) {
                    // Deprecated array structure
                    for (const block of contentData) {
                        if (block.type === "HeroBlock" && block.props?.bgImage) {
                            thumbnail = block.props.bgImage;
                            break;
                        }
                        if (block.type === "ImageBlock" && block.props?.src) {
                            thumbnail = block.props.src;
                            break;
                        }
                    }
                } else if (contentData && contentData.content && Array.isArray(contentData.content)) {
                    // Standard Puck structure
                    for (const block of contentData.content) {
                        if (block.type === "HeroBlock" && block.props?.bgImage) {
                            thumbnail = block.props.bgImage;
                            break;
                        }
                        if (block.type === "ImageBlock" && block.props?.src) {
                            thumbnail = block.props.src;
                            break;
                        }
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }

            return {
                ...page,
                content: undefined, // Remove heavy content from payload
                thumbnail
            };
        });

        return { success: true, pages: pagesWithThumbnails };
    } catch (error) {
        console.error("Failed to fetch landing pages", error);
        return { error: "Failed to fetch pages" };
    }
}
