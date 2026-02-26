"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Globe, Activity, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface SecurityDashboardProps {
    appId: string;
    appName: string;
    description: string;
}

interface SecurityData {
    zone?: { id: string; name: string; status: string };
    analytics?: { requests: number; bandwidth: string; threats: number; uniqueVisitors: number };
    firewall?: { status: string; rulesActive: number };
    ssl?: { status: string };
}

export function SecurityDashboard({ appId, appName, description }: SecurityDashboardProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection(appId);
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<SecurityData>(appId, isConnected);

    const brandColor = appId === "cloudflare" ? "#F38020" : "#0070B8";
    const iconUrl = appId === "cloudflare" ? "https://cdn.simpleicons.org/cloudflare/F38020" : "https://cdn.simpleicons.org/wordpress/0070B8";

    if (connectionLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border`} style={{ backgroundColor: `${brandColor}1A`, borderColor: `${brandColor}33` }}>
                    <img src={iconUrl} className="w-10 h-10" alt={appName} />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Secure Your Site</h2>
                    <p className="text-slate-400">{description}</p>
                </div>
                <Button
                    size="lg"
                    style={{ backgroundColor: brandColor }}
                    className="text-white hover:opacity-90"
                    onClick={() => setIsConfigOpen(true)}
                >
                    Connect {appName}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <AppConfigModal
                    isOpen={isConfigOpen}
                    onClose={() => setIsConfigOpen(false)}
                    app={{ id: appId, name: appName, icon: iconUrl, description, category: "Security", status: "active", connected: false, author: appId === "cloudflare" ? "Cloudflare" : "Defiant", rating: 4.8, installs: "Multi-Million", updatedAt: "Just now" }}
                />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Threat Monitor</h2>
                    <p className="text-slate-400">{data?.zone?.name ? `Zone: ${data.zone.name}` : 'Real-time security analytics.'}</p>
                </div>
                <Button style={{ backgroundColor: brandColor }} className="text-white hover:opacity-90" onClick={() => refetch()}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Scan Now
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Threats Blocked</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.analytics?.threats.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Requests (24h)</CardTitle>
                        <Globe className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.analytics?.requests.toLocaleString() || 0}</div>
                        <p className="text-xs text-slate-500">{isLoading ? "" : data.analytics?.bandwidth || ""}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Firewall Status</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{isLoading ? "--" : data.firewall?.status || 'Active'}</div>
                        <p className="text-xs text-slate-500">{isLoading ? "" : `${data.firewall?.rulesActive || 0} rules active`}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

