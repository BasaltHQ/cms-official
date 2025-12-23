"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import SidebarNav, { NavModule } from "./SidebarNav";
import SignOutButton from "./SignOutButton";

interface MobileHeaderProps {
    session: any; // Using any for session to avoid deep type imports for now, or use Session from next-auth
    visibleModules: NavModule[];
    locale: string;
}

export default function MobileHeader({ session, visibleModules, locale }: MobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
            {/* Left: Hamburger Menu */}
            <div className="flex items-center">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                            <Menu className="h-6 w-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[300px] p-0 border-r border-white/10 bg-[#0A0A0B] text-slate-200">
                        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                        <div className="flex custom-sheet flex-col h-full bg-[#0A0A0B]">
                            <div className="py-6 px-4 border-b border-white/10 flex flex-col items-center justify-center gap-4">
                                {/* Enhanced Logo Container for Mobile Menu */}
                                <div className="relative w-full h-14">
                                    <Image
                                        src="/ledger1-cms-wide-logo.webp"
                                        alt="Ledger1 CMS"
                                        fill
                                        className="object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]"
                                        priority
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                    <div className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                        Online
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto">
                                <SidebarNav modules={visibleModules} onLinkClick={() => setIsOpen(false)} />
                            </div>

                            <div className="p-4 border-t border-white/10">
                                <SignOutButton callbackUrl={`/${locale}/cms/login`} />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Right: Logo & Avatar */}
            <div className="flex items-center gap-4">
                {/* Logo - Right Aligned as requested */}
                <div className="relative h-6 w-24 opacity-80">
                    <Image
                        src="/ledger1-cms-wide-logo.webp"
                        alt="Ledger1 CMS"
                        fill
                        className="object-contain object-right"
                        priority
                    />
                </div>

                {/* User Avatar */}
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
            </div>
        </header>
    );
}
