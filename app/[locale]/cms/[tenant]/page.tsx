import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";
import Changelog from "./components/Changelog";
import DashboardGrid from "./components/DashboardGrid";
import DashboardHeader from "./components/DashboardHeader";
import RecentContent from "./components/RecentContent";
import CommandCenter from "./components/CommandCenter"; // New Consolidated Component
import { prismadb } from "@/lib/prisma";
import { CMS_MODULES } from "@/app/[locale]/cms/config";
import { getUnreadTicketCount } from "@/actions/cms/support-tickets";
import { getDashboardStats } from "@/actions/cms/get-dashboard-stats";
import { getAnalyticsStats } from "@/actions/analytics/get-stats";

export default async function CMSDashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch user's enabled modules
  let enabledModules: string[] = [];
  let isAdmin = false;
  let unreadSupportCount = 0;

  if ((session?.user as any)?.id) {
    const user = await prismadb.users.findUnique({
      where: { id: (session?.user as any).id },
      select: { cmsModules: true, is_admin: true, email: true },
    });

    // Super Admin and Admins get all modules
    if (user?.email === "info@basalthq.com" || user?.is_admin) {
      enabledModules = CMS_MODULES.map(m => m.slug);
      isAdmin = true;
      unreadSupportCount = await getUnreadTicketCount();
    } else {
      enabledModules = user?.cmsModules || [];
    }
  }

  // Parallel data fetching for performance
  const [dashboardStats, analyticsStats] = await Promise.all([
    getDashboardStats(),
    isAdmin ? getAnalyticsStats() : Promise.resolve(null)
  ]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Header Section */}
      <DashboardHeader userName={session?.user?.name?.split(" ")[0] || "Admin"} unreadSupportCount={unreadSupportCount} />

      {/* 2. Command Center (Collapsible) - Replaces Top Analytics & Quick Actions */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <CommandCenter
          analyticsStats={analyticsStats}
          resourceStats={dashboardStats}
          isAdmin={isAdmin}
        />
      </section>

      {/* 3. Navigation Grid & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        {/* Main Modules Grid */}
        <div className="lg:col-span-8">
          <DashboardGrid enabledModules={enabledModules} isAdmin={isAdmin} unreadSupportCount={unreadSupportCount} />
        </div>

        {/* Side Panel: Jump Back + Changelog */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-none">
            <RecentContent items={dashboardStats?.recentActivity || []} />
          </div>
          <div className="flex-1 min-h-[350px]">
            <Changelog />
          </div>
        </div>
      </section>
    </div>
  );
}
