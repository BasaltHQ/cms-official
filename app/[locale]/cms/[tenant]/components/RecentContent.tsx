"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Clock,
    ArrowRight,
    File,
    Radio,
    Brain,
    Image as ImageIcon,
    Settings,
    Share2,
    Globe,
    PenTool,
    BookOpen,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RecentItem {
    id: string;
    title: string;
    updatedAt: Date | string;
    type: 'post' | 'doc' | 'link';
    path?: string;
}

interface RecentContentProps {
    items: RecentItem[];
}

export default function RecentContent({ items }: RecentContentProps) {
    const [displayItems, setDisplayItems] = useState<RecentItem[]>();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const localData = localStorage.getItem("cms_recent_visits");
        if (localData) {
            try {
                const visited: any[] = JSON.parse(localData);
                // Convert local history to RecentItem format
                const historyItems: RecentItem[] = visited.map((v) => ({
                    id: v.path.split('/').pop() || 'unknown',
                    title: v.title || v.path,
                    updatedAt: v.timestamp,
                    type: v.path.includes('/docs/') ? 'doc' : 'post',
                    path: v.path
                }));

                // Show only the 3 most recent items
                setDisplayItems(historyItems.slice(0, 3));
            } catch (e) {
                console.error("Failed to parse recent visits", e);
            }
        }
    }, [items]);

    const getIconConfig = (path: string = "") => {
        if (path.includes("broadcast")) return { icon: Radio, classes: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/40" };
        if (path.includes("ai") || path.includes("oauth")) return { icon: Brain, classes: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:border-purple-500/40" };
        if (path.includes("media")) return { icon: ImageIcon, classes: "bg-orange-500/10 border-orange-500/20 text-orange-400 group-hover:border-orange-500/40" };
        if (path.includes("settings")) return { icon: Settings, classes: "bg-slate-500/10 border-slate-500/20 text-slate-400 group-hover:border-slate-500/40" };
        if (path.includes("social")) return { icon: Share2, classes: "bg-pink-500/10 border-pink-500/20 text-pink-400 group-hover:border-pink-500/40" };
        if (path.includes("site-layout")) return { icon: Globe, classes: "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:border-amber-500/40" };
        if (path.includes("publishing") || path.includes("blog")) return { icon: PenTool, classes: "bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/40" };
        if (path.includes("docs")) return { icon: BookOpen, classes: "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-500/40" };

        // Default
        return { icon: FileText, classes: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40" };
    };

    const getReadableTitle = (path: string, storedTitle?: string) => {
        // If we have a good title, use it
        if (storedTitle && storedTitle !== "Untitled Page" && storedTitle !== "Basalt CMS") {
            return storedTitle;
        }

        // Fallback mapping based on path
        if (path.includes("/cms/blog")) return "Blog Dashboard";
        if (path.includes("/cms/site-layout")) return "Site Layout";
        if (path.includes("/cms/social")) return "Social Command Center";
        if (path.includes("/cms/media")) return "Media Library";
        if (path.includes("/cms/apps")) return "System Apps";
        if (path.includes("/cms/settings")) return "Settings";
        if (path.includes("/cms/broadcast")) return "Base Broadcast";
        if (path.includes("/cms/oauth")) return "Integrations";
        if (path.includes("/cms/docs")) return "Documentation";
        if (path.includes("/cms/careers")) return "Careers";
        if (path.includes("/cms/university")) return "University";
        if (path.includes("/cms/ai-builder")) return "AI Page Builder";
        if (path.includes("/cms/manage")) return "Management";

        // Dynamic Fallback: capitalize the last segment
        try {
            const segments = path.split('/').filter(Boolean);
            const lastSegment = segments[segments.length - 1];
            if (lastSegment && lastSegment !== "cms") {
                return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
            }
        } catch (e) {
            // ignore
        }

        return "Dashboard Page";
    };

    if (!mounted) return null;

    if (!displayItems || displayItems.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Jump Back In
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0A0A0B]/40 border border-white/5 border-dashed text-center">
                    <Clock className="h-8 w-8 text-slate-700 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No recent activity found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Jump Back In
            </h3>

            <div className="space-y-3">
                {displayItems.map((item, idx) => {
                    const href = item.path || "#";
                    const { icon: Icon, classes } = getIconConfig(href);
                    const displayTitle = getReadableTitle(href, item.title);

                    return (
                        <Link key={`${item.id}-${idx}`} href={href}>
                            <div className="group p-4 rounded-2xl bg-[#0A0A0B]/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 flex items-center gap-4 cursor-pointer">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-colors ${classes}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-300 group-hover:text-white truncate transition-colors">
                                        {displayTitle}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] text-slate-500 font-mono">
                                            {item.updatedAt ? `Visited ${formatDistanceToNow(new Date(item.updatedAt))} ago` : 'Recently'}
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
