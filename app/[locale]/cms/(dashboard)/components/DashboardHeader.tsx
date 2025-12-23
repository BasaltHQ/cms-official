"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, MousePointerClick, Share2, FileText, GraduationCap, Shield } from "lucide-react";
import { ActiveUsersModal } from "@/components/cms/ActiveUsersModal";
import { BlogAnalyticsModal } from "@/components/cms/BlogAnalyticsModal";
import { getBlogStats } from "@/actions/analytics/get-blog-stats";
import { useParams } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
    userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 mt-1.5 font-medium">
                        Manage your website content from here.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    {/* University Button */}
                    <Link href={`/${params?.locale}/cms/university`}>
                        <button
                            className="relative p-2 rounded-full bg-black hover:bg-white/5 border border-white/5 transition-all group"
                            title="University & SOPs"
                        >
                            <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </button>
                    </Link>

                    {/* Security Button */}
                    <Link href={`/${params?.locale}/cms/settings/security`}>
                        <button
                            className="relative p-2 rounded-full bg-black hover:bg-white/5 border border-white/5 transition-all group"
                            title="Security Settings"
                        >
                            <Shield className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                        </button>
                    </Link>

                    {/* Active Users Button */}
                    <button
                        onClick={() => setShowActiveUsers(true)}
                        className="relative p-2 rounded-full bg-black hover:bg-white/5 border border-white/5 transition-all group"
                        title="Active Users"
                    >
                        <Users className="h-5 w-5 text-slate-400 group-hover:text-white" />
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-[#0A0A0B] animate-pulse" />
                    </button>
                </div>
            </div>

            <button
                onClick={() => setShowBlogAnalytics(true)}
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 hover:shadow-[0_12px_40px_hsla(191,65%,46%,0.28)] transition-all cursor-pointer group"
                title="View Blog Analytics"
            >
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all shrink-0">
                        <TrendingUp className="h-6 w-6 text-cyan-400" />
                    </div>

                    {/* View Details CTA - Visible on Mobile inline next to icon */}
                    <div className="md:hidden ml-auto flex items-center gap-2 text-cyan-500/60 transition-colors">
                        <span className="text-xs font-mono uppercase tracking-wider">View</span>
                        <TrendingUp className="h-3 w-3" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center gap-2 py-2">
                        <div className="h-4 w-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                        <span className="text-sm text-slate-400">Loading analytics...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats Display - Vertical on Mobile, Horizontal on Desktop */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-8 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                            <div className="flex items-center justify-between md:justify-start gap-3">
                                <div className="flex items-center gap-2">
                                    <MousePointerClick className="h-4 w-4 text-cyan-400" />
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Clicks</span>
                                </div>
                                <div className="text-lg md:text-xl font-bold font-mono text-white">{stats.totalClicks.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between md:justify-start gap-3">
                                <div className="flex items-center gap-2">
                                    <Share2 className="h-4 w-4 text-emerald-400" />
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Shares</span>
                                </div>
                                <div className="text-lg md:text-xl font-bold font-mono text-white">{stats.totalShares.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center justify-between md:justify-start gap-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-violet-400" />
                                    <span className="text-xs text-slate-400 uppercase tracking-wide">Engagement</span>
                                </div>
                                <div className="text-lg md:text-xl font-bold font-mono text-white">{stats.totalPostsWithEvents}</div>
                            </div>
                        </div>

                        {/* View Analytics CTA - Desktop Only */}
                        <div className="hidden md:flex items-center gap-2 text-cyan-500/60 group-hover:text-cyan-400 transition-colors">
                            <span className="text-xs font-mono uppercase tracking-wider whitespace-nowrap">View Report</span>
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </>
                )}
            </button>

            <ActiveUsersModal isOpen={showActiveUsers} onClose={() => setShowActiveUsers(false)} />
            <BlogAnalyticsModal isOpen={showBlogAnalytics} onClose={() => setShowBlogAnalytics(false)} />
        </div>
    );
}

