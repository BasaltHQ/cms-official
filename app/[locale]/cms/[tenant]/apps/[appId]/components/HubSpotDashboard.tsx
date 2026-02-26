"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, DollarSign, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface HubSpotData {
    contacts: { total: number; recent: Array<{ id: string; email: string; firstName?: string; lastName?: string; createdAt: string }> };
    deals: { total: number; totalValue: number; currency: string; stages: Array<{ stage: string; count: number; value: number }> };
    companies: { total: number };
}

export function HubSpotDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("hubspot");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<HubSpotData>("hubspot", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#FF7A59]/10 rounded-3xl flex items-center justify-center border border-[#FF7A59]/20">
                    <Briefcase className="w-10 h-10 text-[#FF7A59]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect CRM</h2>
                    <p className="text-slate-400">Link your HubSpot CRM to view contacts, deals, and pipeline data.</p>
                </div>
                <Button size="lg" className="bg-[#FF7A59] hover:bg-[#FF7A59]/90 text-white" onClick={() => setIsConfigOpen(true)}>
                    Connect HubSpot <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "hubspot", name: "HubSpot", icon: "https://cdn.simpleicons.org/hubspot/FF7A59", description: "CRM & Marketing.", category: "Marketing", status: "active", connected: false, author: "HubSpot", rating: 4.7, installs: "5M+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">CRM Overview</h2><p className="text-slate-400">Contacts, deals, and pipeline insights</p></div>
                <Button className="bg-[#FF7A59] hover:bg-[#FF7A59]/90 text-white" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Contacts</CardTitle><Users className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.contacts.total.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Active Deals</CardTitle><Briefcase className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.deals.total}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Deal Value</CardTitle><DollarSign className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : `$${data.deals.totalValue.toLocaleString()}`}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Recent Contacts</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.contacts.recent.length > 0 ? (
                        <div className="space-y-3">
                            {data.contacts.recent.map((c) => (
                                <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div><p className="text-sm text-white">{c.firstName} {c.lastName}</p><p className="text-xs text-slate-500">{c.email}</p></div>
                                    <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No contacts found.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
