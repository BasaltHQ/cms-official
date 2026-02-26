"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, AlertTriangle, Lock, Key, ServerOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SecuritySopPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    // Strict Access Control
    if (!session?.user?.isAdmin && session?.user?.email !== "info@basalthq.com") {
        return redirect(`/${locale}/cms/university`);
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <Link href={`/${locale}/cms/university`} className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to University
                </Link>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <Shield className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Security & Compliance Protocols</h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            Standard Operating Procedures for System Security, Access Control, and Emergency Response.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-8">

                {/* Section 1: Access Control */}
                <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Key className="h-6 w-6 text-blue-400" />
                        1. Access Control & Permissions
                    </h2>
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                        <p>
                            <strong>Role-Based Access Control (RBAC):</strong> The system uses a strict RBAC policy.
                            Users are assigned roles (Admin, Editor, Viewer) which dictate their access to specific modules.
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-slate-400">
                            <li><span className="text-white font-semibold">Admin:</span> Full access to all modules, settings, and user management.</li>
                            <li><span className="text-white font-semibold">Editor:</span> Access to content modules (Blog, Media, Docs) but NO access to Settings or User Management.</li>
                            <li><span className="text-white font-semibold">Viewer:</span> Read-only access to standard views.</li>
                        </ul>
                        <p className="mt-4 border-l-2 border-yellow-500/50 pl-4 italic text-yellow-200/80">
                            Note: The "Owner" role is immutable and cannot be modified via the UI to prevent lockout.
                        </p>
                    </div>
                </div>

                {/* Section 2: Security Settings Configuration */}
                <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Lock className="h-6 w-6 text-orange-400" />
                        2. Security Settings Configuration
                    </h2>
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                        <p>
                            Navigate to <Link href={`/${locale}/cms/settings/security`} className="text-blue-400 hover:underline">Settings &gt; Security</Link> to configure system-wide policies.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">Authentication</h3>
                                <ul className="text-sm space-y-2 text-slate-400">
                                    <li><strong>2FA Enforcement:</strong> Requires all admin users to have 2FA enabled.</li>
                                    <li><strong>Public Registration:</strong> Controls whether the public sign-up page is active.</li>
                                    <li><strong>Session Timeout:</strong> Auto-logs out users after 30 minutes of inactivity.</li>
                                </ul>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="font-bold text-white mb-2">Network</h3>
                                <ul className="text-sm space-y-2 text-slate-400">
                                    <li><strong>IP Whitelisting:</strong> Restricts admin access to approved IP ranges.</li>
                                    <li><strong>Audit Logs:</strong> Ensures detailed logging of all system modifications.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Emergency Protocols */}
                <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <AlertTriangle className="h-24 w-24 text-red-500/20" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                        <ServerOff className="h-6 w-6" />
                        3. Emergency Protocols (Kill Switch)
                    </h2>
                    <div className="space-y-6 text-slate-300 leading-relaxed z-10 relative">
                        <p className="text-red-200">
                            <strong>WARNING:</strong> These features are destructive and should only be used in verified security breach scenarios.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">A</div>
                                <div>
                                    <h4 className="text-white font-bold">System Lockdown</h4>
                                    <p className="text-sm text-slate-400">
                                        Terminates (invalidates) all active user sessions immediately except for the Super Admin.
                                        Use this if you suspect unauthorized account access.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="mt-1 h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">B</div>
                                <div>
                                    <h4 className="text-white font-bold">AI & Integration Kill Switch</h4>
                                    <p className="text-sm text-slate-400">
                                        Located at the bottom of the Security Settings page. This protocol:
                                    </p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-red-300/80">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Disables all AI Models</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Revokes Google/OAuth tokens</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Stops all automated agents</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Wipes stored API keys</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
