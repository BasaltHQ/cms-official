"use client";

import { useState, useMemo } from "react";
import NextImage from "next/image";
import {
    Search,
    User,
    Clock,
    Filter,
    Calendar,
    ChevronDown,
    Activity as ActivityIcon,
    Info
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Activity {
    id: string;
    action: string;
    resource: string;
    details: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
    user: {
        name: string | null;
        avatar: string | null;
    } | null;
}

interface ActivityListProps {
    initialActivities: any[];
}

export default function ActivityList({ initialActivities }: ActivityListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "user" | "action">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [userFilter, setUserFilter] = useState<string | null>(null);

    const activities = initialActivities as Activity[];

    const uniqueUsers = useMemo(() => {
        const users = new Map<string, string>();
        activities.forEach(a => {
            if (a.user?.name) users.set(a.user.name, a.user.name);
        });
        return Array.from(users.values());
    }, [activities]);

    const filteredAndSortedActivities = useMemo(() => {
        return activities
            .filter(activity => {
                const searchLower = searchQuery.toLowerCase();
                const userName = activity.user?.name?.toLowerCase() || "unknown user";
                const action = activity.action.toLowerCase();
                const resource = activity.resource.toLowerCase();
                const details = activity.details?.toLowerCase() || "";

                const matchesSearch =
                    userName.includes(searchLower) ||
                    action.includes(searchLower) ||
                    resource.includes(searchLower) ||
                    details.includes(searchLower);

                const matchesUser = !userFilter || activity.user?.name === userFilter;

                return matchesSearch && matchesUser;
            })
            .sort((a, b) => {
                let comparison = 0;
                if (sortBy === "date") {
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                } else if (sortBy === "user") {
                    comparison = (a.user?.name || "").localeCompare(b.user?.name || "");
                } else if (sortBy === "action") {
                    comparison = a.action.localeCompare(b.action);
                }

                return sortOrder === "desc" ? -comparison : comparison;
            });
    }, [activities, searchQuery, sortBy, sortOrder, userFilter]);

    const toggleSort = (newSortBy: typeof sortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("desc");
        }
    };

    const getActionTheme = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes("create") || lower.includes("add") || lower.includes("upload")) return {
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]"
        };
        if (lower.includes("update") || lower.includes("edit") || lower.includes("modify")) return {
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]"
        };
        if (lower.includes("delete") || lower.includes("remove")) return {
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            glow: "shadow-[0_0_15px_rgba(248,113,113,0.15)]"
        };
        return {
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            glow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]"
        };
    };

    return (
        <div className="space-y-6">
            <TooltipProvider>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-black border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search actions, users or resources..."
                            className="pl-10 bg-black border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-white placeholder:text-slate-600 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-black border-white/10 rounded-xl hover:bg-white/5 text-slate-300 h-11 px-4">
                                    <Filter className="mr-2 h-4 w-4" />
                                    {userFilter || "All Users"}
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black border-white/10 rounded-xl text-slate-300 min-w-[200px]">
                                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-slate-500 py-3">Filter by User</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuItem onClick={() => setUserFilter(null)} className="rounded-lg py-2 focus:bg-white/5 focus:text-primary cursor-pointer">
                                    All Users
                                </DropdownMenuItem>
                                {uniqueUsers.map(user => (
                                    <DropdownMenuItem key={user} onClick={() => setUserFilter(user)} className="rounded-lg py-2 focus:bg-white/5 focus:text-primary cursor-pointer">
                                        {user}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center bg-black border border-white/10 rounded-xl p-1 gap-1 h-11 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSort("date")}
                                className={cn("h-full px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0", sortBy === "date" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300")}
                            >
                                Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSort("user")}
                                className={cn("h-full px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0", sortBy === "user" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300")}
                            >
                                User {sortBy === "user" && (sortOrder === "desc" ? "↓" : "↑")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSort("action")}
                                className={cn("h-full px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0", sortBy === "action" ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-300")}
                            >
                                Action {sortBy === "action" && (sortOrder === "desc" ? "↓" : "↑")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Activity List */}
                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedActivities.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-20 text-center border border-dashed border-white/5 rounded-3xl bg-black"
                            >
                                <ActivityIcon className="h-16 w-16 text-slate-800 mx-auto mb-6 animate-pulse" />
                                <p className="text-slate-500 text-xl font-medium tracking-tight">No interaction events detected in the current scope.</p>
                            </motion.div>
                        ) : (
                            filteredAndSortedActivities.map((log, index) => {
                                const theme = getActionTheme(log.action);
                                return (
                                    <motion.div
                                        key={log.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5) }}
                                        className="group relative flex items-center justify-between p-5 bg-black border border-white/5 rounded-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="flex gap-5 relative z-10 items-center">
                                            <div className="relative h-14 w-14 shrink-0">
                                                <div className={cn("absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity", theme.color.replace("text-", "bg-"))} />
                                                <div className="relative h-full w-full rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500 z-10">
                                                    {log.user?.avatar ? (
                                                        <NextImage src={log.user.avatar} alt="User" fill className="object-cover" unoptimized />
                                                    ) : (
                                                        <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent")}>
                                                            <User className="h-7 w-7 text-slate-500 group-hover:text-primary transition-colors" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-xl text-white tracking-tight group-hover:text-primary transition-all duration-300 lowercase italic">
                                                        {log.action}
                                                    </h4>
                                                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border", theme.bg, theme.color, theme.border, theme.glow)}>
                                                        {log.resource}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-300 tracking-tight">
                                                        {log.user?.name || "Unknown Identity"}
                                                    </p>

                                                    {(log.details || log.metadata) && (
                                                        <Tooltip delayDuration={0}>
                                                            <TooltipTrigger asChild>
                                                                <button className="p-1 rounded-full hover:bg-white/5 text-slate-500 hover:text-primary transition-all">
                                                                    <Info className="h-3.5 w-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-black border-primary/20 text-slate-200 p-4 rounded-xl max-w-sm shadow-2xl backdrop-blur-3xl">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                                                        <div className={cn("h-2 w-2 rounded-full", theme.color.replace("text-", "bg-"))} />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Details</span>
                                                                    </div>

                                                                    {log.details && (
                                                                        <p className="text-sm leading-relaxed font-medium">
                                                                            {log.details}
                                                                        </p>
                                                                    )}

                                                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                                        <div className="bg-white/5 rounded-lg p-2.5 space-y-1.5 mt-2 overflow-hidden">
                                                                            {Object.entries(log.metadata).map(([key, value]) => (
                                                                                <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-xs font-mono border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                                                                                    <span className="text-slate-500 shrink-0 select-none uppercase tracking-wider">{key}:</span>
                                                                                    <span className="text-primary truncate">
                                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex flex-col items-end gap-2 relative z-10">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-primary/20 transition-all">
                                                <Calendar className="h-3 w-3 text-primary/50" />
                                                {format(new Date(log.createdAt), "MMM d, yyyy")}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 mr-1 uppercase">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(log.createdAt), "HH:mm:ss")}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </TooltipProvider>
        </div>
    );
}
