"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentActivities } from "@/actions/audit";
import NextImage from "next/image";
import { Loader2, Radio, User, Activity as ActivityIcon, Download, Info } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Activity {
    id: string;
    action: string;
    resource: string;
    details: string | null;
    createdAt: Date;
    user: {
        name: string | null;
        email: string;
        avatar: string | null;
    };
}

export default function Changelog() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await getRecentActivities();
                setActivities(data);
            } catch (error) {
                console.error("Failed to load changelog", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getActionTheme = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes("create") || lower.includes("add") || lower.includes("upload")) return {
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            indicator: "bg-emerald-500 shadow-[0_0_8px_#10b981]"
        };
        if (lower.includes("update") || lower.includes("edit") || lower.includes("modify")) return {
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            indicator: "bg-blue-500 shadow-[0_0_8px_#3b82f6]"
        };
        if (lower.includes("delete") || lower.includes("remove")) return {
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            indicator: "bg-red-500 shadow-[0_0_8px_#ef4444]"
        };
        return {
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            indicator: "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
        };
    };

    if (loading) {
        return (
            <Card className="h-full bg-black border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">Calibrating Stream...</p>
            </Card>
        );
    }

    return (
        <Card className="h-full bg-[#0A0A0B]/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2rem] flex flex-col overflow-hidden group/card text-white">
            <div className="flex items-center justify-between p-4 px-5 border-b border-white/5 flex-shrink-0 bg-transparent">
                <Link href="/cms/activity" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover/card:border-primary/50 transition-colors">
                        <Radio className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tighter leading-tight">Live <span className="text-primary not-italic tracking-normal">Log</span></h2>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Surveillance</p>
                    </div>
                </Link>
                <button
                    onClick={() => window.open('/api/cms/activity/export', '_blank')}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-primary transition-all duration-300 border border-transparent hover:border-white/10"
                    title="Export Sequence"
                >
                    <Download className="h-4 w-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 bg-transparent">
                <div className="min-h-full flex flex-col justify-end relative p-5 space-y-6">
                    {activities.slice(0, 3).length === 0 ? (
                        <div className="text-[10px] font-bold text-slate-700 text-center py-20 uppercase tracking-[0.4em]">
                            End of Data Stream
                        </div>
                    ) : (
                        <TooltipProvider>
                            <div className="absolute left-[39px] top-8 bottom-8 w-px bg-white/5" />

                            <div className="space-y-8">
                                {activities.slice(0, 3).map((activity) => {
                                    const theme = getActionTheme(activity.action);
                                    return (
                                        <div key={activity.id} className="relative flex gap-5 group">
                                            {/* Vertical Timeline Node */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className="relative h-12 w-12 rounded-full bg-black border border-white/10 shadow-lg flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-all duration-500">
                                                    {activity.user.avatar ? (
                                                        <NextImage
                                                            src={activity.user.avatar}
                                                            alt={activity.user.name || "User"}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <User className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors" />
                                                    )}
                                                </div>
                                                <div className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-black", theme.indicator)} />
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                                                        {activity.user.name || "Unknown Identity"}
                                                    </p>
                                                    <span className="text-[9px] text-slate-600 whitespace-nowrap font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate leading-relaxed">
                                                            <span className={cn("font-black italic mr-2", theme.color)}>
                                                                {activity.action}
                                                            </span>
                                                            <span className="text-slate-400">{activity.resource}</span>
                                                        </p>
                                                    </div>

                                                    {activity.details && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/5 text-slate-600 hover:text-primary">
                                                                    <Info className="h-3 w-3" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" className="bg-black border-primary/20 text-slate-300 p-3 rounded-xl max-w-xs shadow-2xl backdrop-blur-2xl">
                                                                <p className="text-xs font-medium leading-relaxed">
                                                                    {activity.details}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TooltipProvider>
                    )}
                </div>
            </ScrollArea>
        </Card >
    );
}
