"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, LayoutDashboard, Activity, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AnalyticsCharts from "./AnalyticsCharts";
import ResourceMonitor from "./ResourceMonitor";
import QuickActions from "./QuickActions";

interface CommandCenterProps {
    analyticsStats: any;
    resourceStats: any;
    isAdmin: boolean;
}

export default function CommandCenter({ analyticsStats, resourceStats, isAdmin }: CommandCenterProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Extract Summary Metrics for Collapsed View
    const totalVisitors = analyticsStats?.kpiData?.find((k: any) => k.title === "Total Visitors (30d)")?.metric || "--";
    const storageUsed = resourceStats ? `${(resourceStats.storage.used / 1000).toFixed(1)}GB` : "--";
    const aiUsage = resourceStats ? `${(resourceStats.ai.used / 1000).toFixed(0)}k` : "--";

    return (
        <div className="w-full mb-8">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full bg-[#0A0A0B]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500"
            >
                {/* Header / Collapsed View */}
                <div className="p-4 md:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-12">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <LayoutDashboard className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">Command Center</h2>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Overview</p>
                            </div>
                        </div>

                        {/* Summary Metrics - Only visible when collapsed or on desktop */}
                        <div className={cn(
                            "hidden md:flex items-center gap-8 transition-opacity duration-300",
                            isOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        )}>
                            <div className="flex items-center gap-3">
                                <Activity className="h-4 w-4 text-emerald-400" />
                                <div>
                                    <p className="text-white font-mono font-bold">{totalVisitors}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Visitors</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/5" />
                            <div className="flex items-center gap-3">
                                <Database className="h-4 w-4 text-cyan-400" />
                                <div>
                                    <p className="text-white font-mono font-bold">{storageUsed}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Storage</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/5" />
                            <div className="flex items-center gap-3">
                                <Zap className="h-4 w-4 text-purple-400" />
                                <div>
                                    <p className="text-white font-mono font-bold">{aiUsage}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Tokens</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CollapsibleTrigger asChild>
                        <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                    </CollapsibleTrigger>
                </div>

                {/* Expanded Content */}
                <CollapsibleContent className="border-t border-white/5 bg-[#050505]/50">
                    <div className="p-6 md:p-8 space-y-8 animate-in slide-in-from-top-4 fade-in duration-500">
                        {/* 1. Analytics Section */}
                        {isAdmin && analyticsStats && (
                            <section>
                                <AnalyticsCharts
                                    chartdata={analyticsStats.chartdata}
                                    topPages={analyticsStats.topPages}
                                    kpiData={analyticsStats.kpiData}
                                    cities={analyticsStats.cities}
                                />
                            </section>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-white/5">
                            {/* 2. Quick Actions */}
                            <div className="lg:col-span-7">
                                <QuickActions />
                            </div>

                            {/* 3. Resource Monitor */}
                            <div className="lg:col-span-5 border-l border-white/5 pl-0 lg:pl-8">
                                <ResourceMonitor stats={resourceStats} />
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
