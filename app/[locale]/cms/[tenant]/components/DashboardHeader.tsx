"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, GraduationCap, Shield } from "lucide-react";
import { ActiveUsersModal } from "@/components/cms/ActiveUsersModal";
import { BlogAnalyticsModal } from "@/components/cms/BlogAnalyticsModal";
import { getBlogStats } from "@/actions/analytics/get-blog-stats";
import { useParams } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
    userName: string;
    unreadSupportCount?: number;
}

export default function DashboardHeader({ userName, unreadSupportCount }: DashboardHeaderProps) {
    const params = useParams();
    const [showActiveUsers, setShowActiveUsers] = useState(false);
    const [showBlogAnalytics, setShowBlogAnalytics] = useState(false);
    const [stats, setStats] = useState({ totalClicks: 0, totalShares: 0, totalPostsWithEvents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getBlogStats();
                if (data?.summary) {
                    setStats(data.summary);
                }
            } catch (error) {
                console.error("Failed to fetch blog stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter leading-tight mb-2 pr-2 pb-1">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg">
                        Manage your digital presence from the <span className="text-cyan-400 font-bold">Basalt Command Center</span>.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 self-start md:self-auto bg-[#0A0A0B]/40 backdrop-blur-md p-2 rounded-full border border-white/5">
                    {/* University Button */}
                    <Link href={`/${params?.locale}/cms/${params?.tenant}/university`}>
                        <button
                            className="relative p-2.5 rounded-full hover:bg-white/10 transition-all group"
                            title="University & SOPs"
                        >
                            <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Link>

                    {/* Security Button */}
                    <Link href={`/${params?.locale}/cms/${params?.tenant}/settings/security`}>
                        <button
                            className="relative p-2.5 rounded-full hover:bg-white/10 transition-all group"
                            title="Security Settings"
                        >
                            <Shield className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                        </button>
                    </Link>

                    {/* Support Inbox Button */}
                    <button
                        onClick={() => setShowActiveUsers(false)} // Or open specific modal
                        className="relative p-2.5 rounded-full hover:bg-white/10 transition-all group"
                        title="Support Inbox"
                    >
                        <MessageCircle className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                        {unreadSupportCount && unreadSupportCount > 0 ? (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0B] animate-pulse" />
                        ) : null}
                    </button>

                    {/* Active Users Button (Keeping as requested 'clever stuff') */}
                    <button
                        onClick={() => setShowActiveUsers(true)}
                        className="relative p-2.5 rounded-full hover:bg-white/10 transition-all group"
                        title="Active Users"
                    >
                        <Users className="h-5 w-5 text-slate-400 group-hover:text-white" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border border-[#0A0A0B] animate-pulse" />
                    </button>
                </div>
            </div>

            <ActiveUsersModal isOpen={showActiveUsers} onClose={() => setShowActiveUsers(false)} />
            <BlogAnalyticsModal isOpen={showBlogAnalytics} onClose={() => setShowBlogAnalytics(false)} />
        </div>
    );
}

