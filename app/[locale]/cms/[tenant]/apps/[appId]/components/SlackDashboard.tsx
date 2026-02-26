"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash, Bell, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface SlackData {
    workspace: { name: string; domain: string };
    channels: { total: number; list: Array<{ id: string; name: string; memberCount: number; isPrivate: boolean }> };
    alertsSent24h: number;
}

export function SlackDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("slack");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<SlackData>("slack", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#4A154B]/20 rounded-3xl flex items-center justify-center border border-[#4A154B]/30">
                    <Hash className="w-10 h-10 text-[#E01E5A]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect Workspace</h2>
                    <p className="text-slate-400">Link your Slack workspace to send alerts and receive notifications.</p>
                </div>
                <Button size="lg" className="bg-[#4A154B] hover:bg-[#4A154B]/90 text-white" onClick={() => setIsConfigOpen(true)}>
                    Connect Slack <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "slack", name: "Slack", icon: "https://cdn.simpleicons.org/slack/4A154B", description: "Team messaging.", category: "Marketing", status: "active", connected: false, author: "Salesforce", rating: 4.8, installs: "10M+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">{data?.workspace.name || "Slack Workspace"}</h2><p className="text-slate-400">{data?.workspace.domain || "Team notifications"}</p></div>
                <Button className="bg-[#4A154B] hover:bg-[#4A154B]/90 text-white" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Active Channels</CardTitle><Hash className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.channels.total}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Alerts Sent (24h)</CardTitle><Bell className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.alertsSent24h}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Channels</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.channels.list.length > 0 ? (
                        <div className="space-y-2">
                            {data.channels.list.map((ch) => (
                                <div key={ch.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-white">#{ch.name}</span>
                                    <span className="text-xs text-slate-500">{ch.memberCount} members</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No channels found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
