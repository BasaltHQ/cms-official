"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { toast } from "sonner";
import { Loader2, Plus, Trash, User, Shield, Settings as SettingsIcon, Globe, MapPin, Upload, Mail } from "lucide-react";
import { updateProfile } from "@/actions/cms-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
    createdAt: string;
}

interface CMSModule {
    slug: string;
    label: string;
}

const TIMEZONES = [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Anchorage", "Pacific/Honolulu", "Europe/London", "Europe/Paris",
    "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Asia/Singapore",
    "Australia/Sydney", "Pacific/Auckland",
];

const REGIONS = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Japan",
    "China", "Australia", "Singapore", "UAE", "India", "Brazil", "Mexico",
];

import { TeamManagement } from "@/components/cms/TeamManagement";
import { RoleManagement } from "@/components/cms/RoleManagement";

import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

// ... existing imports

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    // Allow if admin OR has "team" module access
    const canManageTeam = session?.user?.isAdmin || session?.user?.cmsModules?.includes("team");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (status === "loading" || !mounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Manage your profile, team members, and system preferences.</p>
            </div>

            <Tabs defaultValue={canManageTeam ? "team" : "profile"} className="w-full">
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-8">
                    <TabsTrigger value="profile" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">My Profile</TabsTrigger>
                    {canManageTeam && <TabsTrigger value="team" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">User Management</TabsTrigger>}
                    {canManageTeam && <TabsTrigger value="roles" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">Role Management</TabsTrigger>}
                </TabsList>

                <TabsContent value="profile" className="focus-visible:ring-0 focus-visible:outline-none">
                    <ProfileSettings />
                </TabsContent>

                {canManageTeam && (
                    <TabsContent value="team" className="focus-visible:ring-0 focus-visible:outline-none">
                        <TeamManagement />
                    </TabsContent>
                )}

                {canManageTeam && (
                    <TabsContent value="roles" className="focus-visible:ring-0 focus-visible:outline-none">
                        <RoleManagement />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function ProfileSettings() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [timezone, setTimezone] = useState("");
    const [region, setRegion] = useState("");

    // Initialize state from session
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setTimezone(session.user.timezone || "");
            setRegion(session.user.region || "");
        }
    }, [session]);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateProfile({
                name: name || undefined,
                password: password || undefined,
                timezone: timezone || undefined,
                region: region || undefined,
            });
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Profile updated successfully");
                setPassword("");
                // Update client-side session to reflect changes immediately
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: name,
                        timezone: timezone,
                        region: region
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-lg p-6 max-w-2xl space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-blue-500" /> Your Profile
            </h2>

            {/* Profile Photo Upload */}
            <ProfilePhotoUpload />

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Display Name</label>
                    <input
                        className="w-full p-2 border rounded-md bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to keep current name</p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">New Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded-md bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to keep current password. Min 6 chars.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1">
                            <Globe className="h-4 w-4" /> Timezone
                        </label>
                        <select
                            className="w-full p-2 border rounded-md bg-black/50 border-white/10 text-white focus:border-blue-500 transition-colors"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        >
                            <option value="">Select timezone...</option>
                            {TIMEZONES.map((tz) => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> Region
                        </label>
                        <select
                            className="w-full p-2 border rounded-md bg-black/50 border-white/10 text-white focus:border-blue-500 transition-colors"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                        >
                            <option value="">Select region...</option>
                            {REGIONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="gradient"
                    disabled={loading}
                    className="flex items-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update Profile
                </Button>
            </form>

            <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Need Help?</h3>
                <p className="text-xs text-slate-500 mb-3">
                    Can&apos;t remember your password or need it reset? Contact support and we&apos;ll help you out.
                </p>
                <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@basalthq.com'}?subject=Password Reset Request&body=Please reset my password for the CMS.`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-md transition-colors border border-white/10"
                >
                    <Mail className="h-4 w-4" /> Request Password Reset
                </a>
            </div>
        </div>
    );
}

function ProfilePhotoUpload() {
    const { data: session, update } = useSession();
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);

    // Initialize avatar from session
    useEffect(() => {
        if (session?.user?.avatar) {
            setAvatar(session.user.avatar);
        } else if (session?.user?.image) {
            setAvatar(session.user.image);
        }
    }, [session]);

    const resizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas to Blob failed"));
                    }, "image/jpeg", 0.8);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Resize image before upload
            const resizedBlob = await resizeImage(file);
            const resizedFile = new File([resizedBlob], "profile.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("file", resizedFile);

            const res = await fetch("/api/profile/upload-photo", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setAvatar(data.avatar);
            toast.success("Profile photo updated");

            // Update session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    avatar: data.avatar,
                    image: data.avatar
                }
            });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-[#0A0A0B] rounded-lg border border-white/5">
            <div className="relative h-16 w-16 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {avatar ? (
                    <NextImage src={avatar} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                    <User className="h-8 w-8 text-slate-500" />
                )}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Profile Photo</p>
                <p className="text-xs text-slate-500">Upload a profile picture (JPG, PNG, max 5MB)</p>
            </div>
            <label className="cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />
                <Button
                    variant="gradient"
                    disabled={uploading}
                    className="pointer-events-none" // Button is visual only, input handles click via label
                    asChild // Use asChild to prevent button-inside-label a11y issues if we could, but here we just wrap visual
                >
                    <div className="flex items-center gap-2 pointer-events-auto">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploading ? "Uploading..." : "Upload"}
                    </div>
                </Button>
            </label>
        </div>
    );
}
