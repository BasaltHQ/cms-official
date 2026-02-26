"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, TrendingUp, ArrowRight, RefreshCw, Loader2, MousePointer2 } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface MailchimpData {
    lists: Array<{ id: string; name: string; memberCount: number }>;
    totalSubscribers: number;
    avgOpenRate: number;
    avgClickRate: number;
    recentCampaigns: Array<{ id: string; title: string; status: string; sendTime?: string; openRate: number; clickRate: number }>;
}

export function MailchimpDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("mailchimp");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<MailchimpData>("mailchimp", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#FFE01B]/10 rounded-3xl flex items-center justify-center border border-[#FFE01B]/20">
                    <Mail className="w-10 h-10 text-[#FFE01B]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Sync Audiences</h2>
                    <p className="text-slate-400">Connect your Mailchimp account to manage subscribers and track campaigns.</p>
                </div>
                <Button size="lg" className="bg-[#FFE01B] hover:bg-[#FFE01B]/90 text-black" onClick={() => setIsConfigOpen(true)}>
                    Connect Mailchimp <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "mailchimp", name: "Mailchimp", icon: "https://cdn.simpleicons.org/mailchimp/FFE01B", description: "Email marketing.", category: "Marketing", status: "active", connected: false, author: "Intuit", rating: 4.6, installs: "5M+", updatedAt: "1 week ago" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">Audience Overview</h2><p className="text-slate-400">Campaign performance and growth</p></div>
                <Button className="bg-[#FFE01B] text-black hover:bg-[#FFE01B]/80" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Subscribers</CardTitle><Users className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.totalSubscribers.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Open Rate</CardTitle><Mail className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--%" : `${data.avgOpenRate.toFixed(1)}%`}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Click Rate</CardTitle><MousePointer2 className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--%" : `${data.avgClickRate.toFixed(1)}%`}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Recent Campaigns</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.recentCampaigns.length > 0 ? (
                        <div className="space-y-3">
                            {data.recentCampaigns.map((c) => (
                                <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div><p className="text-sm text-white">{c.title}</p><p className="text-xs text-slate-500">{c.sendTime ? new Date(c.sendTime).toLocaleDateString() : c.status}</p></div>
                                    <div className="text-right text-xs text-slate-400"><p>Open: {c.openRate.toFixed(1)}%</p><p>Click: {c.clickRate.toFixed(1)}%</p></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No campaigns sent yet.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
