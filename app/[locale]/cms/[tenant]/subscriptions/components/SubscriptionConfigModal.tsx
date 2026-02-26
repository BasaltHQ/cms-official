"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Bell, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSubscriptionSettings, updateSubscriptionSettings } from "@/actions/cms/subscription-settings";

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionConfigModal({ isOpen, onClose }: ConfigModalProps) {
    const [settings, setSettings] = useState({
        newsletterEnabled: true,
        blogUpdatesEnabled: true,
        careerUpdatesEnabled: true,
        ctaText: "Stay Updated"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getSubscriptionSettings();
            if (res.success && res.data) {
                setSettings({
                    newsletterEnabled: res.data.newsletterEnabled ?? true,
                    blogUpdatesEnabled: res.data.blogUpdatesEnabled ?? true,
                    careerUpdatesEnabled: res.data.careerUpdatesEnabled ?? true,
                    ctaText: res.data.ctaText || "Stay Updated",
                });
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateSubscriptionSettings(settings);
            if (res.success) {
                toast.success("Settings saved");
                onClose();
            } else {
                toast.error(res.error || "Failed to save");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-[#0A0A0B] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Global Configuration
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Manage system-wide notification settings.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Features</h3>

                            <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-black/40 p-4">
                                <Checkbox
                                    id="newsletter"
                                    checked={settings.newsletterEnabled}
                                    onCheckedChange={(c) => setSettings(s => ({ ...s, newsletterEnabled: !!c }))}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="newsletter" className="font-medium">Public Newsletter Signup</Label>
                                    <p className="text-xs text-slate-400">Show the email subscription form in the footer.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Automated Alerts</h3>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="blog"
                                        checked={settings.blogUpdatesEnabled}
                                        onCheckedChange={(c) => setSettings(s => ({ ...s, blogUpdatesEnabled: !!c }))}
                                    />
                                    <Label htmlFor="blog" className="flex items-center gap-2">
                                        Enable Blog Updates
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="career"
                                        checked={settings.careerUpdatesEnabled}
                                        onCheckedChange={(c) => setSettings(s => ({ ...s, careerUpdatesEnabled: !!c }))}
                                    />
                                    <Label htmlFor="career" className="flex items-center gap-2">
                                        Enable Career Alerts
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <Label>CTA Text</Label>
                            <Input
                                value={settings.ctaText}
                                onChange={e => setSettings(s => ({ ...s, ctaText: e.target.value }))}
                                className="bg-black border-white/10 focus-visible:ring-offset-0"
                            />
                        </div>

                        <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Configuration
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
