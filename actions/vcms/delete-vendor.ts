"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/actions/audit";

export async function deleteVendor(vendorId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const vendor = await prismadb.vendorProfile.delete({
            where: { id: vendorId }
        });

        await logActivity("DELETE_VENDOR", `Vendor: ${vendor.name || vendorId}`, `Deleted vendor ${vendorId}`);

        revalidatePath("/[locale]/cms/vendors", "page");
        return { success: true };

    } catch (error) {
        console.error("[DELETE_VENDOR_ERROR]", error);
        return { success: false, error: "Failed to delete vendor" };
    }
}
