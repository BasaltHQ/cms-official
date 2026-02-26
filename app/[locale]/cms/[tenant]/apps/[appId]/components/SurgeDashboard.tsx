"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Package, ArrowRight, RefreshCw, Loader2, ShoppingCart, Info } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface SurgeData {
    splits: { active: number; totalVolume: string };
    inventory: { total: number; lowStock: number };
    orders: { total: number; pending: number };
    shop: { name: string; status: string };
}

export function SurgeDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("surge");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<SurgeData>("surge", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-cyan-500/30">
                    <ArrowLeftRight className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect Surge</h2>
                    <p className="text-slate-400">Link your Surge account for crypto payments, revenue splits, and inventory sync.</p>
                </div>
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90" onClick={() => setIsConfigOpen(true)}>
                    Connect Wallet <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "surge", name: "Surge", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ethereum-eth-icon.png", description: "Crypto commerce.", category: "Commerce", status: "active", connected: false, author: "Surge", rating: 5.0, installs: "10K+", updatedAt: "Just now" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{data?.shop?.name || "Crypto Commerce"}</h2>
                    <p className="text-slate-400">Manage splits, inventory, and orders</p>
                </div>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90" onClick={() => refetch()}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Split Contracts</CardTitle><ArrowLeftRight className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.splits.active}</div>
                        <p className="text-xs text-slate-500">{isLoading ? "..." : `Vol: ${data.splits.totalVolume}`}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Inventory</CardTitle><Package className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.inventory.total}</div>
                        <p className="text-xs text-slate-500">{isLoading ? "..." : `${data.inventory.lowStock} low stock`}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Orders</CardTitle><ShoppingCart className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.orders.total}</div>
                        <p className="text-xs text-slate-500">{isLoading ? "..." : `${data.orders.pending} pending`}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
