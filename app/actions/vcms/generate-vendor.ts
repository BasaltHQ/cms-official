'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processVendorMedia } from "@/lib/vcms/workflow";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

export async function generateVendorFromMedia(mediaId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const result = await processVendorMedia(mediaId, session.user.id);

        if (result.success && result.vendorId) {
            await logActivity("CREATE_VENDOR_FROM_MEDIA", `Vendor: ${result.vendorId}`, `Generated vendor from media ${mediaId}`);
            revalidatePath("/[locale]/cms/vendors", "page");
            return { ...result, id: result.vendorId }; // Map for frontend convenience if needed
        }

        return result;
    } catch (error) {
        console.error("Failed to generate vendor", error);
        return { success: false, error: "Internal Server Error" };
    }
}
