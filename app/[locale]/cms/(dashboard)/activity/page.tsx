import { prismadb } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Target, History, Radio } from "lucide-react";
import { getRecentActivities } from "@/actions/audit";
import ActivityList from "./_components/ActivityList";

export const revalidate = 0; // Ensure dynamic data

export default async function CMSActivityPage() {
    const activities = await getRecentActivities(100);
    const totalActivities = await prismadb.systemActivity.count();

    // Calculate activities in last 24h
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const recentCount = await prismadb.systemActivity.count({
        where: { createdAt: { gte: oneDayAgo } }
    });

    return (
        <div className="p-4 md:p-10 space-y-12 min-h-screen bg-[#000000] text-white">
            {/* Neon Header Container */}
            <div className="relative overflow-hidden p-6 md:p-10 rounded-[2rem] bg-black border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                {/* Animated Neon Background Element */}
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Live Surveillance System</span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent italic uppercase leading-none">
                            System <span className="text-primary not-italic">Activity</span>
                        </h1>
                        <p className="text-slate-500 mt-4 md:mt-6 text-base md:text-xl font-medium max-w-3xl leading-relaxed tracking-tight">
                            Intercept and monitor every interaction within the infrastructure. Real-time logging of transitions, resource mutations, and security events.
                        </p>
                    </div>
                </div>
            </div>

            {/* Neon Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="relative overflow-hidden bg-black border-white/5 group hover:border-blue-500/40 transition-all duration-700 rounded-3xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 relative z-10 border-b border-white/5 mx-6 px-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Total Operations</CardTitle>
                        <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
                    </CardHeader>
                    <CardContent className="relative z-10 pt-8 pb-10 px-8">
                        <div className="text-5xl font-black text-white tracking-tighter mb-4 select-none italic">
                            {totalActivities.toLocaleString()}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Global Velocity</span>
                                <span className="text-[10px] font-mono text-blue-400">100% Verified</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[65%] animate-pulse" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-black border-white/5 group hover:border-emerald-500/40 transition-all duration-700 rounded-3xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 relative z-10 border-b border-white/5 mx-6 px-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Pulse (24h)</CardTitle>
                        <Target className="h-5 w-5 text-emerald-500 group-hover:rotate-45 transition-transform duration-700" />
                    </CardHeader>
                    <CardContent className="relative z-10 pt-8 pb-10 px-8">
                        <div className="text-5xl font-black text-white tracking-tighter mb-4 select-none italic">
                            {recentCount.toLocaleString()}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Active Threads</span>
                                <span className="text-[10px] font-mono text-emerald-400">Sync Active</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[42%] animate-pulse" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-black border-white/5 group hover:border-amber-500/40 transition-all duration-700 rounded-3xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 relative z-10 border-b border-white/5 mx-6 px-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Control Unit</CardTitle>
                        <Shield className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent className="relative z-10 pt-8 pb-10 px-8">
                        <div className="text-5xl font-black text-white tracking-tighter mb-4 select-none italic">
                            STABLE
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">Firewall Status</span>
                                <span className="text-[10px] font-mono text-amber-400">Secured</span>
                            </div>
                            <div className="h-1 w-full bg-amber-500/10 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Stream section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                            <Radio className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">Activity Log <span className="text-primary not-italic tracking-normal">Stream</span></h2>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-2">Historical interaction sequence • 100 deep fetch</p>
                        </div>
                    </div>
                </div>

                <ActivityList initialActivities={activities} />
            </div>
        </div>
    );
}
