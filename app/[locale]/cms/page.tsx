import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prismadb } from "@/lib/prisma";

export default async function CMSPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect(`/${locale}/cms/login`);
    }

    // Fetch user's team to find the slug
    const user = await prismadb.users.findUnique({
        where: { id: (session.user as any).id },
        select: {
            assigned_team: {
                select: { slug: true }
            }
        }
    });

    const tenantSlug = user?.assigned_team?.slug || "my-workspace";

    // Redirect to the dashboard within the tenant's workspace
    return redirect(`/${locale}/cms/${tenantSlug}`);
}
