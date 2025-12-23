"use client";

import { useEffect, useState, useCallback } from "react";
import { getUsers, deleteUser, toggleUserStatus, resetUserPassword } from "@/actions/cms/users";
import { UserManagementModal } from "@/components/cms/UserManagementModal";
import { DeleteUserDialog } from "@/components/cms/DeleteUserDialog";
import { ResetPasswordDialog } from "@/components/cms/ResetPasswordDialog";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Search, MoreHorizontal, Pencil, Trash2, Shield, AlertCircle, LayoutGrid, List, Users, UserCog, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export function TeamManagement() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [teamViewMode, setTeamViewMode] = useState<"team" | "users">("team");

    // Force "users" view for non-admins
    useEffect(() => {
        if (session && !session.user?.isAdmin) {
            setTeamViewMode("users");
        }
    }, [session]);

    const filteredUsers = users.filter(user => {
        const isTeamMember = user.email === "admin@ledger1.ai" || user.is_admin || ["Admin", "Super Admin", "Editor"].includes(user.assigned_role?.name || "");

        if (teamViewMode === "team") {
            return isTeamMember;
        } else {
            return !isTeamMember;
        }
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUsers(searchQuery);
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchUsers();

        const handleRoleUpdate = () => {
            console.log("Refreshing team list due to role update...");
            fetchUsers();
        };
        window.addEventListener("role-update", handleRoleUpdate);
        return () => window.removeEventListener("role-update", handleRoleUpdate);
    }, [fetchUsers]);

    useEffect(() => {
        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [fetchUsers]);

    // Refresh when modal closes (if saved) - simplified by just refetching
    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchUsers();
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteClick = (user: any) => {
        if (user.email === "admin@ledger1.ai") {
            toast.error("Cannot delete the Owner/Super Admin.");
            return;
        }
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setDeleteLoading(true);
        try {
            const result = await deleteUser(userToDelete.id);
            if (result.success) {
                toast.success("User deleted");
                fetchUsers();
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleToggleStatus = async (user: any) => {
        if (user.email === "admin@ledger1.ai") {
            toast.error("Cannot change status of the Owner/Super Admin.");
            return;
        }
        const newStatus = user.userStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const result = await toggleUserStatus(user.id, newStatus);
        if (result.success) {
            toast.success(`User ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
            fetchUsers();
        } else {
            toast.error(result.error);
        }
    };

    const [userToReset, setUserToReset] = useState<any>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const handleResetPassword = (user: any) => {
        setUserToReset(user);
        setIsResetModalOpen(true);
    };

    const confirmResetPassword = async () => {
        if (!userToReset) return;
        setResetLoading(true);
        const toastId = toast.loading("Resetting password...");
        try {
            const result = await resetUserPassword(userToReset.id);
            if (result.success) {
                toast.success(result.message, { id: toastId });
                setIsResetModalOpen(false);
                setUserToReset(null);
            } else {
                toast.error(result.error, { id: toastId });
            }
        } catch (e) {
            toast.error("Failed to reset password", { id: toastId });
        } finally {
            setResetLoading(false);
        }
    };

    const isOwner = (user: any) => user.email === "admin@ledger1.ai";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {teamViewMode === "team" ? "Team & Admins" : "Users Management"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {teamViewMode === "team"
                            ? "Manage internal team members, admins, and permissions."
                            : "Manage registered users and viewers."}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {/* View Toggle for Admins */}
                    {session?.user?.isAdmin && (
                        <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1 mr-2 shrink-0">
                            <button
                                onClick={() => setTeamViewMode("team")}
                                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", teamViewMode === "team" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                            >
                                <UserCog className="h-3.5 w-3.5" />
                                Team
                            </button>
                            <button
                                onClick={() => setTeamViewMode("users")}
                                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", teamViewMode === "users" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                            >
                                <Users className="h-3.5 w-3.5" />
                                Users
                            </button>
                        </div>
                    )}

                    <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Button onClick={handleCreate} variant="gradient" className="text-white gap-2">
                        <Plus className="h-4 w-4" /> Add Member
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-[#0A0A0B] p-2 rounded-xl border border-white/10 w-fit">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[300px] bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-500"
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading && users.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading team members...</p>
                </div>
            ) : viewMode === "list" ? (
                /* List View */
                <div className="rounded-xl border border-white/10 overflow-x-auto bg-[#0A0A0B]/50 backdrop-blur-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400 font-medium">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-white/10">
                                                <AvatarImage src={user.avatar} className="object-cover" />
                                                <AvatarFallback className="bg-slate-800 text-slate-400">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    {user.name || "Unknown"}
                                                    {isOwner(user) && <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/10 text-amber-500 border-amber-500/20">Owner</Badge>}
                                                </div>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {isOwner(user) ? (
                                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1.5">
                                                <Shield className="h-3 w-3" />
                                                Super Admin
                                            </Badge>
                                        ) : user.assigned_role ? (
                                            <Badge
                                                variant="outline"
                                                className="gap-1.5"
                                                style={{
                                                    backgroundColor: `${user.assigned_role.color && user.assigned_role.color.startsWith('#') ? user.assigned_role.color + '20' : ROLE_COLORS[user.assigned_role.color || "blue"]?.match(/bg-(\w+)-500\/10/)?.[1] === "blue" ? "#3b82f620" : "#3b82f620"}`,
                                                    borderColor: user.assigned_role.color && user.assigned_role.color.startsWith('#') ? `${user.assigned_role.color}40` : undefined,
                                                    color: user.assigned_role.color && user.assigned_role.color.startsWith('#') ? user.assigned_role.color : undefined
                                                }}
                                            >
                                                <Shield className="h-3 w-3" />
                                                {user.assigned_role.name}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-800 text-slate-500 border-white/5">
                                                No Role
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={
                                                user.userStatus === "ACTIVE"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                            }
                                        >
                                            {user.userStatus}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {format(new Date(user.created_on), 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#0A0A0B] border-white/10 text-white">
                                                <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleResetPassword(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                                    <Lock className="mr-2 h-4 w-4 text-amber-400" /> Reset Password
                                                </DropdownMenuItem>
                                                {!isOwner(user) && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                                            <AlertCircle className="mr-2 h-4 w-4" />
                                                            {user.userStatus === "ACTIVE" ? "Deactivate User" : "Activate User"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-400">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-[#0A0A0B]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center text-center relative group hover:border-white/20 transition-all">
                            <div className="absolute top-4 right-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#0A0A0B] border-white/10 text-white">
                                        <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleResetPassword(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                            <Lock className="mr-2 h-4 w-4 text-amber-400" /> Reset Password
                                        </DropdownMenuItem>
                                        {!isOwner(user) && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                    {user.userStatus === "ACTIVE" ? "Deactivate User" : "Activate User"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 hover:text-red-400">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Avatar className="h-20 w-20 border-2 border-white/10 mb-4">
                                <AvatarImage src={user.avatar} className="object-cover" />
                                <AvatarFallback className="bg-slate-800 text-slate-400 text-xl">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>

                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center justify-center gap-2">
                                {user.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 truncate w-full">@{user.username || user.email.split('@')[0]}</p>

                            <div className="flex flex-wrap gap-2 justify-center mb-4">
                                {isOwner(user) ? (
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Owner: Super Admin</Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        style={{
                                            borderColor: user.assigned_role?.color && user.assigned_role.color.startsWith('#') ? `${user.assigned_role.color}40` : undefined,
                                            color: user.assigned_role?.color && user.assigned_role.color.startsWith('#') ? user.assigned_role.color : undefined,
                                            backgroundColor: user.assigned_role?.color && user.assigned_role.color.startsWith('#') ? `${user.assigned_role.color}10` : undefined
                                        }}
                                        className={!user.assigned_role?.color?.startsWith('#') ? (ROLE_COLORS[user.assigned_role?.color || "blue"] || ROLE_COLORS["blue"]) : ""}
                                    >
                                        {user.assigned_role?.name || "No Role"}
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className={
                                        user.userStatus === "ACTIVE"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }
                                >
                                    {user.userStatus}
                                </Badge>
                            </div>

                            <div className="mt-auto w-full pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-xs text-slate-500">
                                <div className="text-left">
                                    <span className="block text-slate-600">Joined</span>
                                    {format(new Date(user.created_on), 'MMM d, yyyy')}
                                </div>
                                <div className="text-right">
                                    <span className="block text-slate-600">ID</span>
                                    #{user.id.slice(-4)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="col-span-full p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                            No users found.
                        </div>
                    )}
                </div>
            )}

            <UserManagementModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                user={selectedUser}
            />

            <DeleteUserDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
                userName={userToDelete?.name}
            />

            <ResetPasswordDialog
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={confirmResetPassword}
                loading={resetLoading}
                userName={userToReset?.name}
            />
        </div >
    );

}
