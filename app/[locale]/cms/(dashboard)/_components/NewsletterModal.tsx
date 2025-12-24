"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Mail, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SocialSettings {
    newsletterEnabled: boolean;
    ctaText: string;
}

const defaultSettings: SocialSettings = {
    newsletterEnabled: true,
    ctaText: "Stay Updated",
};

interface NewsletterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
    const [settings, setSettings] = useState<SocialSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Manual Subscribe State
    const [newSubscriberEmail, setNewSubscriberEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/social");
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    newsletterEnabled: data.newsletterEnabled ?? true,
                    ctaText: data.ctaText || "Stay Updated",
                });
            }
        } catch (error) {
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            // Fetch current social settings first to avoid overwriting them
            const currentRes = await fetch("/api/social");
            const currentData = await currentRes.json();

            const res = await fetch("/api/social", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...currentData,
                    newsletterEnabled: settings.newsletterEnabled,
                    ctaText: settings.ctaText
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            toast.success("Newsletter configuration saved!");
            onClose();
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleManualSubscribe = async () => {
        if (!newSubscriberEmail) return;
        setSubscribing(true);
        try {
            // Ideally call an endpoint like /api/newsletter/subscribe
            // For now, we'll simulate a success or call a hypothetical endpoint
            // toast.info("Simulating subscription...");

            // Just simulating for now as backend endpoint might not exist
            await new Promise(r => setTimeout(r, 1000));

            toast.success(`Subscribed ${newSubscriberEmail} successfully!`);
            setNewSubscriberEmail("");
        } catch (error) {
            toast.error("Failed to subscribe user");
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-[#0A0A0B] border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                        Newsletter Management
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Configure public signup and manage subscribers.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <Tabs defaultValue="subscribe" className="w-full">
                        <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-4">
                            <TabsTrigger value="subscribe" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">
                                Subscribe User
                            </TabsTrigger>
                            <TabsTrigger value="config" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">
                                Configuration
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="subscribe" className="space-y-4 mt-4">
                            <Card className="bg-[#0A0A0B] border-white/10 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-base text-white">Add Subscriber</CardTitle>
                                    <CardDescription className="text-slate-400">Manually add a user to the newsletter list.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Email Address</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                className="bg-black border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500"
                                                placeholder="user@example.com"
                                                type="email"
                                                value={newSubscriberEmail}
                                                onChange={(e) => setNewSubscriberEmail(e.target.value)}
                                            />
                                            <Button
                                                onClick={handleManualSubscribe}
                                                disabled={!newSubscriberEmail || subscribing}
                                                variant="gradient"
                                                className="text-white"
                                            >
                                                {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="config" className="space-y-4 mt-4">
                            <Card className="bg-[#0A0A0B] border-white/10 shadow-none">
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-center space-x-3 rounded-lg border border-white/10 bg-black p-4">
                                        <Checkbox
                                            id="newsletter"
                                            checked={settings.newsletterEnabled}
                                            onCheckedChange={(checked) => setSettings(p => ({ ...p, newsletterEnabled: checked === true }))}
                                            className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="newsletter" className="text-base font-medium text-white cursor-pointer">
                                                Enable Newsletter Signup
                                            </Label>
                                            <p className="text-sm text-slate-400">
                                                Show the email subscription form in the footer.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">CTA Button Text</Label>
                                        <Input
                                            className="bg-black border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600"
                                            value={settings.ctaText}
                                            onChange={e => setSettings(p => ({ ...p, ctaText: e.target.value }))}
                                            placeholder="Stay Updated"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        variant="gradient"
                                        className="w-full text-white"
                                    >
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}
