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
                    <div key={idx} className="relative group p-4 rounded-xl bg-[#0A0A0B] border border-white/5 flex flex-col items-center justify-center gap-3 hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[110px]">
                        {/* Billboard Icon Background */}
                        <div className={cn(
                            "absolute -right-2 -bottom-2 transition-all duration-700 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 group-hover:-rotate-12",
                            metric.color
                        )}>
                            <metric.icon className="h-16 w-16" />
                        </div>

                        {/* Gauge & Metrics */}
                        <div className="relative z-10 flex flex-col items-center gap-1 w-full">
                            <div className="relative h-10 w-10 mb-1">
                                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                                    <path
                                        className={cn("fill-none stroke-[2px]", metric.track)}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={cn("fill-none stroke-[2px] transition-all duration-1000 ease-out", metric.fill)}
                                        strokeDasharray={`${metric.percent}, 100`}
                                        strokeLinecap="round"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                            </div>

                            <div className="text-center">
                                <span className="text-xl font-bold text-white font-mono leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
                                    {metric.value}
                                </span>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{metric.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
