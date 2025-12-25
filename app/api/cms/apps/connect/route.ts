import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { logActivityInternal } from "@/actions/audit";
import { encryptApiKey } from "@/lib/encryption/api-keys";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { providerId, displayName, category, credentials } = body;

        if (!providerId || !credentials) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Validation per provider
        if (providerId === "wordpress") {
            if (!credentials.url || !credentials.username || !credentials.application_password) {
                return NextResponse.json({ error: "Missing WordPress credentials (url, username, application_password)" }, { status: 400 });
            }
            // Encrypt immediately for consistency with other sensitive fields
            credentials.application_password = encryptApiKey(credentials.application_password);
        } else if (providerId === "woocommerce") {
            if (!credentials.url || !credentials.key || !credentials.secret) {
                return NextResponse.json({ error: "Missing WooCommerce credentials (url, key, secret)" }, { status: 400 });
            }
        } else if (providerId === "medium") {
            if (!credentials.token) {
                return NextResponse.json({ error: "Missing Medium integration token" }, { status: 400 });
            }
        } else if (providerId === "zapier") {
            if (!credentials.webhookUrl) {
                return NextResponse.json({ error: "Missing Zapier Webhook URL" }, { status: 400 });
            }
        } else if (providerId === "bigcommerce") {
            if (!credentials.storeHash || !credentials.accessToken) {
                return NextResponse.json({ error: "Missing BigCommerce credentials (storeHash, accessToken)" }, { status: 400 });
            }
        }

        // Check for existing active connection
        const existing = await prismadb.appConnection.findFirst({
            where: {
                userId: session.user.id,
                providerId,
                isActive: true
            }
        });

        // Encrypt sensitive fields
        const safeCredentials = { ...credentials };

        if (safeCredentials.key) {
            safeCredentials.key = encryptApiKey(safeCredentials.key);
        }
        if (safeCredentials.secret) {
            safeCredentials.secret = encryptApiKey(safeCredentials.secret);
        }
        if (safeCredentials.accessToken) {
            safeCredentials.accessToken = encryptApiKey(safeCredentials.accessToken);
        }

        let connection;

        if (existing) {
            // Update existing connection
            connection = await prismadb.appConnection.update({
                where: { id: existing.id },
                data: {
                    credentials: safeCredentials,
                    displayName: displayName || existing.displayName,
                    category: category || existing.category,
                    isActive: true
                }
            });
            await logActivityInternal(
                session.user.id,
                "UPDATE_APP",
                "APPS",
                `Updated ${displayName || providerId} connection`
            );
        } else {
            // Create new connection
            connection = await prismadb.appConnection.create({
                data: {
                    userId: session.user.id,
                    providerId,
                    displayName: displayName || providerId,
                    category,
                    credentials: safeCredentials,
                    isActive: true
                }
            });

            await logActivityInternal(
                session.user.id,
                "CONNECT_APP",
                "APPS",
                `Connected ${displayName} (${providerId})`
            );
        }

        return NextResponse.json({ success: true, connection });

    } catch (error) {
        console.error("[APPS_CONNECT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
