"use client";

import Image from "next/image";

interface MobileHeaderProps {
    session: any;
    visibleModules: any[]; // Kept for prop compatibility but unused
    locale: string; // Kept for prop compatibility
}

export default function MobileHeader({ session }: MobileHeaderProps) {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
            {/* Left: Logo */}
            <div className="relative h-8 w-28 opacity-90">
                <Image
                    src="/ledger1-cms-wide-logo.webp"
                    alt="Ledger1 CMS"
                    fill
                    className="object-contain object-left"
                    priority
                />
            </div>

            {/* Right: User Avatar */}
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden shadow-lg">
                {session?.user?.image ? (
                    <div className="relative h-full w-full">
                        <Image src={session.user.image} alt="User" fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-900">
                        <span className="text-sm font-bold text-slate-400">
                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}
