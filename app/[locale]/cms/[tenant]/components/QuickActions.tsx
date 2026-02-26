"use client";

import { PenSquare, Upload, UserPlus, LifeBuoy, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SupportInboxModal } from "@/components/cms/SupportInboxModal";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

const actions = [
    {
        label: "New Post",
        icon: PenSquare,
        href: (l: string, t: string) => `/${l}/cms/${t}/blog/new`,
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        hover: "group-hover:text-pink-300"
    },
    {
        label: "Upload",
        icon: Upload,
        href: (l: string, t: string) => `/${l}/cms/${t}/media?upload=true`,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        hover: "group-hover:text-blue-300"
    },
    {
        label: "Invite",
        icon: UserPlus,
        href: (l: string, t: string) => `/${l}/cms/${t}/settings/team`,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        hover: "group-hover:text-purple-300"
    },
    {
        label: "Support",
        icon: LifeBuoy,
        action: "support",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        hover: "group-hover:text-amber-300"
    }
];

export default function QuickActions() {
    const params = useParams();
    const locale = params.locale as string;
    const tenant = params.tenant as string;
    const [showSupport, setShowSupport] = useState(false);

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                <Plus className="h-3 w-3" />
                Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {actions.map((item) => {
                    const Content = (
                        <div className="relative group p-4 rounded-xl bg-[#0A0A0B] border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1 h-24">
                            {/* Billboard Icon Background */}
                            <div className={cn(
                                "absolute -right-2 -bottom-2 transition-all duration-700 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 group-hover:-rotate-12",
                                item.color
                            )}>
                                <item.icon className="h-16 w-16" />
                            </div>

                            {/* Label */}
                            <span className="relative z-10 text-xs font-bold text-slate-400 group-hover:text-white group-hover:tracking-wider transition-all duration-300">
                                {item.label}
                            </span>

                            {/* Accent Glow */}
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            )} />
                        </div>
                    );

                    if (item.action === 'support') {
                        return (
                            <button key={item.label} onClick={() => setShowSupport(true)} className="w-full text-left">
                                {Content}
                            </button>
                        );
                    }

                    return (
                        <Link key={item.label} href={typeof item.href === 'function' ? item.href(locale, tenant) : (item.href || '#')} className="block w-full">
                            {Content}
                        </Link>
                    );
                })}
            </div>

            <SupportInboxModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
        </div>
    );
}
