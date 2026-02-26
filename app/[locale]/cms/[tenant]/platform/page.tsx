"use client";

import { useState } from "react";
import { Users, Globe, Activity, ShieldAlert, Server } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PlatformAdminDashboard() {
    const params = useParams();
    const locale = params.locale as string;
    const tenant = params.tenant as string;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-orange-400 tracking-tighter leading-tight mb-2 pr-2 pb-1">
                        Platform Operations
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 font-medium max-w-lg">
                        Global system management, workspaces, and master users list. <span className="text-red-400 font-bold uppercase tracking-widest text-xs ml-2 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded-full">Super Admin</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href={`/${locale}/cms/${tenant}/platform/teams`}>
                    <div className="p-6 rounded-2xl bg-[#0A0A0B]/60 border border-white/5 hover:border-red-500/30 transition-all duration-300 group cursor-pointer relative overflow-hidden h-full">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                            <Globe className="h-32 w-32 text-red-500" />
                        </div>
                        <Globe className="h-6 w-6 text-red-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Workspaces</h3>
                        <p className="text-sm text-slate-400">Manage all tenant instances, billing, and system limits.</p>
                    </div>
                </Link>
                <Link href={`/${locale}/cms/${tenant}/platform/users`}>
                    <div className="p-6 rounded-2xl bg-[#0A0A0B]/60 border border-white/5 hover:border-red-500/30 transition-all duration-300 group cursor-pointer relative overflow-hidden h-full">
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                            <Users className="h-32 w-32 text-red-500" />
                        </div>
                        <Users className="h-6 w-6 text-red-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Global Users</h3>
                        <p className="text-sm text-slate-400">View and manage all users across the entire platform.</p>
                    </div>
                </Link>
                <div className="p-6 rounded-2xl bg-[#0A0A0B]/60 border border-white/5 hover:border-red-500/30 transition-all duration-300 group cursor-not-allowed opacity-50 relative overflow-hidden h-full">
                    <Activity className="h-6 w-6 text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">System Health</h3>
                    <p className="text-sm text-slate-400">Server loads, database metrics, and error logs.</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Coming Soon</span>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-[#0A0A0B]/60 border border-white/5 hover:border-red-500/30 transition-all duration-300 group cursor-not-allowed opacity-50 relative overflow-hidden h-full">
                    <Server className="h-6 w-6 text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Infrastructure</h3>
                    <p className="text-sm text-slate-400">Resource allocation and deployment controls.</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Coming Soon</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats or Alerts can go here */}
            <div className="mt-8 p-6 rounded-2xl bg-[#0A0A0B]/60 border border-red-500/20 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <ShieldAlert className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-white mb-1">Root Access Authorized</h4>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            You are viewing this page as a God Mode Platform Administrator. Actions taken here cascade globally across all {tenant} platform instances. Proceed with caution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
