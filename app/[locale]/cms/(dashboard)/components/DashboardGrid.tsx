"use client";

import { FileText, Briefcase, BookOpen, Globe, Share2, Users, ArrowRight, Activity, Mail, Image as ImageIcon, Settings, Radio, Brain, PenTool, FileInput } from "lucide-react";
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

export type DashboardItemType = "link" | "modal" | "menu";

export interface DashboardItem {
    slug: string;
    title: string;
    description: string;
    href?: string; // Optional for modals
    action?: string; // Optional for links
    icon: any; // Lucide icon
    gradient: string;
    iconColor: string;
    type: DashboardItemType;
    adminOnly?: boolean;
    menuItems?: { label: string; href: string }[];
}

const items: DashboardItem[] = [
    {
        slug: "blog",
        title: "Blog",
        description: "Manage blog posts",
        href: "/cms/blog",
        icon: FileText,
        gradient: "from-blue-500/20 via-blue-500/5 to-transparent border-blue-500/20 hover:border-blue-500/50",
        iconColor: "text-blue-400",
        type: "link"
    },
    {
        slug: "social", // Shared slug for visibility (Broadcast)
        title: "Base Broadcast",
        description: "Broadcast Command Center",
        href: "/cms/apps?tab=broadcast",
        icon: Radio,
        gradient: "from-cyan-500/20 via-blue-500/5 to-transparent border-cyan-500/20 hover:border-cyan-500/50",
        iconColor: "text-cyan-400",
        type: "link"
    },
    {
        slug: "integrations", // Using parent module slug for permissions
        title: "AI Models",
        description: "Configure AI Providers",
        href: "/cms/oauth?tab=ai",
        icon: Brain,
        gradient: "from-purple-500/20 via-fuchsia-500/5 to-transparent border-purple-500/20 hover:border-purple-500/50",
        iconColor: "text-purple-400",
        type: "link"
    },
    {
        slug: "media",
        title: "Media Library",
        description: "Manage images & files",
        href: "/cms/media",
        icon: ImageIcon,
        gradient: "from-orange-500/20 via-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/50",
        iconColor: "text-orange-400",
        type: "link"
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
    },
    {
        slug: "footer",
        title: "Footer & Social",
        description: "Manage footer, profiles & SEO",
        icon: Globe,
        gradient: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-500/50",
        iconColor: "text-amber-400",
        type: "menu",
        menuItems: [
            { label: "Footer Content", href: "/cms/footer?tab=content" },
            { label: "Social Profiles", href: "/cms/footer?tab=profiles" },
            { label: "SEO & Metadata", href: "/cms/footer?tab=seo" },
        ]
    },
    {
        slug: "settings",
        title: "Settings",
        description: "System & User Settings",
        href: "/cms/settings",
        icon: Settings,
        gradient: "from-slate-500/20 via-slate-500/5 to-transparent border-slate-500/20 hover:border-slate-500/50",
        iconColor: "text-slate-400",
        type: "link"
    },
    {
        slug: "blog", // Shared slug for visibility (Publishing fits Blog context)
        title: "Publishing",
        description: "External Platforms",
        href: "/cms/apps?tab=publishing",
        icon: PenTool,
        gradient: "from-rose-500/20 via-rose-500/5 to-transparent border-rose-500/20 hover:border-rose-500/50",
        iconColor: "text-rose-400",
        type: "link"
    },
    {
        slug: "forms", // Use 'forms' slug
        title: "Form Builder",
        description: "Create & manage forms",
        href: "/cms/forms",
        icon: FileInput,
        gradient: "from-teal-500/20 via-teal-500/5 to-transparent border-teal-500/20 hover:border-teal-500/50",
        iconColor: "text-teal-400",
        type: "link"
    }
];

interface DashboardGridProps {
    enabledModules?: string[];
    isAdmin?: boolean;
    unreadSupportCount?: number;
}

export default function DashboardGrid({ enabledModules = [], isAdmin = false, unreadSupportCount = 0 }: DashboardGridProps) {
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
                                "h-32 md:h-44 w-full p-3 md:p-6 rounded-xl md:rounded-2xl transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col items-center md:items-start text-center md:text-left justify-start pt-4 md:pt-6 md:justify-start",
                                "bg-[#0A0A0B]/80 backdrop-blur-2xl border border-white/5 hover:border-white/20",
                                // Brand colored glow on hover - intensified
                                `after:absolute after:inset-0 after:rounded-2xl after:border-2 after:border-transparent after:transition-colors after:duration-300`,
                                item.gradient.includes("cyan") && "hover:after:border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]",
                                item.gradient.includes("blue") && "hover:after:border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.1)]",
                                item.gradient.includes("purple") && "hover:after:border-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.1)]",
                                item.gradient.includes("emerald") && "hover:after:border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]",
                                item.gradient.includes("orange") && "hover:after:border-orange-400/50 shadow-[0_0_15px_rgba(251,146,60,0.1)]",
                                item.gradient.includes("pink") && "hover:after:border-pink-400/50 shadow-[0_0_15px_rgba(244,114,182,0.1)]",
                                item.gradient.includes("amber") && "hover:after:border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]",
                                item.gradient.includes("slate") && "hover:after:border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.1)]",
                                item.gradient.includes("indigo") && "hover:after:border-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.1)]",
                            )}>
                                {/* Gradient Blob Background - Desktop Only - Made subtler */}
                                {/* Gradient Blob Background - Desktop Only - Made subtler */}
                                <div
                                    suppressHydrationWarning
                                    className={cn("hidden md:block absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-10 transition-all duration-500 group-hover:opacity-30 group-hover:scale-150", item.iconColor.replace("text-", "bg-"))}
                                />

                                <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between relative z-10 w-full mb-3 md:mb-0">
                                    <div className={cn("p-2.5 md:p-3 rounded-2xl md:rounded-xl bg-white/5 border border-white/5 shadow-inner mb-0 md:mb-0 backdrop-blur-sm", item.iconColor)}>
                                        {/* Large icons for mobile, normal for desktop */}
                                        <item.icon className="h-8 w-8 md:h-8 md:w-8" />
                                    </div>

                                    {/* Notification Badge for Support Inbox */}
                                    {item.slug === "support" && unreadSupportCount > 0 && (
                                        <div className="absolute top-0 right-4 md:-top-1 md:-right-1 bg-red-500 text-white text-[10px] md:text-[10px] font-bold h-5 w-5 md:min-w-[20px] rounded-full border-2 border-[#0A0A0B] shadow-lg animate-pulse z-20 flex items-center justify-center">
                                            {unreadSupportCount > 99 ? '99+' : unreadSupportCount}
                                        </div>
                                    )}

                                    {/* Arrow icon shown for links - Desktop Only */}
                                    {item.type === "link" && (
                                        <ArrowRight className="hidden md:block h-4 w-4 text-slate-600 group-hover:text-white transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                    )}
                                </div>

                                <div className="md:mt-5 relative z-10 w-full px-1 md:px-0">
                                    <h3 className="text-[11px] md:text-base font-bold text-slate-300 md:text-white group-hover:tracking-wide transition-all duration-300 leading-tight md:leading-normal line-clamp-2 w-full break-words">{item.title}</h3>
                                    <p className="hidden md:block text-sm text-slate-400 mt-1 font-medium">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    );

                    if (item.type === "link") {
                        return (
                            <Link key={idx} href={item.href!} className="block h-full cursor-pointer">
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
                                            <Link href={menuItem.href}>{menuItem.label}</Link>
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
