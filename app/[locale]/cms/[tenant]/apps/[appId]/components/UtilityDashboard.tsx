"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Settings, ArrowRight, RefreshCw, Loader2, FileText, Globe } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface UtilityDashboardProps {
    appId: string;
    appName: string;
    description: string;
}

interface WordPressData {
    site: { name: string; url: string; description: string };
    content: { posts: number; pages: number; media: number; comments: number };
    recentPosts: Array<{ id: number; title: string; status: string; date: string; link: string }>;
    syncStatus: { lastSync?: string; status: string };
}

interface ZapierData {
    webhooksActive: number;
    triggersToday: number;
}

export function UtilityDashboard({ appId, appName, description }: UtilityDashboardProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection(appId);
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<WordPressData | ZapierData>(appId, isConnected);

    const brandColor = appId === "zapier" ? "#FF4A00" : appId === "wordpress" ? "#21759B" : "#8C8F94";
    const iconUrl = appId === "zapier" ? "https://cdn.simpleicons.org/zapier/FF4A00" : appId === "wordpress" ? "https://cdn.simpleicons.org/wordpress/21759B" : "https://cdn.simpleicons.org/yoast/A4286A";

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center border border-white/10" style={{ backgroundColor: `${brandColor}1A` }}>
                    <img src={iconUrl} className="w-10 h-10" alt={appName} />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Configure {appName}</h2>
                    <p className="text-slate-400">{description}</p>
                </div>
                <Button size="lg" style={{ backgroundColor: brandColor }} className="text-white hover:opacity-90" onClick={() => setIsConfigOpen(true)}>
                    Connect {appName} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: appId, name: appName, icon: iconUrl, description, category: "Utility", status: "active", connected: false, author: appName, rating: 4.5, installs: "1M+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;
    const wpData = data as WordPressData | null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{appId === "wordpress" && wpData?.site?.name ? wpData.site.name : `${appName} Dashboard`}</h2>
                    <p className="text-slate-400">{appId === "wordpress" && wpData?.site?.url ? wpData.site.url : description}</p>
                </div>
                <Button style={{ backgroundColor: brandColor }} className="text-white hover:opacity-90" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            {appId === "wordpress" && wpData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-[#1A1B1E] border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Posts</CardTitle><FileText className="h-4 w-4 text-slate-400" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : wpData.content?.posts || 0}</div></CardContent>
                        </Card>
                        <Card className="bg-[#1A1B1E] border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Pages</CardTitle><Globe className="h-4 w-4 text-slate-400" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : wpData.content?.pages || 0}</div></CardContent>
                        </Card>
                        <Card className="bg-[#1A1B1E] border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Media</CardTitle><Settings className="h-4 w-4 text-slate-400" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : wpData.content?.media || 0}</div></CardContent>
                        </Card>
                        <Card className="bg-[#1A1B1E] border-white/10 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Comments</CardTitle><Zap className="h-4 w-4 text-slate-400" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : wpData.content?.comments || 0}</div></CardContent>
                        </Card>
                    </div>
                    <Card className="bg-[#1A1B1E] border-white/10 text-white">
                        <CardHeader><CardTitle>Recent Posts</CardTitle></CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                            ) : wpData.recentPosts?.length > 0 ? (
                                <div className="space-y-2">
                                    {wpData.recentPosts.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                            <span className="text-sm text-white truncate">{p.title}</span>
                                            <span className="text-xs text-slate-500">{p.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500 text-sm">No posts found.</div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
            {appId !== "wordpress" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-[#1A1B1E] border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Active Tasks</CardTitle><Zap className="h-4 w-4 text-slate-400" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-slate-500">No active automations</p></CardContent>
                    </Card>
                    <Card className="bg-[#1A1B1E] border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Status</CardTitle><Settings className="h-4 w-4 text-emerald-500" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-emerald-500">Connected</div></CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
