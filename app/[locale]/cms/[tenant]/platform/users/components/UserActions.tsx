"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, Trash, Shield, ShieldOff, CheckCircle, XCircle, LayoutDashboard } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SpawnTeamModal } from "./SpawnTeamModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function UserActions({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("User ID copied to clipboard");
    };

    const performAction = async (action: string, endpoint: string) => {
        try {
            setLoading(true);
            if (action === "delete") {
                await axios.delete(endpoint);
            } else {
                await axios.post(endpoint);
            }
            toast.success(`User ${action} successful`);

            // Delay refresh slightly for DB persistence
            setTimeout(() => {
                router.refresh();
            }, 500);
        } catch (error) {
            toast.error(`Failed to ${action} user`);
        } finally {
            setLoading(false);
        }
    };

    const handleSpawnTeamSubmit = async (data: { teamName: string; slug: string; resetPassword?: string }) => {
        try {
            setLoading(true);
            await axios.post(`/api/platform/users/${user.id}/spawn-team`, data);
            toast.success(`Workspace '${data.teamName}' created successfully`);
            setIsSpawnModalOpen(false);
            setTimeout(() => {
                router.refresh();
            }, 500);
        } catch (error) {
            toast.error("Failed to sequence workspace instantiation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SpawnTeamModal
                isOpen={isSpawnModalOpen}
                onClose={() => setIsSpawnModalOpen(false)}
                user={user}
                onSubmit={handleSpawnTeamSubmit}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10" disabled={loading}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0A0A0B] border-white/10 text-slate-300">
                    <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(user.id)} className="hover:bg-white/5 cursor-pointer">
                        <Copy className="mr-2 w-4 h-4" />
                        Copy ID
                    </DropdownMenuItem>

                    {user.userStatus === "ACTIVE" ? (
                        <DropdownMenuItem onClick={() => performAction("deactivate", `/api/user/deactivate/${user.id}`)} className="hover:bg-white/5 cursor-pointer">
                            <XCircle className="mr-2 w-4 h-4 text-yellow-500" />
                            Deactivate User
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => performAction("activate", `/api/user/activate/${user.id}`)} className="hover:bg-white/5 cursor-pointer">
                            <CheckCircle className="mr-2 w-4 h-4 text-emerald-500" />
                            Activate User
                        </DropdownMenuItem>
                    )}

                    {user.is_admin ? (
                        <DropdownMenuItem onClick={() => performAction("remove admin rights", `/api/user/deactivateAdmin/${user.id}`)} className="hover:bg-white/5 cursor-pointer">
                            <ShieldOff className="mr-2 w-4 h-4 text-orange-400" />
                            Deactivate Admin Rights
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => performAction("grant admin rights", `/api/user/activateAdmin/${user.id}`)} className="hover:bg-white/5 cursor-pointer">
                            <Shield className="mr-2 w-4 h-4 text-indigo-400" />
                            Grant Admin Rights
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => setIsSpawnModalOpen(true)} className="hover:bg-white/5 cursor-pointer text-blue-400">
                        <LayoutDashboard className="mr-2 w-4 h-4" />
                        Spawn Workspace
                    </DropdownMenuItem>


                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="hover:bg-red-500/10 text-red-400 cursor-pointer">
                        <Trash className="mr-2 w-4 h-4" />
                        Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0A0A0B] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will permanently delete the user account for <span className="text-white font-medium">{user.name || user.email}</span> and remove their data from our servers.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => performAction("delete", `/api/user/${user.id}`)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
