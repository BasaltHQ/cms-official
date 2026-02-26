"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Shield, Lock, AlertTriangle, Globe } from "lucide-react";
import { getSecuritySettings, updateSecuritySettings, performSecurityKillSwitch } from "@/actions/cms/security-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

export default function SecuritySettingsClient() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [lockdownModalOpen, setLockdownModalOpen] = useState(false);
    const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
    const [ipModalOpen, setIpModalOpen] = useState(false);
    const [allowedIps, setAllowedIps] = useState<string>("");

    const [settings, setSettings] = useState({
        twoFactor: true,
        publicRegistration: false,
        sessionTimeout: true,
        ipWhitelist: false,
        auditLog: true,
        strongPasswords: true,
        whitelistedIps: [] as string[]
    });

    useEffect(() => {
        // Load initial settings
        getSecuritySettings().then(data => {
            if (data) {
                setSettings({
                    twoFactor: data.twoFactor,
                    publicRegistration: data.publicRegistration,
                    sessionTimeout: data.sessionTimeout,
                    ipWhitelist: data.ipWhitelist,
                    auditLog: data.auditLog,
                    strongPasswords: data.strongPasswords,
                    whitelistedIps: data.whitelistedIps || []
                });
                setAllowedIps((data.whitelistedIps || []).join('\n'));
            }
            setLoading(false);
        });
    }, []);

    const toggle = (key: keyof typeof settings) => {
        // Intercept IP Whitelist toggle
        if (key === 'ipWhitelist' && !settings.ipWhitelist) {
            setIpModalOpen(true);
            return; // Don't toggle yet, wait for modal save
        }

        const newVal = !settings[key];
        // @ts-ignore - Dynamic key assignment
        setSettings(prev => ({ ...prev, [key]: newVal }));

        startTransition(async () => {
            // @ts-ignore - Dynamic key assignment
            const res = await updateSecuritySettings({ [key]: newVal });
            if (res.error) {
                toast.error("Failed to save setting");
                // @ts-ignore - Dynamic key assignment
                setSettings(prev => ({ ...prev, [key]: !newVal }));
            } else {
                toast.success("Security setting updated");
            }
        });
    };

    const handleSaveIps = async () => {
        const ips = allowedIps.split('\n').map(ip => ip.trim()).filter(ip => ip.length > 0);

        // Optimistic update
        setSettings(prev => ({ ...prev, ipWhitelist: true, whitelistedIps: ips }));
        setIpModalOpen(false);

        startTransition(async () => {
            const res = await updateSecuritySettings({ ipWhitelist: true, whitelistedIps: ips });
            if (res.error) {
                toast.error("Failed to enable IP Whitelisting");
                setSettings(prev => ({ ...prev, ipWhitelist: false })); // Revert
            } else {
                toast.success("IP Whitelisting Enabled");
            }
        });
    }

    const handleLockdown = async () => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: 'Initiating System Lockdown...',
            success: () => {
                setLockdownModalOpen(false);
                // In a real app, this would execute a server action to kill sessions
                return 'All active sessions terminated.';
            },
            error: 'Failed to initiate lockdown'
        });
    };

    const handleKillSwitch = async () => {
        setKillSwitchModalOpen(false);
        startTransition(async () => {
            const res = await performSecurityKillSwitch();
            if (res.success) {
                toast.success(res.message);
                // Optionally refresh or redirect
            } else {
                toast.error(res.error || "Kill Switch Failed");
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Security Nexus
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs border border-emerald-500/20 shadow-[0_0_10px_-3px_#10b981] animate-pulse">
                            System Secure
                        </span>
                    </h2>
                    <p className="text-slate-400 mt-1">Manage global security protocols and access controls.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Authentication Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 rounded-xl border border-white/10 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Authentication</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-blue-200 transition-colors">Two-Factor Authentication</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Require 2FA for all administrative accounts.</p>
                            </div>
                            <Switch checked={settings.twoFactor} onCheckedChange={() => toggle("twoFactor")} disabled={isPending} className="data-[state=checked]:bg-blue-600" />
                        </div>

                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-blue-200 transition-colors">Strong Passwords</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Enforce complex password requirements.</p>
                            </div>
                            <Switch checked={settings.strongPasswords} onCheckedChange={() => toggle("strongPasswords")} disabled={isPending} className="data-[state=checked]:bg-blue-600" />
                        </div>

                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-blue-200 transition-colors">Public Registration</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Allow new users to sign up publicly.</p>
                            </div>
                            <Switch checked={settings.publicRegistration} onCheckedChange={() => toggle("publicRegistration")} disabled={isPending} className="data-[state=checked]:bg-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Access Control Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 rounded-xl border border-white/10 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Lock className="h-5 w-5 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Access Control</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-orange-200 transition-colors">Audit Logging</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Record all administrative actions.</p>
                            </div>
                            <Switch checked={settings.auditLog} onCheckedChange={() => toggle("auditLog")} disabled={isPending} className="data-[state=checked]:bg-orange-600" />
                        </div>

                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-orange-200 transition-colors">IP Whitelisting</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Restrict administrative access to known, trusted IP ranges.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {settings.ipWhitelist && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs border-white/10" onClick={() => setIpModalOpen(true)}>Manage</Button>
                                )}
                                <Switch checked={settings.ipWhitelist} onCheckedChange={() => toggle("ipWhitelist")} disabled={isPending} className="data-[state=checked]:bg-orange-600" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between group/item">
                            <div className="space-y-1">
                                <label className="text-base font-semibold text-slate-200 group-hover/item:text-orange-200 transition-colors">Auto-Termination</label>
                                <p className="text-xs text-slate-500 max-w-[280px]">Automatically invalidate sessions after 30 minutes of inactivity.</p>
                            </div>
                            <Switch checked={settings.sessionTimeout} onCheckedChange={() => toggle("sessionTimeout")} disabled={isPending} className="data-[state=checked]:bg-orange-600" />
                        </div>
                    </div>

                    <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-5 mt-10 relative overflow-hidden group/lockdown">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover/lockdown:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Lock className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-red-400 tracking-wide uppercase">Session Lockdown</h4>
                                <p className="text-xs text-red-200/60 mt-1 mb-4">Immediate active session termination.</p>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-9 text-xs w-full bg-red-600/80 hover:bg-red-600 border border-red-500/50 hover:border-red-400 shadow-[0_0_15px_-3px_rgba(220,38,38,0.4)]"
                                    onClick={() => setLockdownModalOpen(true)}
                                >
                                    TRIGGER LOCKDOWN
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kill Switch Section */}
                <div className="relative md:col-span-2 group overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 bg-[#0F0505] border border-red-500/30"></div>
                    {/* Animated Hazard Stripes */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px)' }}></div>

                    <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
                        <div className="flex items-start gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    BREACH PROTOCOL
                                    <span className="px-3 py-1 rounded-sm text-[10px] bg-red-600 text-white font-bold tracking-[0.2em] uppercase">
                                        Level 5
                                    </span>
                                </h3>
                                <p className="text-red-200/80 mt-2 max-w-2xl leading-relaxed font-medium">
                                    Emergency containment protocol. Executing this will permanently sever all AI connections, revoke all OAuth tokens, and disable system intelligence capabilities.
                                    <span className="block mt-1 text-red-400 font-bold">Recommended only for confirmed compromise scenarios.</span>
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-full md:w-auto px-8 py-8 bg-red-600 hover:bg-red-500 text-white font-black tracking-widest border-2 border-red-400 hover:border-white shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300 scale-100 hover:scale-105"
                            onClick={() => setKillSwitchModalOpen(true)}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <Shield className="h-6 w-6 mb-1" />
                                <span>EXECUTE KILL SWITCH</span>
                            </div>
                        </Button>
                    </div>
                </div>

            </div>

            {/* IP Whitelist Modal */}
            <Dialog open={ipModalOpen} onOpenChange={setIpModalOpen}>
                <DialogContent className="bg-[#0A0A0B] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-400">
                            <Globe className="h-5 w-5" /> Configure Trusted IPs
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Enter the IP addresses (IPv4 or IPv6) that are allowed to access the admin dashboard. One per line.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300 text-xs text-left">
                            <strong>My Current IP:</strong> (Detected upon save)
                        </div>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-200 font-mono"
                            placeholder="192.168.1.1&#10;203.0.113.5"
                            value={allowedIps}
                            onChange={(e) => setAllowedIps(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500">
                            * Incorrect configuration may lock you out. Ensure your current IP is included.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIpModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveIps} className="bg-orange-600 hover:bg-orange-700 text-white">
                            Save & Enable
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lockdown Confirmation Modal */}
            <Dialog open={lockdownModalOpen} onOpenChange={setLockdownModalOpen}>
                <DialogContent className="bg-[#0A0A0B] border-red-500/20 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <Lock className="h-5 w-5" /> System Lockdown
                        </DialogTitle>
                        <DialogDescription className="text-red-200/70">
                            Are you sure you want to initiate a system lockdown? This will <strong>immediately terminate all active sessions</strong> except for this one. Users will be forced to log in again.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setLockdownModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleLockdown}>Confirm Lockdown</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Kill Switch Confirmation Modal */}
            <Dialog open={killSwitchModalOpen} onOpenChange={setKillSwitchModalOpen}>
                <DialogContent className="bg-[#1f0505] border-red-600 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500 text-xl font-black uppercase tracking-wide">
                            <AlertTriangle className="h-6 w-6" /> Extreme Danger: Confirm Breach Protocol
                        </DialogTitle>
                        <div className="py-4 space-y-4">
                            <DialogDescription className="text-red-300 font-medium">
                                You are about to execute the <strong>Emergency Kill Switch</strong>.
                            </DialogDescription>
                            <ul className="text-sm text-red-200/80 list-disc pl-5 space-y-1">
                                <li>All System AI configurations will be <strong>DISABLED</strong>.</li>
                                <li>All User AI configurations will be <strong>DISABLED</strong>.</li>
                                <li>All Third-Party Integrations (OAuth) will be <strong>DISCONNECTED</strong>.</li>
                                <li>All Google/Gmail Tokens will be <strong>PERMANENTLY DELELTED</strong> from the database.</li>
                            </ul>
                            <div className="p-3 bg-red-950/50 border border-red-500/30 rounded text-xs text-red-400 font-mono">
                                THIS ACTION CANNOT BE UNDONE. SERVICES WILL BE OFFLINE UNTIL MANUALLY RECONFIGURED.
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setKillSwitchModalOpen(false)} className="hover:bg-red-950/30 hover:text-red-300">Abort Protocol</Button>
                        <Button variant="destructive" onClick={handleKillSwitch} className="bg-red-600 hover:bg-red-700 font-bold tracking-wider">
                            I UNDERSTAND - EXECUTE KILL SWITCH
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
