"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Home, ServerIcon, Mail, MoreHorizontal, X, LayoutDashboard } from "lucide-react";
import SidebarNav, { NavModule, ICON_MAP, COLOR_VARIANTS } from "./SidebarNav";
import SignOutButton from "./SignOutButton";
import { UniversalVoiceAgent } from "@/components/voice/UniversalVoiceAgent";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    session: any;
    dbUser: any;
    visibleModules: NavModule[];
    locale: string;
}

export default function AdminSidebar({ session, dbUser, visibleModules, locale }: AdminSidebarProps) {
    const [open, setOpen] = useState(false); // Default to compact (false)
    const [selectedModule, setSelectedModule] = useState<NavModule | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isLinkActive = (itemHref: string) => {
        if (!itemHref || itemHref === "#") return false;
        const [path, query] = itemHref.split('?');
        if (pathname !== path) return false;
        if (query) {
            const itemParams = new URLSearchParams(query);
            let match = true;
            itemParams.forEach((val, key) => {
                if (searchParams.get(key) !== val) match = false;
            });
            return match;
        }
        return true;
    };

    // Persist state
    useEffect(() => {
        try {
            const persisted = localStorage.getItem("cms-sidebar-open");
            if (persisted !== null) {
                setOpen(persisted === "true");
            }
        } catch (_) { }
    }, []);

    // Update persistence
    const toggleOpen = () => {
        const next = !open;
        setOpen(next);
        localStorage.setItem("cms-sidebar-open", String(next));
    };

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside
                id="admin-dashboard-sidebar"
                className={`hidden md:flex bg-[#0A0A0B]/40 backdrop-blur-2xl border-r border-white/5 flex-col relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 group ${open ? "w-64" : "w-20"}`}
            >
                <div className="py-6 px-2 flex flex-col items-center justify-center gap-4">
                    {/* Enhanced Logo Container */}
                    <div className={`relative transition-transform duration-300 ${open ? "w-full h-24 hover:scale-105" : "w-10 h-10"}`}>
                        {open ? (
                            <Image
                                src="/BasaltCMS.png"
                                alt="Basalt CRM"
                                fill
                                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                priority
                            />
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src="/BasaltCMS.png"
                                    alt="Basalt CRM"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                                {/* Status Dot */}
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0A0A0B] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                        )}
                    </div>

                    {/* Status Badge (Only when open) */}
                    {open && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)] backdrop-blur-md group cursor-default hover:bg-emerald-500/10 transition-all duration-500">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                Systems Online
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {/* Pass compact state to SidebarNav via CSS or Props? 
                        The existing SidebarNav iterates modules. 
                        Let's hide labels via CSS when container is small, or clone SidebarNav and pass props.
                        Looking at SidebarNav, it uses `w-full flex items-center gap-3 ...`
                        I will update SidebarNav next to accept `compact` prop.
                    */}
                    <div className={open ? "" : "text-center items-center flex flex-col"}>
                        <SidebarNav modules={visibleModules} compact={!open} />
                    </div>
                </div>

                <div className={`p-4 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent ${!open && "flex flex-col items-center"}`}>
                    {visibleModules.some(m => m.slug === "voice") && <UniversalVoiceAgent />}
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group mb-3 shadow-lg ${!open && "p-0 justify-center w-10 h-10 rounded-full"}`}>
                        <div className="relative h-10 w-10 min-w-[2.5rem] rounded-full bg-black/40 border-2 border-[#13151A] overflow-hidden group-hover:border-blue-500/50 transition-colors shadow-inner">
                            {session.user.image ? (
                                <Image src={session.user.image} alt="User" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                    <span className="text-sm font-bold text-slate-400">
                                        {session.user.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                            )}
                        </div>
                        {open && (
                            <div className="flex-1 min-w-0">
                                <Link href={`/${locale}/cms/${dbUser?.assigned_team?.slug || "my-workspace"}/settings`} className="block">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate">{session.user.name}</p>
                                        {dbUser?.assigned_role?.name && (
                                            <span className="px-1.5 py-0.5 rounded-[4px] bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30 uppercase tracking-tighter">
                                                {dbUser.assigned_role.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] tracking-wider text-slate-500 font-semibold truncate group-hover:text-blue-400 transition-colors">{dbUser?.username || ""}</p>
                                </Link>
                            </div>
                        )}
                    </div>
                    {open && <SignOutButton callbackUrl={`/${locale}/cms/login`} />}
                </div>

                {/* Circular Toggle Tab on Hover */}
                <button
                    onClick={toggleOpen}
                    className="absolute -right-3 top-12 z-50 h-6 w-6 rounded-full bg-[#0A0A0B] border border-white/20 shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/10 text-white"
                >
                    {open ? (
                        <div className="h-4 w-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </div>
                    ) : (
                        <div className="h-4 w-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                    )}
                </button>
            </aside>

            {/* MOBILE BOTTOM NAVBAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0A0A0B]/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center px-4 pb-safe safe-area-bottom overflow-x-auto no-scrollbar gap-6">
                {/* Voice Agent Trigger */}
                {visibleModules.some(m => m.slug === "voice") && (
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent("basalt:open-agent"))}
                        className="flex flex-col items-center justify-center gap-1 min-w-[60px] p-2 transition-all duration-300 group/item whitespace-nowrap"
                    >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform group-active/item:scale-95 transition-transform">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                    </button>
                )}
                {visibleModules.map((mod) => {
                    const IconComponent = ICON_MAP[mod.icon] || LayoutDashboard;
                    const isParentActive = pathname === mod.href || (mod.href !== "#" && mod.href.length > 3 && pathname.startsWith(mod.href));
                    const isAnyOptionActive = mod.options?.some(opt => isLinkActive(opt.href));
                    const isActive = isParentActive || isAnyOptionActive;
                    const hasOptions = mod.options && mod.options.length > 0;

                    const variant = mod.color && COLOR_VARIANTS[mod.color] ? COLOR_VARIANTS[mod.color] : { hover: "text-white", active: "text-white" };
                    const activeStyle = variant.active;

                    if (hasOptions) {
                        return (
                            <button
                                key={mod.slug}
                                onClick={() => setSelectedModule(selectedModule?.slug === mod.slug ? null : mod)}
                                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] p-2 transition-all duration-300 group/item whitespace-nowrap ${isActive ? "opacity-100" : "opacity-60"}`}
                            >
                                <span className={`h-6 w-6 transition-all duration-300 ${isActive ? activeStyle : "text-slate-400 group-hover/item:text-white"}`}>
                                    <IconComponent className="h-full w-full" />
                                </span>
                                <span className={`text-[10px] font-medium transition-colors ${isActive ? activeStyle : "text-slate-500 group-hover/item:text-slate-300"}`}>
                                    {mod.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={mod.slug}
                            href={mod.href}
                            onClick={() => setSelectedModule(null)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[60px] p-2 transition-all duration-300 group/item whitespace-nowrap ${isActive ? "opacity-100" : "opacity-60"}`}
                        >
                            <span className={`h-6 w-6 transition-all duration-300 ${isActive ? activeStyle : "text-slate-400 group-hover/item:text-white"}`}>
                                <IconComponent className="h-full w-full" />
                            </span>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? activeStyle : "text-slate-500 group-hover/item:text-slate-300"}`}>
                                {mod.label}
                            </span>
                        </Link>
                    )
                })}
            </div>

            {/* Mobile Sub-Menu Layer */}
            {selectedModule && (
                <div
                    className="md:hidden fixed inset-0 z-[45]"
                    onClick={() => setSelectedModule(null)}
                >
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                    <div
                        className="absolute bottom-24 left-4 right-4 bg-[#0A0A0B]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 mb-4 px-2 pb-2 border-b border-white/5">
                            <span className={`text-xs font-bold uppercase tracking-widest ${selectedModule.color ? COLOR_VARIANTS[selectedModule.color]?.active.split(' ')[0] : "text-white"}`}>
                                {selectedModule.label}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {selectedModule.options?.map((opt, idx) => {
                                const SubIcon = opt.icon ? (ICON_MAP[opt.icon] || LayoutDashboard) : LayoutDashboard;
                                const isSubActive = isLinkActive(opt.href);
                                const variant = selectedModule.color && COLOR_VARIANTS[selectedModule.color] ? COLOR_VARIANTS[selectedModule.color] : { hover: "hover:text-white", active: "text-white", raw: "" };

                                return (
                                    <Link
                                        key={idx}
                                        href={opt.href}
                                        onClick={() => setSelectedModule(null)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group/sub",
                                            isSubActive
                                                ? cn("bg-white/10 border border-white/10", variant.active)
                                                : "bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95"
                                        )}
                                    >
                                        <div className={cn("h-6 w-6 shrink-0 transition-transform duration-300 group-hover/sub:scale-110", isSubActive ? variant.active : (variant.raw ? `text-[${variant.raw}]` : "text-slate-400"))}>
                                            <SubIcon className="h-full w-full" />
                                        </div>
                                        <span className={cn("text-base font-bold", isSubActive ? variant.active : "text-slate-200 group-hover/sub:text-white")}>
                                            {opt.label}
                                        </span>
                                        {isSubActive && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
