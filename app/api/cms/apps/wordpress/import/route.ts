import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { WordPressService } from "@/lib/wordpress/service";
import { htmlToPuckBlocks } from "@/lib/wordpress/html-to-puck";
import { logActivity } from "@/actions/audit";

// Helper to fetch image and convert to Base64
async function fetchImageAsBase64(url: string, mimeType: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error("Image fetch error:", error);
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { type, items, url } = body; // type: 'media' | 'posts' | 'pages' | 'url', items: ids[] | "all"

        const userId = (session.user as any).id;
        const wpService = new WordPressService(userId);
        const results = {
            success: [] as string[],
            failed: [] as string[]
        };

        if (type === "media") {
            let mediaItemsToProcess: any[] = [];

            if (items === "all") {
                mediaItemsToProcess = await wpService.getMedia(1, 100);
            } else if (Array.isArray(items)) {
                for (const id of items) {
                    try {
                        const media = await wpService.getMediaById(id);
                        mediaItemsToProcess.push(media);
                    } catch (e) {
                        results.failed.push(id.toString());
                    }
                }
            } else {
                return new NextResponse("Invalid items for media import", { status: 400 });
            }

            for (const wpMedia of mediaItemsToProcess) {
                const id = wpMedia.id;
                try {
                    const base64Data = await fetchImageAsBase64(wpMedia.source_url, wpMedia.mime_type);

                    await (prismadb as any).mediaItem.create({
                        data: {
                            url: base64Data,
                            filename: wpMedia.title.rendered || `wp-media-${id}`,
                            mimeType: wpMedia.mime_type,
                            size: 0,
                            title: wpMedia.title.rendered,
                            altText: wpMedia.alt_text,
                            description: `Imported from WordPress (ID: ${id})`,
                            isPublic: true,
                            source: "wordpress",
                            userId: userId
                        }
                    });

                    results.success.push(id.toString());
                } catch (error) {
                    console.error(`Failed to import media ${id}:`, error);
                    results.failed.push(id.toString());
                }
            }
            await logActivity("WP_IMPORT", "WordPress", `Imported ${results.success.length} media items`);

        } else if (type === "pages" || type === "posts" || type === "url") {
            let postsToProcess: any[] = [];

            if (type === "url") {
                if (!url) return new NextResponse("URL is required for url import type", { status: 400 });

                // Extract slug
                const cleanUrl = url.replace(/\/$/, "");
                const slug = cleanUrl.split("/").pop();

                if (!slug) return new NextResponse("Could not parse slug from URL", { status: 400 });

                // Try finding logic
                let foundPost = await wpService.getPageBySlug(slug);
                let postType = 'page';

                if (!foundPost) {
                    foundPost = await wpService.getPostBySlug(slug);
                    postType = 'post';
                }

                if (foundPost) {
                    postsToProcess.push({ ...foundPost, type: postType });
                } else {
                    return new NextResponse("Content not found on WordPress", { status: 404 });
                }

            } else if (items === "all") {
                const allPosts = type === 'pages' ? await wpService.getPages(1, 50) : await wpService.getPosts(1, 50);
                postsToProcess = allPosts.map(p => ({ ...p, type: type === 'pages' ? 'page' : 'post' }));
            } else if (Array.isArray(items)) {
                for (const id of items) {
                    try {
                        const post = type === 'pages' ? await wpService.getPageById(id) : await wpService.getPostById(id);
                        postsToProcess.push({ ...post, type: type === 'pages' ? 'page' : 'post' });
                    } catch (e) {
                        results.failed.push(id.toString());
                    }
                }
            }

            for (const post of postsToProcess) {
                const id = post.id;
                try {
                    let contentHtml = post.content.rendered;
                    const title = post.title.rendered;
                    const slug = post.slug;
                    const postType = (post as any).type || 'page';
                    const pageLink = post.link || '';

                    // Try to get raw content with shortcodes first
                    try {
                        const rawPost = postType === 'page'
                            ? await wpService.getPageWithRawContent(id)
                            : await wpService.getPostWithRawContent(id);

                        // Check if raw content has shortcodes or more content
                        const rawContent = rawPost.content?.raw || '';
                        if (rawContent && rawContent.length > contentHtml.length) {
                            // Use raw content if it's richer (contains shortcodes)
                            contentHtml = `<!-- WP Shortcodes -->\n${rawContent}`;
                        }
                    } catch (e) {
                        // Raw content requires higher auth - fall back to scraping
                        console.log(`[WP_IMPORT] Raw content unavailable for ${id}, trying scrape...`);
                    }

                    // ALWAYS try scraping the actual page to capture page builder content
                    let usedScrapedContent = false;
                    const originalApiContent = post.content.rendered;

                    if (pageLink) {
                        try {
                            console.log(`[WP_IMPORT] ==============================`);
                            console.log(`[WP_IMPORT] Scraping: ${pageLink}`);
                            console.log(`[WP_IMPORT] API content length: ${originalApiContent.length} chars`);

                            const scrapedHtml = await wpService.scrapePageHtml(pageLink);
                            console.log(`[WP_IMPORT] Scraped content length: ${scrapedHtml.length} chars`);

                            // ALWAYS use scraped content if it's > 5000 chars (page builder content)
                            if (scrapedHtml && scrapedHtml.length > 5000) {
                                contentHtml = scrapedHtml;
                                usedScrapedContent = true;
                                console.log(`[WP_IMPORT] ✓ USING SCRAPED CONTENT (${scrapedHtml.length} chars)`);
                            } else if (scrapedHtml && scrapedHtml.length > originalApiContent.length) {
                                // Use scraped if it's larger than API
                                contentHtml = scrapedHtml;
                                usedScrapedContent = true;
                                console.log(`[WP_IMPORT] ✓ USING SCRAPED (larger than API)`);
                            } else {
                                console.log(`[WP_IMPORT] ✗ Scraped too small, using API content`);
                            }
                            console.log(`[WP_IMPORT] ==============================`);
                        } catch (e: any) {
                            console.log(`[WP_IMPORT] ✗ Scrape FAILED: ${e.message}`);
                        }
                    } else {
                        console.log(`[WP_IMPORT] No pageLink available for scraping`);
                    }
                    const excerpt = post.excerpt?.rendered || '';

                    // Extract featured image from _embedded data
                    let featuredImageUrl = '';
                    const featuredMedia = (post as any)._embedded?.['wp:featuredmedia'];
                    if (featuredMedia && featuredMedia.length > 0) {
                        featuredImageUrl = featuredMedia[0].source_url || '';
                    }

                    // Build Puck content blocks
                    const puckContent: any[] = [];

                    // If we used scraped content, convert HTML to individual Puck blocks
                    if (usedScrapedContent) {
                        // Parse HTML into individual editable blocks
                        const baseUrl = new URL(pageLink).origin;
                        const parsedBlocks = htmlToPuckBlocks(contentHtml, baseUrl);
                        console.log(`[WP_IMPORT] Converted to ${parsedBlocks.length} editable Puck blocks`);
                        puckContent.push(...parsedBlocks);
                    } else {
                        // Standard import: add structured blocks
                        // 1. Featured Image Block (if available)
                        if (featuredImageUrl) {
                            puckContent.push({
                                type: "ImageBlock",
                                props: {
                                    id: `hero-${id}`,
                                    src: featuredImageUrl,
                                    alt: title,
                                    aspectRatio: "16:9",
                                    rounded: "lg"
                                }
                            });
                        }

                        // 2. Heading Block
                        puckContent.push({
                            type: "HeadingBlock",
                            props: {
                                id: `heading-${id}`,
                                title: title,
                                size: "xl",
                                align: "left",
                                marginBottom: "4"
                            }
                        });

                        // 3. Excerpt/Intro Block (if available)
                        if (excerpt && excerpt.trim()) {
                            puckContent.push({
                                type: "RichTextBlock",
                                props: {
                                    id: `excerpt-${id}`,
                                    content: `<div class="text-lg text-slate-400 mb-8">${excerpt}</div>`
                                }
                            });
                        }

                        // 4. Main Content Block
                        puckContent.push({
                            type: "RichTextBlock",
                            props: {
                                id: `content-${id}`,
                                content: contentHtml
                            }
                        });
                    }

                    const puckData = {
                        root: { props: { title: title } },
                        content: puckContent
                    };


                    const existing = await (prismadb as any).landingPage.findFirst({
                        where: {
                            OR: [
                                { wordpressPostId: id },
                                { slug: slug }
                            ]
                        }
                    });

                    let finalSlug = slug;
                    // If slug collision but NOT same WP ID, rename
                    if (existing && existing.wordpressPostId !== id) {
                        finalSlug = `${slug}-${Date.now()}`;
                    }

                    if (existing && existing.wordpressPostId === id) {
                        await (prismadb as any).landingPage.update({
                            where: { id: existing.id },
                            data: {
                                title: title,
                                content: puckData,
                                wordpressPostId: id,
                                wordpressPostType: postType,
                                wordpressPostDate: new Date(post.date)
                            }
                        });
                    } else {
                        await (prismadb as any).landingPage.create({
                            data: {
                                title: title,
                                slug: finalSlug,
                                description: `Imported from WordPress ${postType} (ID: ${id})`,
                                content: puckData,
                                isPublished: false,
                                wordpressPostId: id,
                                wordpressPostType: postType,
                                wordpressPostDate: new Date(post.date)
                            }
                        });
                    }

                    results.success.push(id.toString());
                } catch (error) {
                    console.error(`Failed to import item ${id}:`, error);
                    results.failed.push(id.toString());
                }
            }
            await logActivity("WP_IMPORT", "WordPress", `Imported ${results.success.length} items`);
        } else {
            return new NextResponse("Invalid request type", { status: 400 });
        }

        return NextResponse.json({
            message: `Import complete. Success: ${results.success.length}, Failed: ${results.failed.length}`,
            results
        });

    } catch (error: any) {
        console.error("[WP_IMPORT]", error);

        // Handle specific HTML/Connection error
        if (error.message.includes("returned HTML")) {
            return new NextResponse(error.message, { status: 400 });
        }

        return new NextResponse(error.message || "Import failed", { status: 500 });
    }
}
