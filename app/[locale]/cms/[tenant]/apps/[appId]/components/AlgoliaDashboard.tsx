"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Database, ArrowRight, RefreshCw, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface AlgoliaData {
    index: { name: string; entries: number; dataSize: string; lastBuildTime: string };
    usage: { searchOperations: number; records: number };
    avgResponseTime: number;
    topQueries: Array<{ query: string; count: number }>;
}

export function AlgoliaDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("algolia");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<AlgoliaData>("algolia", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#5468FF]/10 rounded-3xl flex items-center justify-center border border-[#5468FF]/20">
                    <Search className="w-10 h-10 text-[#5468FF]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Configure Search Index</h2>
                    <p className="text-slate-400">Connect Algolia to power instant search experiences on your site.</p>
                </div>
                <Button size="lg" className="bg-[#5468FF] hover:bg-[#5468FF]/90 text-white" onClick={() => setIsConfigOpen(true)}>
                    Connect Algolia <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "algolia", name: "Algolia", icon: "https://cdn.simpleicons.org/algolia/5468FF", description: "Search & Discovery.", category: "Utility", status: "active", connected: false, author: "Algolia", rating: 4.9, installs: "1M+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">Search Analytics</h2><p className="text-slate-400">Index: {data?.index.name || "main"}</p></div>
                <Button className="bg-[#5468FF] hover:bg-[#5468FF]/90 text-white" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Records</CardTitle><Database className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.usage.records.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Searches (30d)</CardTitle><Search className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.usage.searchOperations.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Response</CardTitle><Zap className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : `${data.avgResponseTime}ms`}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Top Queries</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.topQueries.length > 0 ? (
                        <div className="space-y-2">
                            {data.topQueries.map((q, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-white">"{q.query}"</span>
                                    <span className="text-xs text-slate-500">{q.count.toLocaleString()} searches</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No search data yet.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
