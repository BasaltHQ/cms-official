"use server";
import { prismadb } from "@/lib/prisma";
import { getTemplateById } from "@/lib/templates";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from "@/actions/audit";

export async function createLandingPage(locale: string, templateId?: string) {
    const slug = `page-${uuidv4().slice(0, 8)}`;

    let initialContent = {
        content: [],
        root: { props: { title: "Untitled Page" } }
    };
    let pageTitle = "Untitled Page";

    if (templateId) {
        const template = getTemplateById(templateId);
        if (template) {
            initialContent = template.data as any;
            pageTitle = `${template.name} Copy`;
        }
    }

    const page = await prismadb.landingPage.create({
        data: {
            title: pageTitle,
            slug: slug,
            content: initialContent,
        },
    });

    await logActivity("Create Landing Page", "Landing Page", `Created page: ${page.title}`);

    // Revalidate to ensure sidebar picks up the new page
    revalidatePath(`/${locale}/cms/landing`);

    redirect(`/${locale}/cms/landing/${page.id}`);
}
