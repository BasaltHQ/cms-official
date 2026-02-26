"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Save, Lock, GripVertical, Trash2, RotateCcw, ExternalLink, Sparkles, Image as ImageIcon, Laptop, Smartphone, Check, Upload } from "lucide-react";
import {
    FaXTwitter, FaDiscord, FaLinkedin, FaInstagram, FaFacebook,
    FaYoutube, FaTiktok, FaGithub, FaTelegram, FaReddit, FaThreads, FaMastodon,
    FaAppStore, FaGooglePlay, FaEnvelope, FaPhone
} from "react-icons/fa6";

import { DeleteConfirmationModal } from "@/components/cms/DeleteConfirmationModal";
import { restoreFooterDefaults } from "@/actions/cms/restore-footer-defaults";
import { getSeoConfig, updateSeoConfig, generateAiMetadata } from "@/actions/cms/seo-actions";
import { getHeaderConfig } from "@/actions/cms/header-actions";
import { MediaPickerModal } from "@/components/cms/MediaPickerModal";
import HeaderEditor from "@/components/cms/header/HeaderEditor";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---

interface FooterLink {
    id?: string;
    text: string;
    url: string;
}

interface FooterSection {
    id?: string;
    title: string;
    order: number;
    isBase?: boolean;
    links: FooterLink[];
}

interface FooterSettings {
    tagline: string;
    copyrightText: string;
    footerLogoUrl: string;
}

interface SocialSettings {
    xTwitterUrl: string;
    discordUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    githubUrl: string;
    telegramUrl: string;
    redditUrl: string;
    threadsUrl: string;
    mastodonUrl: string;
    emailSupport: string;
    emailSales: string;
    phoneNumber: string;
    appStoreUrl: string;
    playStoreUrl: string;
}

const defaultSocialSettings: SocialSettings = {
    xTwitterUrl: "", discordUrl: "", linkedinUrl: "", instagramUrl: "", facebookUrl: "",
    youtubeUrl: "", tiktokUrl: "", githubUrl: "", telegramUrl: "", redditUrl: "",
    threadsUrl: "", mastodonUrl: "", emailSupport: "", emailSales: "", phoneNumber: "",
    appStoreUrl: "", playStoreUrl: "",
};

interface SeoSettings {
    globalTitle: string;
    globalDescription: string;
    ogImage: string;
    ogTitle: string;
    ogDescription: string;
    twitterCard: string;
    twitterImage: string;
    faviconUrl: string;
}

const defaultSeoSettings: SeoSettings = {
    globalTitle: "Basalt CMS | The Intelligent Visual Builder",
    globalDescription: "Build, scale, and manage your digital presence with the world's most powerful AI-assisted visual CMS.",
    ogImage: "/images/opengraph-image.png",
    ogTitle: "",
    ogDescription: "",
    twitterCard: "summary_large_image",
    twitterImage: "",
    faviconUrl: "",
};

