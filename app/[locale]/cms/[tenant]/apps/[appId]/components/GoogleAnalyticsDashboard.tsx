"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, ArrowRight, Eye, Clock, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface GA4Data {
    realtimeUsers: number;
    users7d: number;
    sessions7d: number;
    pageViews7d: number;
    bounceRate: number;
    avgSessionDuration: string;
    topPages: Array<{ path: string; views: number }>;
}

export function GoogleAnalyticsDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("google-analytics");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<GA4Data>("google-analytics", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#E37400]/10 rounded-3xl flex items-center justify-center border border-[#E37400]/20">
                    <BarChart3 className="w-10 h-10 text-[#E37400]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect Google Analytics</h2>
                    <p className="text-slate-400">Link your GA4 property to see real-time traffic, user demographics, and content performance.</p>
                </div>
                <Button size="lg" className="bg-[#E37400] hover:bg-[#E37400]/90 text-white" onClick={() => setIsConfigOpen(true)}>
                    Connect Property <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "google-analytics", name: "Google Analytics 4", icon: "https://cdn.simpleicons.org/googleanalytics/E37400", description: "Traffic analytics.", category: "Analytics", status: "active", connected: false, author: "Google", rating: 4.5, installs: "10M+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">Traffic Overview</h2><p className="text-slate-400">Real-time data from your connected stream</p></div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full animate-pulse"><div className="w-2 h-2 rounded-full bg-green-500" /> Live</span>
                    <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Real-time</CardTitle><Users className="h-4 w-4 text-green-500" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-500">{isLoading ? "--" : data.realtimeUsers}</div><p className="text-xs text-slate-500">Active now</p></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Users (7d)</CardTitle><Users className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.users7d.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Page Views</CardTitle><Eye className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.pageViews7d.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Session</CardTitle><Clock className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.avgSessionDuration}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.topPages.length > 0 ? (
                        <div className="space-y-2">
                            {data.topPages.map((page, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-white truncate">{page.path}</span>
                                    <span className="text-sm text-slate-400">{page.views.toLocaleString()} views</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No page data available.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
