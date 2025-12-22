"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

export async function updateVendor(vendorId: string, data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const vendor = await prismadb.vendorProfile.update({
            where: { id: vendorId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                website: data.website,
                address: data.address,
                title: data.title,
                primary_industry: data.primary_industry,
                angies_list_url: data.angies_list_url,
                google_reviews_url: data.google_reviews_url,
                google_rating: data.google_rating ? parseFloat(data.google_rating) : undefined,
                review_count: data.review_count ? parseInt(data.review_count) : undefined,
                // Add other fields as necessary
            }
        });

        // Audit Log
        await logActivity("UPDATE_VENDOR", `Vendor: ${vendor.name || vendorId}`, `Updated fields for vendor ${vendorId}`);

        revalidatePath("/[locale]/cms/vendors", "page");
        return { success: true, data: vendor };

    } catch (error) {
        console.error("[UPDATE_VENDOR_ERROR]", error);
        return { success: false, error: "Failed to update vendor" };
    }
}
