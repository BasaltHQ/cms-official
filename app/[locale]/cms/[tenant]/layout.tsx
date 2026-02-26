import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, Mail, Contact2, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import SignOutButton from "./_components/SignOutButton";
import { prismadb } from "@/lib/prisma";
import { CMS_MODULES, CMSModule } from "@/app/[locale]/cms/config";
import AdminSidebar from "./_components/AdminSidebar";
import MobileHeader from "./_components/MobileHeader";


export default async function AdminDashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; tenant: string }>;
}) {
    const { locale, tenant } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return redirect(`/${locale}/cms/login`);
    }

    // Fetch user's enabled CMS modules and verify tenant
    let enabledModules: string[] = [];
    let dbUser = null;

    if (session.user?.id) {
        dbUser = await prismadb.users.findUnique({
            where: { id: session.user.id },
            include: {
                assigned_team: {
                    select: { slug: true, id: true, name: true }
                }
            }
        });

        if (!dbUser) return redirect(`/${locale}/cms/login`);

        // Force Password Reset Check
        if (dbUser.forcePasswordReset) {
            return redirect(`/${locale}/cms/change-password`);
        }

        // Verify Tenant Slug
        const userSlug = dbUser.assigned_team?.slug || "my-workspace";
        if (userSlug !== tenant) {
            return redirect(`/${locale}/cms/${userSlug}`);
        }

        // Owner and Admins see all modules
        if (dbUser.email === "info@basalthq.com" || dbUser.is_admin) {
            enabledModules = CMS_MODULES.map((m) => m.slug);
        } else {
            enabledModules = dbUser.cmsModules || [];
        }
    }

    // Filter modules based on user access and resolve hrefs using the tenant slug
    const visibleModules = CMS_MODULES.filter(
        (m) => enabledModules.includes(m.slug)
    ).map(m => ({
        ...m,
        href: m.href(locale, tenant),
        options: m.options?.map((opt) => ({
            ...opt,
            href: opt.href(locale, tenant)
        }))
    }));

    return (
        <div className="flex h-screen supports-[height:100dvh]:h-[100dvh] bg-black text-slate-200 overflow-hidden relative">
            {/* Ambient Background - Enforced Dark */}
            <div className="absolute inset-0 bg-[#0A0A0B] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] z-0" />

            {/* Mobile Header - Visible only on mobile */}
            <MobileHeader
                session={session}
                visibleModules={visibleModules}
                locale={locale}
            />

            {/* Admin Sidebar (Client Component) - Handles Desktop & Mobile Sidebar State */}
            <AdminSidebar
                session={session}
                dbUser={dbUser}
                visibleModules={visibleModules}
                locale={locale}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10 pb-20 md:pb-0 pt-16 md:pt-0">

                {children}
            </main>
        </div>
    );
}
