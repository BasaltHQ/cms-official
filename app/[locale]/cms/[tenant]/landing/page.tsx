import { LandingPageDashboard } from "@/components/landing/LandingPageDashboard";
import { prismadb } from "@/lib/prisma";

export default async function LandingIndexPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Fetch Stats
    const totalPages = await prismadb.landingPage.count();
    const publishedPages = await prismadb.landingPage.count({ where: { isPublished: true } });
    const draftPages = await prismadb.landingPage.count({ where: { isPublished: false } });

    // Fetch Recent Pages (Last 5)
    const recentPages = await prismadb.landingPage.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
            id: true,
            title: true,
            updatedAt: true,
            isPublished: true,
        },
    });

    return (
        <div className="h-full overflow-y-auto bg-black">
            <LandingPageDashboard
                locale={locale}
                stats={{
                    total: totalPages,
                    published: publishedPages,
                    drafts: draftPages,
                }}
                recentPages={recentPages}
            />
        </div>
    );
}
