import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantContext } from "@/lib/tenant";
import { EditorProvider } from "@/components/landing/EditorContext";
import { LandingLayoutClient } from "./LandingLayoutClient";

export default async function LandingLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; tenant: string }>;
}) {
    const { locale, tenant } = await params;
    const context = await getTenantContext(); // This handles session and team_id

    if (!context) return redirect(`/${locale}/cms/login`);

    // Fetch only pages belonging to the current team
    const pages = await prismadb.landingPage.findMany({
        where: { team_id: context.teamId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            updatedAt: true,
        },
    });

    return (
        <EditorProvider>
            <LandingLayoutClient sidebarProps={{ pages, locale, tenant }} >
                {children}
            </LandingLayoutClient>
        </EditorProvider>
    );
}
