"use client";

import { useEffect, useState } from "react";
import { Globe, Plus, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Team {
    id: string;
    name: string;
    slug: string;
    status: string;
    subscription_plan: string;
    created_at: string;
    _count?: {
        members: number;
    };
}

export default function PlatformTeamsPage() {
    const params = useParams();
    const locale = params.locale as string;
    const tenant = params.tenant as string;

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // In a real implementation this would call an API route
        // GET /api/platform/teams
        const fetchTeams = async () => {
            try {
                const res = await fetch("/api/platform/teams");
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data.teams);
                }
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Globe className="h-8 w-8 text-red-500" />
                        Workspaces Config
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage all tenant instances and system limits globally.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search workspaces..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                        <Plus className="h-4 w-4 mr-2" /> New Workspace
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-slate-400">Loading workspaces...</div>
                ) : filteredTeams.length === 0 ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-slate-400">No workspaces found.</div>
                ) : (
                    filteredTeams.map((team) => (
                        <Card key={team.id} className="bg-[#0A0A0B]/80 border-white/5 hover:border-red-500/30 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400 w-0 group-hover:w-full transition-all duration-500" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{team.name}</h3>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{team.slug}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${team.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        }`}>
                                        {team.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 block">Plan</span>
                                        <span className="text-slate-300 font-medium">{team.subscription_plan}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 block">Users</span>
                                        <span className="text-slate-300 font-medium">{team._count?.members || 0}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                                    <Button variant="outline" className="w-full bg-transparent border-white/10 hover:bg-white/5 text-slate-300" size="sm">
                                        Edit
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300" size="sm">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
