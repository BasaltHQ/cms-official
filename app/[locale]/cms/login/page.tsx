"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname, useParams } from "next/navigation";
import { Loader2, Lock, AlertCircle, Info, Mail } from "lucide-react";
import NextImage from "next/image";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/actions/cms/users";

import { BrandLogo } from "@/components/cms/BrandLogo";

export default function AdminLoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const params = useParams();
    const locale = (params?.locale as string) || "en";

    // If authenticated, redirect to dashboard
    useEffect(() => {
        if (status === "authenticated") {
            router.push(`/${locale}/cms`);
        }
    }, [status, router, locale]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset Password State
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const error = searchParams.get("error");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast.error("Invalid credentials");
                setLoading(false);
            } else {
                toast.success("Logged in successfully");
                // Use locale-aware redirect
                router.push(`/${locale}/cms`);
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        try {
            const res = await requestPasswordReset(resetEmail);
            if (res.success) {
                toast.success("Temporary password sent to your email.");
                setIsResetOpen(false);
                setResetEmail("");
            } else {
                toast.error(res.error || "Failed using this email");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black overflow-x-hidden max-w-full">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(77,191,217,0.15),rgba(0,0,0,0)_50%)] z-0" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] z-0" />

            <div className="w-full max-w-md mx-4 p-4 sm:p-8 glass rounded-2xl relative z-10 border border-[#4DBFD9]/20 shadow-[0_0_50px_-20px_rgba(77,191,217,0.3)] backdrop-blur-3xl">
                {/* Header */}
                <div className="text-center mb-8 flex justify-center">
                    <div className="relative h-40 w-80">
                        <NextImage
                            src="/BasaltCMSWide.png"
                            alt="Basalt CMS"
                            fill
                            className="object-contain drop-shadow-[0_0_25px_rgba(77,191,217,0.2)]"
                            unoptimized
                        />
                    </div>
                </div>

                {error === "unauthorized" && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm backdrop-blur-md">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Access Denied. Admin permissions required.</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#4DBFD9] uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-[#4DBFD9] transition-colors duration-300" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#4DBFD9]/50 focus:ring-2 focus:ring-[#4DBFD9]/20 transition-all duration-300 text-white placeholder:text-slate-600"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold text-[#4DBFD9] uppercase tracking-widest">Password</label>
                            <button
                                type="button"
                                onClick={() => setIsResetOpen(true)}
                                className="text-xs text-slate-400 hover:text-[#4DBFD9] transition-colors font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-[#4DBFD9] transition-colors duration-300" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[#4DBFD9]/50 focus:ring-2 focus:ring-[#4DBFD9]/20 transition-all duration-300 text-white placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#2AA9C7] to-[#4DBFD9] hover:from-[#4DBFD9] hover:to-[#7BD3E6] text-white rounded-xl font-bold shadow-lg shadow-[#4DBFD9]/20 hover:shadow-[#4DBFD9]/40 transform transition-all duration-300 active:scale-[0.98] flex items-center justify-center tracking-wide"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "AUTHENTICATE"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">Secured by Basalt Identity</p>
                </div>
            </div>

            {/* Password Reset Modal */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0B]/95 backdrop-blur-2xl border-[#4DBFD9]/20 text-white shadow-[0_0_50px_-20px_rgba(77,191,217,0.3)] ring-1 ring-white/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Reset Password</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Enter your email address to receive a secure password reset link.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-xs font-bold text-[#4DBFD9] uppercase tracking-widest">Email Address</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="name@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="bg-black/40 border-white/10 text-white focus:border-[#4DBFD9]/50 focus:ring-[#4DBFD9]/20 rounded-lg py-3"
                                required
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={() => setIsResetOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={resetLoading} className="bg-[#2AA9C7] hover:bg-[#4DBFD9] text-white font-semibold">
                                {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
