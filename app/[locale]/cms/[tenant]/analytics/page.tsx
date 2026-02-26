"use client";

import { MousePointerClick, Share2, FileText, TrendingUp, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getBlogStats } from "@/actions/analytics/get-blog-stats";
import { Card, AreaChart, DonutChart, Legend } from "@tremor/react";
import { cn } from "@/lib/utils";

interface BlogStats {
    chartData: Array<{ date: string; Clicks: number; Shares: number }>;
    topPosts: Array<{ url: string; title: string; clicks: number; shares: number; total: number }>;
    sharePlatforms: Array<{ name: string; value: number }>;
    kpiData: Array<{ title: string; metric: string; delta: string; deltaType: string; icon: string }>;
    summary: { totalClicks: number; totalShares: number; totalPostsWithEvents: number };
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<BlogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setRefreshing(true);
            const data = await getBlogStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch blog stats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const iconMap: Record<string, React.ReactNode> = {
        MousePointerClick: <MousePointerClick className="h-6 w-6" />,
        Share2: <Share2 className="h-6 w-6" />,
        FileText: <FileText className="h-6 w-6" />,
    };

    const platformColors = ["cyan", "blue", "indigo", "violet", "fuchsia"];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-cyan-500" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Real-time tracked events for blog engagement (CTR & Shares).
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="p-2 rounded-lg bg-cyan-900/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all text-cyan-400"
                    title="Refresh data"
                >
                    <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            ) : stats ? (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.kpiData.map((kpi, idx) => (
                            <div
                                key={idx}
                                className="bg-cyan-900/10 border border-cyan-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity text-cyan-400">
                                    {iconMap[kpi.icon]}
                                </div>
                                <p className="text-sm font-mono text-cyan-600 mb-2 uppercase">{kpi.title}</p>
                                <div className="text-4xl font-bold text-white font-mono">
                                    {kpi.metric}
                                </div>
                                <span className={cn(
                                    "text-xs font-mono mt-3 inline-block px-2 py-0.5 rounded-full",
                                    kpi.deltaType === "increase" ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-500/20 text-slate-400"
                                )}>
                                    {kpi.delta}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trend Chart */}
                        <Card className="bg-[#0F1115] ring-1 ring-cyan-500/20 shadow-sm border-none lg:col-span-2 p-6">
                            <p className="text-sm font-mono text-cyan-600 mb-1">ENGAGEMENT_TREND</p>
                            <p className="text-xs text-slate-500 mb-6">Daily clicks & shares over 30 days</p>
                            {stats.chartData.length > 0 ? (
                                <AreaChart
                                    className="h-72"
                                    data={stats.chartData}
                                    index="date"
                                    categories={["Clicks", "Shares"]}
                                    colors={["cyan", "blue"]}
                                    yAxisWidth={40}
                                    showAnimation={true}
                                />
                            ) : (
                                <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
                                    No data yet. Events will appear here after users interact with blog posts.
                                </div>
                            )}
                        </Card>

                        {/* Share Distribution */}
                        <Card className="bg-[#0F1115] ring-1 ring-cyan-500/20 shadow-sm border-none p-6">
                            <p className="text-sm font-mono text-cyan-600 mb-1">SHARE_PLATFORMS</p>
                            <p className="text-xs text-slate-500 mb-6">Distribution by network</p>
                            {stats.sharePlatforms.length > 0 ? (
                                <>
                                    <DonutChart
                                        data={stats.sharePlatforms}
                                        category="value"
                                        index="name"
                                        colors={platformColors}
                                        variant="pie"
                                        className="h-48"
                                    />
                                    <Legend
                                        categories={stats.sharePlatforms.map(p => p.name)}
                                        colors={platformColors}
                                        className="mt-6"
                                    />
                                </>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-500 text-sm text-center">
                                    No shares yet
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Top Posts Table */}
                    <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-cyan-500/10">
                            <p className="text-sm font-mono text-cyan-600">TOP_PERFORMING_POSTS</p>
                            <p className="text-xs text-slate-500">Ranked by total engagement</p>
                        </div>
                        {stats.topPosts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-cyan-900/20">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-cyan-500 font-mono text-xs">#</th>
                                            <th className="text-left py-4 px-6 text-cyan-500 font-mono text-xs">POST</th>
                                            <th className="text-right py-4 px-6 text-cyan-500 font-mono text-xs">CLICKS</th>
                                            <th className="text-right py-4 px-6 text-cyan-500 font-mono text-xs">SHARES</th>
                                            <th className="text-right py-4 px-6 text-cyan-500 font-mono text-xs">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.topPosts.map((post, idx) => (
                                            <tr key={idx} className="border-t border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                                                <td className="py-4 px-6 text-slate-400 font-mono">{idx + 1}</td>
                                                <td className="py-4 px-6">
                                                    <div className="text-white font-medium capitalize">{post.title}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{post.url}</div>
                                                </td>
                                                <td className="py-4 px-6 text-right text-cyan-400 font-mono">{post.clicks}</td>
                                                <td className="py-4 px-6 text-right text-cyan-400 font-mono">{post.shares}</td>
                                                <td className="py-4 px-6 text-right text-white font-bold font-mono">{post.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500 text-sm">
                                No blog engagement data yet. Events will appear here after users click links or share posts.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    Failed to load analytics data. Please try again.
                </div>
            )}
        </div>
    );
}
