"use client";

import { Grid, Briefcase, BookOpen, Globe, Share2, Users, ArrowRight, Activity, Mail, Image as ImageIcon, Settings, Radio, Brain, PenTool, FileInput, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SystemStatusModal } from "@/components/cms/SystemStatusModal";
import { SupportInboxModal } from "@/components/cms/SupportInboxModal";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useParams } from "next/navigation";

export type DashboardItemType = "link" | "modal" | "menu";

export interface DashboardItem {
    slug: string;
    title: string;
    description: string;
    href?: (l: string, t: string) => string; // Updated to function
    action?: string; // Optional for links
    icon: any; // Lucide icon
    gradient: string;
    iconColor: string;
    type: DashboardItemType;
    adminOnly?: boolean;
    menuItems?: { label: string; href: (l: string, t: string) => string }[]; // Updated to function
}

const items: DashboardItem[] = [
    {
        slug: "integrations",
        title: "AI Models",
        description: "Configure AI Providers",
        href: (l, t) => `/${l}/cms/${t}/oauth?tab=ai`,
        icon: Brain,
        gradient: "from-purple-500/20 via-fuchsia-500/5 to-transparent border-purple-500/20 hover:border-purple-500/50",
        iconColor: "text-purple-400",
        type: "link"
    },
    {
        slug: "dashboard",
        title: "App Marketplace",
        description: "Browse & install apps",
        href: (l, t) => `/${l}/cms/${t}/apps`,
        icon: Grid,
        gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/50",
        iconColor: "text-emerald-400",
        type: "link"
    },
    {
        slug: "broadcast",
        title: "Base Broadcast",
        description: "Broadcast Command Center",
        href: (l, t) => `/${l}/cms/${t}/apps?tab=broadcast`,
        icon: Radio,
        gradient: "from-cyan-500/20 via-blue-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/50",
        iconColor: "text-cyan-400",
        type: "link"
    },
    {
        slug: "coupons",
        title: "Coupons",
        description: "Manage discounts & codes",
        href: (l, t) => `/${l}/cms/${t}/coupons`,
        icon: Ticket,
        gradient: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/50",
        iconColor: "text-amber-400",
        type: "link"
    },
    {
        slug: "forms",
        title: "Form Builder",
        description: "Create & manage forms",
        href: (l, t) => `/${l}/cms/${t}/forms`,
        icon: FileInput,
        gradient: "from-teal-500/20 via-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/50",
        iconColor: "text-teal-400",
        type: "link"
    },
    {
        slug: "media",
        title: "Media Library",
        description: "Manage images & files",
        href: (l, t) => `/${l}/cms/${t}/media`,
        icon: ImageIcon,
        gradient: "from-orange-500/20 via-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/50",
        iconColor: "text-orange-400",
        type: "link"
    },
    {
        slug: "settings",
        title: "Settings",
        description: "System & User Settings",
        href: (l, t) => `/${l}/cms/${t}/settings`,
        icon: Settings,
        gradient: "from-slate-500/20 via-slate-500/5 to-transparent border-slate-500/20 hover:border-slate-500/50",
        iconColor: "text-slate-400",
        type: "link"
    },
    {
        slug: "site-layout",
        title: "Site Layout",
        description: "Manage header, footer & SEO",
        icon: Globe,
        gradient: "from-lime-500/20 via-lime-500/5 to-transparent border-lime-500/20 hover:border-lime-500/50",
        iconColor: "text-lime-400",
        type: "menu",
        menuItems: [
            { label: "Header", href: (l, t) => `/${l}/cms/${t}/site-layout?tab=header` },
            { label: "Footer Content", href: (l, t) => `/${l}/cms/${t}/site-layout?tab=content` },
            { label: "Social Profiles", href: (l, t) => `/${l}/cms/${t}/site-layout?tab=profiles` },
            { label: "SEO & Metadata", href: (l, t) => `/${l}/cms/${t}/site-layout?tab=seo` },
        ]
    },
    {
        slug: "integrations",
        title: "System",
        description: "Real-time metrics",
        action: "system_status",
        icon: Activity,
        gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/50",
        iconColor: "text-emerald-400",
        type: "modal",
        adminOnly: true
    }
];

interface DashboardGridProps {
    enabledModules?: string[];
    isAdmin?: boolean;
    unreadSupportCount?: number;
}

