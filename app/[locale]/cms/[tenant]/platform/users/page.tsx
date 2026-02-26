"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, ShieldAlert, AlertCircle, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserActions } from "./components/UserActions";

interface User {
    id: string;
    name: string;
    email: string;
    userStatus: string;
    is_admin: boolean;
    team_role: string;
    created_on: string;
    assigned_team: {
        name: string;
        slug: string;
    } | null;
}

export default function PlatformUsersPage() {
    const params = useParams();
    const locale = params.locale as string;
    const tenant = params.tenant as string;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortTeam, setSortTeam] = useState<"asc" | "desc" | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/platform/users");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.assigned_team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortTeam) return 0;
        const teamA = a.assigned_team?.name?.toLowerCase() || "\uffff";
        const teamB = b.assigned_team?.name?.toLowerCase() || "\uffff";
        if (teamA < teamB) return sortTeam === "asc" ? -1 : 1;
        if (teamA > teamB) return sortTeam === "asc" ? 1 : -1;
        return 0;
    });

    const totalUsersCount = users.length;
    const adminCount = users.filter(u => u.is_admin).length;
    const uniqueTeams = new Set(users.map(u => u.assigned_team?.name).filter(Boolean)).size;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="h-8 w-8 text-rose-500" />
                        Global User Directory
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage all platform users across all workspaces.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className={`h-8 w-8 rounded-md ${viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={`h-8 w-8 rounded-md ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-black/40 border-white/10 text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#0A0A0B]/80 border-white/5">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-400 font-medium">Total Global Users</p>
                        <p className="text-3xl font-bold text-white mt-2">{totalUsersCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0A0A0B]/80 border-white/5">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-400 font-medium">Active Workspaces</p>
                        <p className="text-3xl font-bold text-white mt-2">{uniqueTeams}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0A0A0B]/80 border-white/5">
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-400 font-medium">Platform God Admins</p>
                        <p className="text-3xl font-bold text-rose-500 mt-2">{adminCount}</p>
                    </CardContent>
                </Card>
            </div>

            {viewMode === "list" ? (
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0A0A0B]/80">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                <th
                                    className="px-6 py-4 font-bold tracking-wider cursor-pointer hover:bg-white/5 transition-colors group select-none"
                                    onClick={() => setSortTeam(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
                                >
                                    <div className="flex items-center gap-2">
                                        Workspace
                                        <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortTeam ? "text-rose-500 opacity-100" : "text-slate-600 opacity-0 group-hover:opacity-100"}`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                                </tr>
                            ) : sortedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                                </tr>
                            ) : (
                                sortedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                                    {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {user.name || "Unnamed User"}
                                                        {user.is_admin && (
                                                            <span className="bg-red-500/10 text-red-500 text-[10px] px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-widest font-black" title="Platform Admin">Root</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <Mail className="h-3 w-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.assigned_team ? (
                                                <div>
                                                    <div className="font-medium text-slate-300">{user.assigned_team.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono tracking-wider">{user.assigned_team.slug}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Orphaned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium tracking-wider text-slate-300">
                                                {user.team_role || "MEMBER"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${user.userStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                user.userStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {user.userStatus}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <UserActions user={user} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {loading ? (
                        <div className="col-span-full h-40 flex items-center justify-center text-slate-400">Loading users...</div>
                    ) : sortedUsers.length === 0 ? (
                        <div className="col-span-full h-40 flex items-center justify-center text-slate-400">No users found.</div>
                    ) : (
                        sortedUsers.map((user) => (
                            <Card key={user.id} className="bg-[#0A0A0B]/80 border-white/5 hover:border-white/10 transition-all relative group overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="absolute top-4 right-4 z-10">
                                        <UserActions user={user} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 mx-auto text-xl shadow-inner mt-2">
                                            {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-white text-base max-w-[90%] mx-auto truncate" title={user.name || "Unnamed"}>
                                                {user.name || "Unnamed User"}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate max-w-[150px]" title={user.email}>{user.email}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase inline-block ${user.userStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    user.userStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                    }`}>
                                                    {user.userStatus}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Role</p>
                                                {user.is_admin ? (
                                                    <span className="bg-red-500/10 text-red-500 text-[9px] px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-widest font-black" title="Platform Admin">Root Admin</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-medium tracking-wider text-slate-300 truncate inline-block">
                                                        {user.team_role || "MEMBER"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-2 text-center bg-white/5 p-2 rounded-lg">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Workspace</p>
                                            {user.assigned_team ? (
                                                <div className="font-medium text-slate-200 mt-0.5 truncate">{user.assigned_team.name}</div>
                                            ) : (
                                                <div className="font-medium text-slate-500 mt-0.5 italic flex items-center justify-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Orphaned
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