export default function FooterAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Footer State
    const [settings, setSettings] = useState<FooterSettings>({
        tagline: "",
        copyrightText: "",
        footerLogoUrl: "",
    });
    const [sections, setSections] = useState<FooterSection[]>([]);
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const [restoring, setRestoring] = useState(false);
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);

    // Social & SEO State
    const [socialSettings, setSocialSettings] = useState<SocialSettings>(defaultSocialSettings);
    const [seoSettings, setSeoSettings] = useState<SeoSettings>(defaultSeoSettings);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<any>(null);

    const tabParam = searchParams.get("tab") || "content";

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", val);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Footer Data
            const footerRes = await fetch("/api/footer");
            const footerData = await footerRes.json();
            setSettings(footerData.settings || { tagline: "", copyrightText: "", footerLogoUrl: "" });
            setSections(footerData.sections || []);

            // 2. Fetch Social Profiles
            const socialRes = await fetch("/api/social");
            const socialData = await socialRes.json();
            const { newsletterEnabled, ctaText, ...restSocial } = socialData;
            setSocialSettings({ ...defaultSocialSettings, ...restSocial });

            // 3. Fetch SEO Config
            const seoConfig = await getSeoConfig();
            if (seoConfig) {
                setSeoSettings({
                    globalTitle: seoConfig.globalTitle || defaultSeoSettings.globalTitle,
                    globalDescription: seoConfig.globalDescription || defaultSeoSettings.globalDescription,
                    ogImage: seoConfig.ogImage || defaultSeoSettings.ogImage,
                    ogTitle: seoConfig.ogTitle || "",
                    ogDescription: seoConfig.ogDescription || "",
                    twitterCard: seoConfig.twitterCard || defaultSeoSettings.twitterCard,
                    twitterImage: seoConfig.twitterImage || "",
                    faviconUrl: seoConfig.faviconUrl || "",
                });
            }

            // 4. Fetch Header Config
            const headerData = await getHeaderConfig();
            setHeaderConfig(headerData);

        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        setSaving(true);
        try {
            // 1. Save Footer
            await fetch("/api/footer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings, sections }),
            });

            // 2. Save Social
            await fetch("/api/social", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(socialSettings),
            });

            // 3. Save SEO
            await updateSeoConfig(seoSettings);

            // Force immediate favicon update in browser
            if (seoSettings.faviconUrl) {
                const links = document.querySelectorAll("link[rel*='icon']");
                links.forEach(link => {
                    (link as HTMLLinkElement).href = seoSettings.faviconUrl;
                });
                if (links.length === 0) {
                    const link = document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = seoSettings.faviconUrl;
                    document.head.appendChild(link);
                }
            }

            toast.success("All settings saved successfully");
            fetchData();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong saving settings");
        } finally {
            setSaving(false);
        }
    };

    const generateAiSeo = async () => {
        toast.promise(generateAiMetadata("Optimized for Basalt CMS"), {
            loading: "Asking Nano Banana for ideas...",
            success: (data) => {
                setSeoSettings(prev => ({
                    ...prev,
                    globalTitle: data.title,
                    globalDescription: data.description,
                    ogTitle: data.title,
                    ogDescription: data.description
                }));
                return "Generated optimized metadata!";
            },
            error: "Failed to generate ideas"
        });
    };


    // --- Image Upload Helpers ---
    const handleSmartUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'ogImage' | 'twitterImage' | 'faviconUrl', targetWidth: number, targetHeight: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        const loadingToast = toast.loading(`Processing ${fieldName}...`);

        try {
            // 1. Resize Image
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        toast.error("Failed to process image", { id: loadingToast });
                        return;
                    }

                    // Draw and resize (Fill / Cover strategy)
                    // Calculate aspect ratios
                    const imgRatio = img.width / img.height;
                    const targetRatio = targetWidth / targetHeight;

                    let drawWidth = targetWidth;
                    let drawHeight = targetHeight;
                    let offsetX = 0;
                    let offsetY = 0;

                    // "Cover" fit
                    if (imgRatio > targetRatio) {
                        drawHeight = targetHeight;
                        drawWidth = img.width * (targetHeight / img.height);
                        offsetX = (targetWidth - drawWidth) / 2;
                    } else {
                        drawWidth = targetWidth;
                        drawHeight = img.height * (targetWidth / img.width);
                        offsetY = (targetHeight - drawHeight) / 2;
                    }

                    // Background fill (optional, using black to be safe)
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                    // 2. Convert to Blob and Upload
                    const base64 = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.9);

                    // Upload via existing media API
                    fetch("/api/media", {
                        method: "POST",
                        body: JSON.stringify({
                            url: base64,
                            filename: `${fieldName}-${Date.now()}.${file.type === "image/png" ? "png" : "jpg"}`,
                            mimeType: file.type === "image/png" ? "image/png" : "image/jpeg",
                            size: Math.round((base64.length * 3) / 4),
                            title: fieldName === 'ogImage' ? 'OG Image' : (fieldName === 'twitterImage' ? 'Twitter Image' : 'Favicon'),
                            isPublic: true
                        }),
                    })
                        .then(async res => {
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({ error: res.statusText }));
                                throw new Error(err.error || res.statusText);
                            }
                            return res.json();
                        })
                        .then(data => {
                            if (data.url) {
                                setSeoSettings(prev => ({ ...prev, [fieldName]: data.url }));
                                toast.success(`${fieldName} updated!`, { id: loadingToast });
                            } else {
                                throw new Error("No URL returned");
                            }
                        })
                        .catch(err => {
                            console.error("Upload failed", err);
                            toast.error(`Failed to upload ${fieldName}`, { id: loadingToast });
                        });
                };
            };
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Error processing image", { id: loadingToast });
        }
    };

    // Kept for backward compat but simply calls smart upload now (or removed if not needed since we replaced usage)
    const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleSmartUpload(e, 'faviconUrl', 64, 64);

    // --- Footer Helper Functions ---

    const updateSection = (index: number, field: keyof FooterSection, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const updateLink = (sectionIndex: number, linkIndex: number, field: keyof FooterLink, value: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].links[linkIndex] = {
            ...newSections[sectionIndex].links[linkIndex],
            [field]: value,
        };
        setSections(newSections);
    };

    const addLink = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links.push({ text: "New Link", url: "/" });
        setSections(newSections);
    };

    const removeLink = (sectionIndex: number, linkIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links.splice(linkIndex, 1);
        setSections(newSections);
    };

    const addSection = () => {
        setSections([...sections, {
            title: "New Section",
            order: sections.length,
            isBase: false,
            links: []
        }]);
    };

    const confirmRemoveSection = () => {
        if (sectionToDelete === null) return;
        const newSections = [...sections];
        newSections.splice(sectionToDelete, 1);
        setSections(newSections);
        setSectionToDelete(null);
    };

    const handleRestoreDefaults = async () => {
        try {
            setRestoring(true);
            const result = await restoreFooterDefaults();
            if (result.success) {
                toast.success("Restored default sections");
                fetchData();
            } else {
                toast.error("Failed to restore defaults");
            }
        } catch (error) {
            toast.error("Error restoring defaults");
        } finally {
            setRestoring(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Site Layout</h1>
                    <p className="text-slate-400 mt-1 text-lg">Manage your website header, footer, social profiles, and SEO.</p>
                </div>
                {tabParam !== "header" && (
                    <Button
                        onClick={onSave}
                        disabled={saving}
                        variant="gradient"
                        className="text-white"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                )}
            </div>

            <Tabs defaultValue="content" value={tabParam} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-6">
                    <TabsTrigger value="header" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">Header</TabsTrigger>
                    <TabsTrigger value="content" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">Footer Content</TabsTrigger>
                    <TabsTrigger value="profiles" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">Social Profiles</TabsTrigger>
                    <TabsTrigger value="seo" className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">SEO & Metadata</TabsTrigger>
                </TabsList>

                {/* --- TAB: HEADER --- */}
                <TabsContent value="header" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
                    <HeaderEditor initialConfig={headerConfig} />
                </TabsContent>

                {/* --- TAB: FOOTER CONTENT --- */}
                <TabsContent value="content" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
                    <DeleteConfirmationModal
                        isOpen={sectionToDelete !== null}
                        onClose={() => setSectionToDelete(null)}
                        onConfirm={confirmRemoveSection}
                        title="Delete Footer Section"
                        description="Are you sure you want to remove this section? This change will be saved when you click 'Save Changes'."
                    />

                    {/* Global Settings */}
                    <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Global Settings</CardTitle>
                            <CardDescription className="text-slate-400">Default content and footer branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Tagline</Label>
                                    <Input
                                        className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600"
                                        value={settings.tagline || ""}
                                        onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                        placeholder="e.g. Building the future..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Copyright Text</Label>
                                    <Input
                                        className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600"
                                        value={settings.copyrightText || ""}
                                        onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                                        placeholder="e.g. © 2024 Acme Inc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Footer Logo URL</Label>
                                    <Input
                                        className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600 font-mono"
                                        value={settings.footerLogoUrl || ""}
                                        onChange={(e) => setSettings({ ...settings, footerLogoUrl: e.target.value })}
                                        placeholder="/BasaltCMS.png"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator className="bg-white/10" />

                    {/* Sections Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-white">Footer Sections</h2>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={() => setConfirmRestoreOpen(true)}
                                variant="ghost"
                                disabled={restoring}
                                className="text-slate-400 hover:text-white flex-1 sm:flex-none justify-center"
                            >
                                {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="sm:mr-2 h-4 w-4" />}
                                <span className="sr-only sm:not-sr-only">Restore Defaults</span>
                                <span className="sm:hidden ml-2">Reset</span>
                            </Button>
                            <Button
                                onClick={addSection}
                                variant="outline"
                                className="border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 text-slate-300 hover:text-white flex-1 sm:flex-none justify-center"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Section
                            </Button>
                        </div>
                    </div>

                    {/* Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sections.map((section, sIndex) => (
                            <Card key={section.id || sIndex} className="bg-[#0A0A0B] backdrop-blur-sm border-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col h-full">
                                <CardHeader className="p-4 pb-2 space-y-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1">
                                            {section.isBase ? (
                                                <Lock className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <GripVertical className="h-4 w-4 text-slate-600 cursor-grab active:cursor-grabbing" />
                                            )}
                                            <Input
                                                className="h-8 font-semibold text-lg bg-transparent border-transparent hover:border-white/10 focus:border-blue-500 p-0 px-2 h-auto w-full text-white placeholder:text-slate-600 focus-visible:ring-0 rounded-sm"
                                                value={section.title || ""}
                                                onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                                                placeholder="Section Title"
                                            />
                                        </div>
                                        {!section.isBase && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setSectionToDelete(sIndex)}
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
                                    <div className="space-y-3 flex-1">
                                        {section.links.map((link, lIndex) => (
                                            <div key={lIndex} className="flex gap-2 items-start group">
                                                <div className="flex-1 space-y-1.5">
                                                    <Input
                                                        className="h-8 text-sm bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500"
                                                        placeholder="Link Text"
                                                        value={link.text || ""}
                                                        onChange={(e) => updateLink(sIndex, lIndex, "text", e.target.value)}
                                                    />
                                                    <Input
                                                        className="h-7 text-xs bg-black/20 border-white/10 text-slate-400 placeholder:text-slate-700 focus:border-blue-500 font-mono"
                                                        placeholder="/path"
                                                        value={link.url || ""}
                                                        onChange={(e) => updateLink(sIndex, lIndex, "url", e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => removeLink(sIndex, lIndex)}
                                                    className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => addLink(sIndex)}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-400 hover:text-white"
                                    >
                                        <Plus className="mr-2 h-3 w-3" /> Add Link
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* --- TAB: SOCIAL PROFILES --- */}
                <TabsContent value="profiles" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Primary Platforms</CardTitle>
                                <CardDescription className="text-slate-400">Core social media presence.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-5">
                                <SocialInput icon={<FaXTwitter />} label="X (Twitter)" value={socialSettings.xTwitterUrl} onChange={v => setSocialSettings(prev => ({ ...prev, xTwitterUrl: v }))} placeholder="https://x.com/username" />
                                <SocialInput icon={<FaDiscord />} label="Discord" value={socialSettings.discordUrl} onChange={v => setSocialSettings(prev => ({ ...prev, discordUrl: v }))} placeholder="https://discord.gg/invite" />
                                <SocialInput icon={<FaLinkedin />} label="LinkedIn" value={socialSettings.linkedinUrl} onChange={v => setSocialSettings(prev => ({ ...prev, linkedinUrl: v }))} placeholder="https://linkedin.com/company/name" />
                                <SocialInput icon={<FaInstagram />} label="Instagram" value={socialSettings.instagramUrl} onChange={v => setSocialSettings(prev => ({ ...prev, instagramUrl: v }))} placeholder="https://instagram.com/username" />
                                <SocialInput icon={<FaFacebook />} label="Facebook" value={socialSettings.facebookUrl} onChange={v => setSocialSettings(prev => ({ ...prev, facebookUrl: v }))} placeholder="https://facebook.com/username" />
                                <SocialInput icon={<FaYoutube />} label="YouTube" value={socialSettings.youtubeUrl} onChange={v => setSocialSettings(prev => ({ ...prev, youtubeUrl: v }))} placeholder="https://youtube.com/@channel" />
                            </CardContent>
                        </Card>
                        <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Extended Network</CardTitle>
                                <CardDescription className="text-slate-400">Additional communities and content platforms.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-5">
                                <SocialInput icon={<FaGithub />} label="GitHub" value={socialSettings.githubUrl} onChange={v => setSocialSettings(prev => ({ ...prev, githubUrl: v }))} placeholder="https://github.com/org" />
                                <SocialInput icon={<FaTiktok />} label="TikTok" value={socialSettings.tiktokUrl} onChange={v => setSocialSettings(prev => ({ ...prev, tiktokUrl: v }))} placeholder="https://tiktok.com/@user" />
                                <SocialInput icon={<FaTelegram />} label="Telegram" value={socialSettings.telegramUrl} onChange={v => setSocialSettings(prev => ({ ...prev, telegramUrl: v }))} placeholder="https://t.me/channel" />
                                <SocialInput icon={<FaReddit />} label="Reddit" value={socialSettings.redditUrl} onChange={v => setSocialSettings(prev => ({ ...prev, redditUrl: v }))} placeholder="https://reddit.com/r/community" />
                            </CardContent>
                        </Card>

                        {/* Contact & App Stores */}
                        <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Contact & Downloads</CardTitle>
                                <CardDescription className="text-slate-400">Direct contact channels and app links.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SocialInput icon={<FaEnvelope />} label="Support Email" value={socialSettings.emailSupport} onChange={v => setSocialSettings(prev => ({ ...prev, emailSupport: v }))} placeholder="support@domain.com" />
                                <SocialInput icon={<FaEnvelope />} label="Sales Email" value={socialSettings.emailSales} onChange={v => setSocialSettings(prev => ({ ...prev, emailSales: v }))} placeholder="sales@domain.com" />
                                <SocialInput icon={<FaPhone />} label="Phone Number" value={socialSettings.phoneNumber} onChange={v => setSocialSettings(prev => ({ ...prev, phoneNumber: v }))} placeholder="+1 (555) 123-4567" />
                                <div className="pt-2 border-t border-white/10 mt-2 md:col-span-2">
                                    <Label className="text-slate-400 mb-3 block text-xs uppercase tracking-wider font-semibold">Mobile Apps</Label>
                                    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                                        <SocialInput icon={<FaAppStore />} label="App Store URL" value={socialSettings.appStoreUrl} onChange={v => setSocialSettings(prev => ({ ...prev, appStoreUrl: v }))} placeholder="https://apps.apple.com/app/id..." />
                                        <SocialInput icon={<FaGooglePlay />} label="Play Store URL" value={socialSettings.playStoreUrl} onChange={v => setSocialSettings(prev => ({ ...prev, playStoreUrl: v }))} placeholder="https://play.google.com/store/apps/details?id=..." />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- TAB: SEO & METADATA --- */}
                <TabsContent value="seo" className="animate-in fade-in-50 slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Editor Column */}
                        <div className="xl:col-span-5 space-y-6">
                            <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl text-white">Global Metadata</CardTitle>
                                        <CardDescription className="text-slate-400">Settings for Search Engines & Sharing.</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={generateAiSeo} className="border-teal-500/30 text-teal-400 hover:bg-teal-950/50">
                                        <Sparkles className="h-3 w-3 mr-2" />
                                        Auto-Generate
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Site Title</Label>
                                        <Input
                                            value={seoSettings.globalTitle}
                                            onChange={e => setSeoSettings(p => ({ ...p, globalTitle: e.target.value }))}
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Site Description</Label>
                                        <Textarea
                                            value={seoSettings.globalDescription}
                                            onChange={e => setSeoSettings(p => ({ ...p, globalDescription: e.target.value }))}
                                            className="bg-black/50 border-white/10 min-h-[100px]"
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Open Graph Image URL</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex gap-2">
                                                    <Input
                                                        value={seoSettings.ogImage}
                                                        onChange={e => setSeoSettings(p => ({ ...p, ogImage: e.target.value }))}
                                                        className="bg-black/50 border-white/10 flex-1"
                                                    />
                                                    <div className="relative">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            id="og-upload"
                                                            onChange={(e) => handleSmartUpload(e, 'ogImage', 1200, 630)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="h-10 w-10 border-dashed border-white/20 hover:border-indigo-500 hover:text-indigo-400 p-0"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                document.getElementById('og-upload')?.click();
                                                            }}
                                                            title="Upload & Resize to 1200x630"
                                                            type="button"
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    title="Select from Library"
                                                    onClick={() => setMediaPickerOpen(true)}
                                                >
                                                    <ImageIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-slate-500">Recommended: 1200x630px (1.91:1 ratio)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <MediaPickerModal
                                isOpen={mediaPickerOpen}
                                onClose={() => setMediaPickerOpen(false)}
                                onSelect={(url) => setSeoSettings(p => ({ ...p, ogImage: url }))}
                            />

                            <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">Platform Overrides</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label className="text-slate-300 text-base font-medium">Favicon URL (BETA)</Label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <div className="flex-1 flex gap-2">
                                                    <Input
                                                        value={seoSettings.faviconUrl}
                                                        onChange={e => setSeoSettings(p => ({ ...p, faviconUrl: e.target.value }))}
                                                        placeholder="/favicon.ico or https://..."
                                                        className="bg-black/50 border-white/10 flex-1 h-12"
                                                    />
                                                    <div className="relative">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            id="favicon-upload"
                                                            onChange={handleFaviconUpload}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="h-12 w-12 border-dashed border-white/20 hover:border-indigo-500 hover:text-indigo-400 p-0"
                                                            onClick={(e) => {
                                                                e.preventDefault(); // Prevent accidental form submit
                                                                document.getElementById('favicon-upload')?.click();
                                                            }}
                                                            title="Upload & Auto-Resize Image"
                                                            type="button"
                                                        >
                                                            <Upload className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Enlarged Preview Box */}
                                            <div className="flex items-center gap-4 bg-black/30 p-4 rounded-lg border border-white/5">
                                                <div className="h-24 w-24 bg-[#1e1e1e] rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shrink-0 relative group shadow-xl" title="Browser Tab Preview">
                                                    {/* Browser Tab style header */}
                                                    <div className="absolute top-0 w-full h-4 bg-[#2d2d2d]" />

                                                    {seoSettings.faviconUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={seoSettings.faviconUrl}
                                                            alt="Favicon"
                                                            className="h-12 w-12 object-contain mt-2 drop-shadow-lg"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 bg-slate-700/50 rounded-full mt-2" />
                                                    )}

                                                    {/* Fallback for empty or broken image */}
                                                    <span className="hidden absolute inset-0 flex items-center justify-center pt-2 text-2xl text-slate-500 font-bold">
                                                        ?
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-white">Browser Preview</p>
                                                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                                                        This is how your icon will appear in browser tabs. Changes update immediately upon save.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-white/5">
                                        <Label className="text-slate-300">Twitter Card Type</Label>
                                        <select
                                            className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-sm text-white"
                                            value={seoSettings.twitterCard}
                                            onChange={e => setSeoSettings(p => ({ ...p, twitterCard: e.target.value }))}
                                        >
                                            <option value="summary_large_image">Large Image (Recommended)</option>
                                            <option value="summary">Summary (Small Image)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Twitter Specific Image</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex gap-2">
                                                <Input
                                                    value={seoSettings.twitterImage}
                                                    onChange={e => setSeoSettings(p => ({ ...p, twitterImage: e.target.value }))}
                                                    placeholder="Leave empty to use Global OG Image"
                                                    className="bg-black/50 border-white/10 flex-1"
                                                />
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="twitter-upload"
                                                        onChange={(e) => handleSmartUpload(e, 'twitterImage', 1200, 600)}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        className="h-10 w-10 border-dashed border-white/20 hover:border-indigo-500 hover:text-indigo-400 p-0"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            document.getElementById('twitter-upload')?.click();
                                                        }}
                                                        title="Upload & Resize to 1200x600"
                                                        type="button"
                                                    >
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">OG Specific Title (Optional)</Label>
                                        <Input
                                            value={seoSettings.ogTitle}
                                            onChange={e => setSeoSettings(p => ({ ...p, ogTitle: e.target.value }))}
                                            placeholder="Overrides global title..."
                                            className="bg-black/50 border-white/10"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview Column */}
                        <div className="xl:col-span-7 space-y-6">
                            <div className="sticky top-6">
                                <h3 className="text-lg font-medium text-slate-400 mb-4 flex items-center gap-2">
                                    <Laptop className="h-4 w-4" /> Live Preview
                                </h3>

                                {/* Discord / Large Card Preview */}
                                <div className="bg-[#313338] rounded-md p-4 max-w-[480px] mx-auto shadow-2xl border border-slate-700/50 relative group">
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity">Global / Discord</div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 bg-zinc-600 rounded-full"></div>
                                        <div>
                                            <div className="h-3 w-20 bg-zinc-600 rounded mb-1"></div>
                                            <div className="h-2 w-12 bg-zinc-700 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#2B2D31] rounded-[4px] overflow-hidden border border-[#1E1F22]">
                                        {/* Image at top */}
                                        <div className="relative aspect-[1.91/1] w-full overflow-hidden">
                                            {(seoSettings.ogImage || seoSettings.twitterImage) ? (
                                                <img
                                                    src={seoSettings.ogImage || seoSettings.twitterImage}
                                                    alt="OG Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                                                    <ImageIcon className="h-12 w-12 text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        {/* Title and Description below */}
                                        <div className="p-3 border-l-4 border-indigo-500">
                                            <div className="text-[#DBDEE1] font-semibold text-sm truncate hover:underline cursor-pointer">
                                                {seoSettings.ogTitle || seoSettings.globalTitle || "Site Title"}
                                            </div>
                                            <div className="text-[#B5BAC1] text-xs mt-1 line-clamp-2">
                                                {seoSettings.ogDescription || seoSettings.globalDescription || "Site description will appear here..."}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">Discord / Embed Style</p>
                                </div>

                                {/* X / Twitter Preview */}
                                <div className="mt-8 max-w-[480px] mx-auto relative group">
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white border border-white/20 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">X (Twitter)</div>
                                    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-black">
                                        {(seoSettings.twitterImage || seoSettings.ogImage) && (
                                            <div className="relative aspect-[1.91/1] w-full bg-slate-900 border-b border-slate-800">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={seoSettings.twitterImage || seoSettings.ogImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-3">
                                            <div className="text-slate-500 text-sm">basalthq.com</div>
                                            <div className="text-white text-[15px] font-medium leading-5 mt-0.5">
                                                {seoSettings.ogTitle || seoSettings.globalTitle}
                                            </div>
                                            <div className="text-slate-500 text-[15px] leading-5 mt-0.5 line-clamp-2">
                                                {seoSettings.ogDescription || seoSettings.globalDescription}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">X (Twitter) Large Card</p>
                                </div>

                            </div>
                        </div>
                    </div >
                </TabsContent>
            </Tabs>

            <Dialog open={confirmRestoreOpen} onOpenChange={setConfirmRestoreOpen}>
                <DialogContent className="bg-[#0A0A0B] backdrop-blur-xl border border-white/10 text-white shadow-2xl max-w-md rounded-2xl p-6">
                    <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-cyan-400" />
                        Restore Default Sections?
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-2">
                        Are you sure you want to restore the footer sections to their defaults? All custom sections and links will be replaced.
                        <br /><br />
                        <span className="text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded text-xs border border-red-500/20">This action cannot be undone.</span>
                    </DialogDescription>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmRestoreOpen(false)}
                            className="text-slate-300 hover:text-white hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                handleRestoreDefaults();
                                setConfirmRestoreOpen(false);
                            }}
                            className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
                        >
                            {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Restore
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SocialInput({ icon, label, value, onChange, placeholder }: {
    icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2 text-sm">
                <span className="text-slate-400 text-base">{icon}</span> {label}
            </Label>
            <div className="flex gap-2 relative">
                <Input
                    className="flex-1 bg-black/50 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500 pl-3"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
                {value && (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
