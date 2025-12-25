import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

// Initialize Neynar Client
// We Initialize strictly inside the handler to ensure we have the latest keys from DB
// Helper to get client (if needed)
const getNeynarClient = async () => {
    const settings = await prismadb.socialSettings.findFirst();
    const apiKey = settings?.neynarApiKey || settings?.baseApiKey;
    if (!apiKey) return null;
    return new NeynarAPIClient({ apiKey });
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { text, embeds, channelId } = body;

        const settings = await prismadb.socialSettings.findFirst();
        const apiKey = settings?.neynarApiKey || settings?.baseApiKey;

        if (!apiKey || !settings?.baseSignerUuid) {
            return new NextResponse("Missing Base/Neynar Configuration", { status: 400 });
        }

        const neynarClient = new NeynarAPIClient({ apiKey });

        // Prepare embeds (images/videos)
        const castEmbeds = embeds?.map((url: string) => ({ url })) || [];

        // Publish Cast
        const cast = await neynarClient.publishCast({
            signerUuid: settings.baseSignerUuid,
            text,
            embeds: castEmbeds,
            channelId: channelId || "base", // Default to 'base' channel if not specified
        });

        return NextResponse.json({ success: true, cast });

    } catch (error: any) {
        console.error("[BASE_POST_ERROR]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const settings = await prismadb.socialSettings.findFirst();
        const apiKey = settings?.neynarApiKey || settings?.baseApiKey;

        if (!apiKey || !settings?.baseSignerUuid) {
            // Return empty list if not configured, rather than erroring the UI
            return NextResponse.json({ posts: [] });
        }

        const neynarClient = new NeynarAPIClient({ apiKey });

        // Fetch posts by the signer (user)
        // We look up the user by the signer UUID to get their FID, then fetch their casts
        // Alternatively, Neynar has an endpoint to fetch casts by signer, but standard is by FID/User.
        // Let's try to lookup the user associated with the signer first.

        try {
            // lookupUserBySigner is deprecated/removed in v3. Use lookupSigner.
            const signer = await neynarClient.lookupSigner({ signerUuid: settings.baseSignerUuid });
            if (!signer || !signer.fid) return NextResponse.json({ posts: [] });

            const fid = signer.fid;

            const feed = await neynarClient.fetchCastsForUser({ fid, limit: 20 });

            return NextResponse.json({ posts: feed.casts });
        } catch (e) {
            console.error("Failed to fetch user by signer", e);
            return NextResponse.json({ posts: [] });
        }

    } catch (error: any) {
        console.error("[BASE_GET_ERROR]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
