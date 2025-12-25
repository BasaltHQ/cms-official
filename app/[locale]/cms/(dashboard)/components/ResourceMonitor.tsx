"use client";

import { Database, Users, Cpu, HardDrive, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceMonitorProps {
    stats: {
        storage: { used: number; limit: number; percent: number };
        seats: { used: number; limit: number; percent: number };
        ai: { used: number; limit: number; percent: number };
    } | null;
}

export default function ResourceMonitor({ stats }: ResourceMonitorProps) {
    if (!stats) return null;

    const metrics = [
        {
            label: "Storage",
            value: `${(stats.storage.used / 1000).toFixed(1)}GB`,
            total: `${(stats.storage.limit / 1000).toFixed(0)}GB`,
            percent: stats.storage.percent,
            icon: HardDrive,
            color: "text-cyan-400",
            track: "stroke-cyan-900/20",
            fill: "stroke-cyan-400",
        },
        {
            label: "AI Tokens",
            value: `${(stats.ai.used / 1000).toFixed(0)}k`,
            total: `${(stats.ai.limit / 1000).toFixed(0)}k`,
            percent: stats.ai.percent,
            icon: Cpu,
            color: "text-purple-400",
            track: "stroke-purple-900/20",
            fill: "stroke-purple-400",
        },
        {
            label: "Team Seats",
            value: stats.seats.used.toString(),
            total: stats.seats.limit.toString(),
            percent: stats.seats.percent,
            icon: Users,
            color: "text-emerald-400",
            track: "stroke-emerald-900/20",
            fill: "stroke-emerald-400",
        }
    ];

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                <Activity className="h-3 w-3" />
                System Resources
            </h3>

            <div className="grid grid-cols-3 gap-4">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="relative group p-3 rounded-xl bg-[#0A0A0B] border border-white/5 flex flex-col items-center gap-2 hover:border-white/10 transition-all">
                        {/* Thin High-Fidelity Gauge */}
                        <div className="relative h-12 w-12 flex-shrink-0">
                            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                                {/* Track */}
                                <path
                                    className={cn("fill-none stroke-[2px]", metric.track)}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {/* Progress */}
                                <path
                                    className={cn("fill-none stroke-[2px] transition-all duration-1000 ease-out", metric.fill)}
                                    strokeDasharray={`${metric.percent}, 100`}
                                    strokeLinecap="round" // Round caps for premium feel
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <metric.icon className={cn("h-4 w-4", metric.color)} />
                            </div>
                        </div>

                        <div className="text-center w-full">
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold text-white font-mono leading-none">{metric.value}</span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{metric.label}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
