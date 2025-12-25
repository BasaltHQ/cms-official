"use client";

import { PenSquare, Upload, UserPlus, LifeBuoy, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SupportInboxModal } from "@/components/cms/SupportInboxModal";

const actions = [
    {
        label: "New Post",
        icon: PenSquare,
        href: "/cms/blog/new",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        hover: "group-hover:text-pink-300"
    },
    {
        label: "Upload",
        icon: Upload,
        href: "/cms/media?upload=true",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        hover: "group-hover:text-blue-300"
    },
    {
        label: "Invite",
        icon: UserPlus,
        href: "/cms/settings/team",
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
                        <div className="relative group p-4 rounded-xl bg-[#0A0A0B] border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 h-24">
                            <div className={`p-2 rounded-lg ${item.bg} ${item.border} border transition-all duration-300 group-hover:scale-110`}>
                                <item.icon className={`h-5 w-5 ${item.color} ${item.hover}`} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{item.label}</span>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                        <Link key={item.label} href={item.href || '#'} className="block w-full">
                            {Content}
                        </Link>
                    );
                })}
            </div>

            <SupportInboxModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
        </div>
    );
}
