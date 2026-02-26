"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Inbox, ArrowRight, RefreshCw, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface IntercomData {
    conversations: { open: number; closed: number; snoozed: number };
    avgResponseTime: string;
    admins: Array<{ id: string; name: string; email: string }>;
    recentConversations: Array<{ id: string; title: string; state: string; createdAt: string; source: string }>;
}

export function IntercomDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("intercom");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<IntercomData>("intercom", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#6AFDEF]/10 rounded-3xl flex items-center justify-center border border-[#6AFDEF]/20">
                    <MessageCircle className="w-10 h-10 text-[#6AFDEF]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect Inbox</h2>
                    <p className="text-slate-400">Link your Intercom workspace to manage conversations and support.</p>
                </div>
                <Button size="lg" className="bg-[#6AFDEF] hover:bg-[#6AFDEF]/90 text-black" onClick={() => setIsConfigOpen(true)}>
                    Connect Intercom <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "intercom", name: "Intercom", icon: "https://cdn.simpleicons.org/intercom/6AFDEF", description: "Customer messaging.", category: "Marketing", status: "active", connected: false, author: "Intercom", rating: 4.6, installs: "500K+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">Support Inbox</h2><p className="text-slate-400">Conversation metrics and queue</p></div>
                <Button className="bg-[#6AFDEF] hover:bg-[#6AFDEF]/90 text-black" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Open Conversations</CardTitle><Inbox className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.conversations.open}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Closed</CardTitle><MessageCircle className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.conversations.closed}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Response</CardTitle><Clock className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.avgResponseTime}</div></CardContent>
                </Card>
            </div>
        </div>
    );
}
