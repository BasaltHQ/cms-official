import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { WordPressService } from "@/lib/wordpress/service";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        const userId = session?.user?.id;

        const connection = await prismadb.appConnection.findFirst({
            where: {
                userId: userId,
                providerId: "wordpress",
                isActive: true
            }
        });

        if (!connection || !connection.credentials) {
            return NextResponse.json({ isConnected: false, url: "", counts: { pages: 0, posts: 0, media: 0 } });
        }

        const creds = connection.credentials as any;

        let counts = { pages: 0, posts: 0, media: 0 };
        if (userId) {
            try {
                const wpService = new WordPressService(userId);
                counts = await wpService.getCounts();
            } catch (e) {
                console.error("Failed to fetch WP counts for status", e);
            }
        }

        return NextResponse.json({
            isConnected: true,
            url: creds.url,
            counts
        });

    } catch (error) {
        console.error("[WP_STATUS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
