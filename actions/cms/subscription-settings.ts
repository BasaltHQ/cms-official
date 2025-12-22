"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

export async function getSubscriptionSettings() {
    try {
        let settings = await prismadb.socialSettings.findFirst();
        if (!settings) {
            settings = await prismadb.socialSettings.create({
                data: {
                    newsletterEnabled: true,
                    blogUpdatesEnabled: true,
                    careerUpdatesEnabled: true,
                    ctaText: "Stay Updated"
                }
            });
        }
        return { success: true, data: settings };
    } catch (error) {
        return { success: false, error: "Failed to fetch settings" };
    }
}

export async function updateSubscriptionSettings(data: {
    newsletterEnabled?: boolean;
    blogUpdatesEnabled?: boolean;
    careerUpdatesEnabled?: boolean;
    ctaText?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const first = await prismadb.socialSettings.findFirst();

        if (first) {
            await prismadb.socialSettings.update({
                where: { id: first.id },
                data,
            });
        } else {
            await prismadb.socialSettings.create({ data });
        }

        await logActivity("UPDATE_SUBSCRIPTION_SETTINGS", "Subscription", "Updated global subscription settings");
        revalidatePath("/cms/subscriptions");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to save settings" };
    }
}
