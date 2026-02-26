import { prismadb } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PuckEditor from "@/components/landing/PuckEditor";
import { Data } from "@measured/puck";

export default async function LandingEditorPage({
    params
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { id, locale } = await params;

    const page = await prismadb.landingPage.findUnique({
        where: { id: id },
    });

    if (!page) {
        return <div>Page not found</div>;
    }

    const aiModels = await prismadb.aiModel.findMany({
        where: { isActive: true },
        select: { name: true, modelId: true, provider: true }
    });

    const allPages = await prismadb.landingPage.findMany({
        select: { id: true, slug: true, content: true }, // content needed for title if stored there, or just use slug/id
    });

    // Extract title from content if possible, or fallback
    const pagesList = allPages.map(p => {
        const content = p.content as any;
        return {
            id: p.id,
            title: content?.root?.props?.title || p.slug || "Untitled",
            slug: p.slug
        };
    });

    const wpPage = page as any;
    return <PuckEditor
        params={{ id }}
        initialData={page.content as any}
        pageSlug={page.slug}
        lastPublishedAt={page.updatedAt || undefined}
        aiModels={aiModels}
        allPages={pagesList}
        wordpressPostId={wpPage.wordpressPostId}
        wordpressPostType={wpPage.wordpressPostType}
    />;
}
