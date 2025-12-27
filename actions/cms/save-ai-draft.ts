"use server";
import { prismadb } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from "@/actions/audit";

export async function saveAiBuilderDraft(data: any) {
    try {
        const slug = `ai-page-${uuidv4().slice(0, 8)}`;
        const title = data?.root?.props?.title || "AI Draft Page";

        const page = await prismadb.landingPage.create({
            data: {
                title: title,
                slug: slug,
                content: data,
                isPublished: false,
                updatedAt: new Date(),
            },
        });

        await logActivity("Create AI Draft", "Landing Page", `Created AI draft: ${title}`);
        
        revalidatePath(`/cms/landing`);
        
        return { success: true, pageId: page.id };
    } catch (error) {
        console.error("Failed to save AI draft:", error);
        return { success: false, error: "Failed to save draft" };
    }
}
