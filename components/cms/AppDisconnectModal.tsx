"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AppIntegration {
    id: string;
    providerId: string;
    name: string;
    connected: boolean;
}

interface AppDisconnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: AppIntegration;
    onSuccess: () => void;
}

export function AppDisconnectModal({ isOpen, onClose, app, onSuccess }: AppDisconnectModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/cms/apps/connections?providerId=${app.providerId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success(`Disconnected ${app.name}`);
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to disconnect");
            }
        } catch (error) {
            toast.error("Error disconnecting app");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0A0A0B] border-white/10 text-white">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-xl">Disconnect {app.name}?</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Are you sure you want to disconnect <strong>{app.name}</strong>? This will stop all syncing and publishing activities associated with this integration. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect Integration"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
