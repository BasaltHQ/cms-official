"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Radio, Wallet, Image as ImageIcon, Key } from "lucide-react";

interface BroadcastConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialConfig?: {
        neynarApiKey: string;
        signerUuid: string;
        zoraPrivateKey: string;
    };
}

export function BroadcastConnectModal({ isOpen, onClose, onSuccess, initialConfig }: BroadcastConnectModalProps) {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        neynarApiKey: "",
        signerUuid: "",
        zoraPrivateKey: ""
    });

    useEffect(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        }
    }, [initialConfig]);

    const handleSave = async () => {
        // Basic validation - require at least Neynar to "connect"
        if (!config.neynarApiKey || !config.signerUuid) {
            toast.error("Neynar API Key and Signer UUID are required for Farcaster.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/social", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    neynarApiKey: config.neynarApiKey,
                    baseApiKey: config.neynarApiKey, // Sync for legacy support
                    baseSignerUuid: config.signerUuid,
                    zoraPrivateKey: config.zoraPrivateKey
                })
            });

            if (res.ok) {
                toast.success("Broadcast Hub connected successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to save credentials.");
            }
        } catch (error) {
            toast.error("Error connecting Broadcast Hub.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-[#0A0A0B] border-white/10 text-white p-0 overflow-hidden gap-0">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                        <Radio className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white mb-2">Connect Broadcast Hub</DialogTitle>
                    <DialogDescription className="text-white/80">
                        Enter your API keys to enable publishing to Farcaster, Base, and Zora.
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    {/* Farcaster Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                            <Radio className="w-4 h-4" />
                            Farcaster / Base (Neynar)
                        </div>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Neynar API Key <span className="text-red-400">*</span></Label>
                                <Input
                                    value={config.neynarApiKey}
                                    onChange={(e) => setConfig({ ...config, neynarApiKey: e.target.value })}
                                    placeholder="NEYNAR_API_DOCS_..."
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Signer UUID <span className="text-red-400">*</span></Label>
                                <Input
                                    value={config.signerUuid}
                                    onChange={(e) => setConfig({ ...config, signerUuid: e.target.value })}
                                    placeholder="UUID..."
                                    className="bg-white/5 border-white/10 focus:border-blue-500/50"
                                />
                                <p className="text-[10px] text-slate-500">
                                    Required for posting rights.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Optional Services */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                            <Wallet className="w-4 h-4" />
                            Zora Minting
                        </div>
                        <Label className="text-xs text-slate-400">Private Key (Optional)</Label>
                        <Input
                            type="password"
                            value={config.zoraPrivateKey}
                            onChange={(e) => setConfig({ ...config, zoraPrivateKey: e.target.value })}
                            placeholder="0x..."
                            className="bg-white/5 border-white/10 text-xs"
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-900/50 border-t border-white/5">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/5">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-8">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Connect Services"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
