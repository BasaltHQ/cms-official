"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, CreditCard, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useState } from "react";

interface StripeData {
    balance: { available: number; pending: number; currency: string };
    customers: { total: number };
    netVolume: number;
    recentPayments: Array<{ id: string; amount: number; currency: string; status: string; created: Date; customerEmail?: string }>;
    revenueChart: Array<{ date: string; amount: number }>;
}

export function StripeDashboard() {
    const { isConnected, connection, isLoading: connectionLoading } = useAppConnection("stripe");
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<StripeData>("stripe", isConnected);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

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
                <div className="w-20 h-20 bg-[#635BFF]/10 rounded-3xl flex items-center justify-center border border-[#635BFF]/20">
                    <DollarSign className="w-10 h-10 text-[#635BFF]" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect Stripe</h2>
                    <p className="text-slate-400">
                        Link your Stripe account to view revenue, customers, and payment data in real-time.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-[#635BFF] hover:bg-[#635BFF]/90 text-white"
                    onClick={() => setIsConfigOpen(true)}
                >
                    Connect Stripe
                </Button>
                <AppConfigModal
                    isOpen={isConfigOpen}
                    onClose={() => setIsConfigOpen(false)}
                    app={{ id: "stripe", name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/635BFF", description: "Payment processing.", category: "Commerce", status: "active", connected: false, author: "Stripe", rating: 4.8, installs: "1M+", updatedAt: "Just now" }}
                />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "--" : `$${(data.balance.available + data.balance.pending).toLocaleString()}`}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {isLoading ? "Loading..." : `${data.balance.currency} • $${data.balance.pending.toLocaleString()} pending`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Customers</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : data.customers.total.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">{isLoading ? "Loading..." : "All time"}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Net Volume (30d)</CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "--" : `$${data.netVolume.toLocaleString()}`}</div>
                        <p className="text-xs text-slate-500 mt-1">{isLoading ? "Loading..." : "Last 30 days"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription className="text-slate-400">Daily revenue over time</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()} disabled={dataLoading}>
                            <RefreshCw className={`h-3 w-3 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] border-t border-white/5">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading chart...
                        </div>
                    ) : data.revenueChart.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `$${v}`} />
                                <Tooltip contentStyle={{ background: '#1A1B1E', border: '1px solid #333' }} />
                                <Area type="monotone" dataKey="amount" stroke="#635BFF" fill="#635BFF" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <DollarSign className="w-8 h-8 opacity-20 mb-2" />
                            No revenue data in the last 30 days.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                        </div>
                    ) : data.recentPayments.length > 0 ? (
                        <div className="space-y-3">
                            {data.recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">{payment.customerEmail || 'Unknown customer'}</p>
                                        <p className="text-xs text-slate-500">{new Date(payment.created).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-white">${payment.amount.toLocaleString()} {payment.currency}</p>
                                        <p className={`text-xs ${payment.status === 'succeeded' ? 'text-green-500' : 'text-yellow-500'}`}>{payment.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                            <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                            No recent payments found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

