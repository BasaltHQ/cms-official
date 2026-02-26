"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Store, RefreshCw, Loader2, DollarSign } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface ShopifyData {
    store: { name: string; domain: string; currency: string };
    orders: { total: number; recent: Array<{ id: string; name: string; total: string; status: string; createdAt: string; customerName?: string }> };
    products: { total: number };
    revenue: { total: number; currency: string };
}

export function ShopifyDashboard() {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection("shopify");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<ShopifyData>("shopify", isConnected);

    if (connectionLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-[#95BF47]/10 rounded-3xl flex items-center justify-center border border-[#95BF47]/20">
                    <Store className="w-10 h-10 text-[#95BF47]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Sync Your Shopify Store</h2>
                    <p className="text-slate-400">Connect to import products, view orders, and manage your store directly from your CMS.</p>
                </div>
                <Button size="lg" className="bg-[#95BF47] hover:bg-[#95BF47]/90 text-white" onClick={() => setIsConfigOpen(true)}>
                    Connect Store <RefreshCw className="w-4 h-4 ml-2" />
                </Button>
                <AppConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} app={{ id: "shopify", name: "Shopify", icon: "https://cdn.simpleicons.org/shopify/95BF47", description: "E-commerce sync.", category: "Commerce", status: "active", connected: false, author: "Shopify Inc", rating: 4.8, installs: "2M+", updatedAt: "2 days ago" }} />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold text-white">{data?.store.name || "Store Overview"}</h2><p className="text-slate-400">{data?.store.domain || "Manage your Shopify catalog"}</p></div>
                <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Sync Now</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Orders</CardTitle><ShoppingBag className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.orders.total.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Products</CardTitle><Package className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : data.products.total.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Revenue</CardTitle><DollarSign className="h-4 w-4 text-slate-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{isLoading ? "--" : `$${data.revenue.total.toLocaleString()}`}</div></CardContent>
                </Card>
            </div>
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
                    ) : data.orders.recent.length > 0 ? (
                        <div className="space-y-3">
                            {data.orders.recent.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div><p className="text-sm text-white">{order.name}</p><p className="text-xs text-slate-500">{order.customerName || 'Guest'}</p></div>
                                    <div className="text-right"><p className="text-sm font-medium text-white">${order.total}</p><p className="text-xs text-slate-500">{order.status}</p></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No recent orders.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
