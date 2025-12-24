import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { AiProvider } from "@prisma/client";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/encryption/api-keys";

/**
 * GET /api/cms/system-ai-config
 * Fetch all system AI configurations
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) { // Ideally check for Admin role here
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const configs = await prismadb.systemAiConfig.findMany();

        // Transform array to object map for easier frontend consumption
        const configMap: Record<string, any> = {};
        configs.forEach(conf => {
            let maskedKey = "";

            // Gracefully handle API keys that might not be encrypted or in legacy format
            if (conf.apiKey) {
                try {
                    // Check if the key is in the expected encrypted format (iv:encryptedData)
                    if (conf.apiKey.includes(':')) {
                        maskedKey = maskApiKey(decryptApiKey(conf.apiKey));
                    } else {
                        // Legacy/unencrypted key - just mask it directly
                        maskedKey = maskApiKey(conf.apiKey);
                    }
                } catch (decryptError) {
                    console.warn(`Could not decrypt API key for ${conf.provider}, showing placeholder`);
                    maskedKey = "••••••••••••"; // Fallback mask
                }
            }

            configMap[conf.provider] = {
                ...conf,
                apiKey: maskedKey
            };
        });

        return NextResponse.json(configMap);
    } catch (error) {
        console.error("Error fetching system AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/cms/system-ai-config
 * Upsert a system AI configuration
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) { // Admin check recommended
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { provider, apiKey, defaultModelId, baseUrl, configuration, isActive } = body;

        const validProviders = Object.values(AiProvider);
        if (!provider || !validProviders.includes(provider as AiProvider)) {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }

        const encryptedKey = apiKey ? encryptApiKey(apiKey) : "";

        // Upsert logic
        const config = await prismadb.systemAiConfig.upsert({
            where: { provider: provider as AiProvider },
            update: {
                apiKey: encryptedKey,
                defaultModelId,
                baseUrl,
                isActive,
                configuration
            },
            create: {
                provider: provider as AiProvider,
                apiKey: encryptedKey,
                defaultModelId,
                baseUrl,
                isActive: isActive ?? true,
                configuration
            }
        });

        // LOGGING
        await prismadb.systemActivity.create({
            data: {
                userId: session.user.id,
                action: "UPSERT_AI_CONFIG",
                resource: "SYSTEM_AI_CONFIG",
                details: `Updated configuration for ${provider}`
            }
        });

        return NextResponse.json(config);

    } catch (error) {
        console.error("Error updating system AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/cms/system-ai-config?provider=...
 * Delete a system AI configuration
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) { // Admin check recommended
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const provider = searchParams.get("provider");

        if (!provider || !Object.values(AiProvider).includes(provider as AiProvider)) {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }

        await prismadb.systemAiConfig.delete({
            where: { provider: provider as AiProvider }
        });

        // LOGGING
        await prismadb.systemActivity.create({
            data: {
                userId: session.user.id,
                action: "DELETE_AI_CONFIG",
                resource: "SYSTEM_AI_CONFIG",
                details: `Deleted configuration for ${provider}`
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        // P2025 is "Record to delete does not exist", which is fine to ignore or handle
        if ((error as any).code === 'P2025') {
            return NextResponse.json({ success: true });
        }
        console.error("Error deleting system AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