export default function DashboardGrid({ enabledModules = [], isAdmin = false, unreadSupportCount = 0 }: DashboardGridProps) {
    const params = useParams();
    const locale = params.locale as string;
    const tenant = params.tenant as string;
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Filter items based on user's enabled modules
    const visibleItems = items.filter(item => {
        // Admin-only items require admin access
        if (item.adminOnly && !isAdmin) return false;
        // Check if user has access to this module
        return enabledModules.includes(item.slug);
    });

    return (
        <>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 h-full content-between">
                {visibleItems.map((item, idx) => {
                    const CardContent = (
                        <div className="relative h-full w-full">
                            <div className={cn(
                                "h-32 md:h-44 w-full p-4 md:p-8 rounded-xl md:rounded-3xl transition-all duration-500 relative overflow-hidden group hover:scale-[1.03] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col items-start justify-center group",
                                "bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 hover:border-white/20",
                                // Brand colored glow on hover - intensified
                                item.gradient.includes("cyan") && "hover:after:bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
                                item.gradient.includes("blue") && "hover:after:bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.1)]",
                                item.gradient.includes("purple") && "hover:after:bg-purple-500/10 shadow-[0_0_15px_rgba(192,132,252,0.1)]",
                                item.gradient.includes("emerald") && "hover:after:bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]",
                                item.gradient.includes("orange") && "hover:after:bg-orange-500/10 shadow-[0_0_15px_rgba(251,146,60,0.1)]",
                                item.gradient.includes("amber") && "hover:after:bg-amber-500/10 shadow-[0_0_15_rgba(251,191,36,0.1)]",
                                item.gradient.includes("slate") && "hover:after:bg-slate-500/10 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
                            )}>
                                {/* Billboard Icon in Background */}
                                <div className={cn(
                                    "absolute -right-4 -bottom-4 md:-right-8 md:-bottom-8 transition-all duration-700 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12",
                                    item.iconColor
                                )}>
                                    <item.icon className="h-32 w-32 md:h-56 md:w-56" />
                                </div>

                                {/* Content Overlay */}
                                <div className="relative z-20 w-full flex flex-col gap-1 md:gap-2">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="text-sm md:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
                                            {item.title}
                                        </h3>

                                        {/* Notification Badge for Support Inbox */}
                                        {item.slug === "support" && unreadSupportCount > 0 && (
                                            <div className="bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full border-2 border-[#0A0A0B] shadow-lg animate-pulse flex items-center justify-center">
                                                {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                                            </div>
                                        )}

                                        {/* Minimal Indicator */}
                                        {item.type === "link" && (
                                            <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-all group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
                                        )}
                                    </div>
                                    <p className="text-[10px] md:text-sm text-slate-500 group-hover:text-slate-400 font-medium max-w-[80%] leading-relaxed transition-colors">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Accent Corner Light */}
                                <div className={cn(
                                    "absolute top-0 left-0 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                    item.iconColor.replace("text-", "bg-")
                                )} />
                            </div>
                        </div>
                    );

                    if (item.type === "link") {
                        return (
                            <Link key={idx} href={item.href!(locale, tenant)} className="block h-full cursor-pointer">
                                {CardContent}
                            </Link>
                        );
                    } else if (item.type === "menu") {
                        return (
                            <DropdownMenu key={idx}>
                                <DropdownMenuTrigger asChild>
                                    <div className="block h-full cursor-pointer w-full text-left">
                                        {CardContent}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0B] border-white/10 text-white">
                                    {/* @ts-ignore - menuItems exists on menu type */}
                                    {item.menuItems?.map((menuItem: any, mIdx: number) => (
                                        <DropdownMenuItem key={mIdx} asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                                            <Link href={menuItem.href(locale, tenant)}>{menuItem.label}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        );
                    } else {
                        return (
                            <div
                                key={idx}
                                onClick={() => setActiveModal(item.action!)}
                                className="block w-full text-left h-full cursor-pointer appearance-none"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setActiveModal(item.action!);
                                    }
                                }}
                            >
                                {CardContent}
                            </div>
                        );
                    }
                })}
            </div>

            {/* Active Users Modal removed from grid */}

            <SystemStatusModal
                isOpen={activeModal === "system_status"}
                onClose={() => setActiveModal(null)}
            />

            <SupportInboxModal
                isOpen={activeModal === "support_inbox"}
                onClose={() => setActiveModal(null)}
            />
        </>
    );
}
