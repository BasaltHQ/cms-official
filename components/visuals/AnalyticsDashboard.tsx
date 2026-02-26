"use client";

import React from "react";
import { ArrowUp, ArrowDown, Activity, Eye, Clock, Search, FileText } from "lucide-react";

export function AnalyticsDashboard() {
    return (
        <div className="w-full h-full p-6 flex flex-col gap-6 text-white font-sans select-none pointer-events-none">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400">LIVE ANALYTICS</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">LAST 30 DAYS</div>
            </div>

            {/* Top Row: Key CMS Metrics */}
            <div className="grid grid-cols-2 gap-4">
                {/* Metric 1: Page Views */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="flex items-start justify-between mb-2 z-10">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Page Views</span>
                        <Eye className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="z-10">
                        <div className="text-2xl font-bold text-white mb-1">---</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <Activity className="w-3 h-3" />
                            <span>0%</span>
                            <span className="text-slate-600 ml-1">vs last mo</span>
                        </div>
                    </div>
                </div>

                {/* Metric 2: Engagement Time */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="flex items-start justify-between mb-2 z-10">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg. Time</span>
                        <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="z-10">
                        <div className="text-2xl font-bold text-white mb-1">--</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>0%</span>
                            <span className="text-slate-600 ml-1">retention</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Content Performance Chart (CSS only) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-semibold text-slate-200">Traffic Source</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-[10px] text-slate-400">Organic</span>
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-[10px] text-slate-400">Direct</span>
                    </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="flex items-end justify-between h-full gap-2 px-1">
                    {[40, 65, 45, 70, 55, 80, 60, 85, 95, 75].map((height, i) => (
                        <div key={i} className="w-full flex flex-col gap-1 items-center group">
                            <div className="w-full relative rounded-t-sm overflow-hidden bg-white/5 h-full flex items-end">
                                <div
                                    style={{ height: `${height}%` }}
                                    className="w-full bg-gradient-to-t from-cyan-500/80 to-purple-500/80 transition-all duration-1000 ease-out group-hover:opacity-100 opacity-80"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row: SEO Health & Top Content */}
            <div className="grid grid-cols-2 gap-4">
                {/* SEO Score */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">SEO Health</span>
                        <Search className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div className="absolute top-0 left-0 h-full w-[92%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-bold">--/100</span>
                        <span className="text-slate-500">Wait for data</span>
                    </div>
                </div>

                {/* Top Content */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm relative">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Top Page</span>
                        <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white truncate w-full mb-1">/dashboard</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span>0 reads</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span className="text-slate-500">Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
