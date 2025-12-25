import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WordPressService } from "@/lib/wordpress/service";
import { prismadb } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "pages"; // 'pages' | 'posts' | 'media'
        const page = parseInt(searchParams.get("page") || "1");

        const wpService = new WordPressService((session.user as any).id);

        let data;
        if (type === "posts") {
            data = await wpService.getPosts(page);
        } else if (type === "media") {
            data = await wpService.getMedia(page);
        } else {
            data = await wpService.getPages(page);
        }

        // Check if items are already imported
        const items = Array.isArray(data) ? data : [];
        const wpIds = items.map((p: any) => p.id);

        const importedPages = await (prismadb as any).landingPage.findMany({
            where: {
                wordpressPostId: { in: wpIds }
            },
            select: {
                id: true,
                wordpressPostId: true
            }
        });

        // Map imported status
        const itemsWithStatus = items.map((p: any) => {
            const imported = importedPages.find((ip: any) => ip.wordpressPostId === p.id);
            return {
                ...p,
                importedId: imported ? imported.id : null
            };
        });

        return NextResponse.json({ items: itemsWithStatus });

    } catch (error: any) {
        console.error("[WP_CONTENT_GET]", error);
        return NextResponse.json({ error: error.message || "Failed to fetch WP content" }, { status: 500 });
    }
}
