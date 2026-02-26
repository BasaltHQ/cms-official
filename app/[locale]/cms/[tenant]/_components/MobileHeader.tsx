"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { X, Settings, LogOut } from "lucide-react";

interface MobileHeaderProps {
    session: any;
    visibleModules: any[]; // Kept for prop compatibility but unused
    locale: string;
}

export default function MobileHeader({ session, locale }: MobileHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <>
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                {/* Left: Logo - Now links to CMS dashboard */}
                <Link href={`/${locale}/cms`} className="relative h-10 w-36 opacity-90">
                    <Image
                        src="/BasaltCMSWide.png"
                        alt="Basalt CMS"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                {/* Right: User Avatar - Opens profile modal */}
                <button
                    onClick={() => setIsProfileOpen(true)}
                    className="relative h-9 w-9 rounded-full bg-slate-800 border border-white/10 overflow-hidden shadow-lg hover:border-white/20 transition-colors"
                >
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt="User" fill className="object-cover" unoptimized />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded-full">
                            <span className="text-sm font-bold text-slate-400">
                                {session?.user?.name?.[0]?.toUpperCase() || "U"}
                            </span>
                        </div>
                    )}
                </button>
            </header>

            {/* User Profile Modal - Bottom Sheet Style */}
            {isProfileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[100]"
                    onClick={() => setIsProfileOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

                    {/* Bottom Sheet */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-[#0A0A0B] border-t border-white/10 rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Handle Bar */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsProfileOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5 text-white/60" />
                        </button>

                        {/* User Info */}
                        <div className="flex items-center gap-4 mb-6 pt-2">
                            <div className="relative h-14 w-14 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden shadow-lg">
                                {session?.user?.image ? (
                                    <Image src={session.user.image} alt="User" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded-full">
                                        <span className="text-xl font-bold text-slate-400">
                                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-white truncate">{session?.user?.name || "User"}</p>
                                <p className="text-sm text-slate-400 truncate">{session?.user?.email || ""}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10 mb-4" />

                        {/* Actions */}
                        <div className="space-y-2">
                            <Link
                                href={`/${locale}/cms/settings`}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">Settings</span>
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: `/${locale}/cms/login`, redirect: true })}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors group"
                            >
                                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <LogOut className="h-5 w-5 text-red-400" />
                                </div>
                                <span className="text-base font-medium text-white group-hover:text-red-400 transition-colors">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
