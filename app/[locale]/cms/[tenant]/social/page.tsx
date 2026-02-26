"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink, Sparkles, Image as ImageIcon, Laptop, Smartphone } from "lucide-react";
import {
    FaXTwitter, FaDiscord, FaLinkedin, FaInstagram, FaFacebook,
    FaYoutube, FaTiktok, FaGithub, FaTelegram, FaReddit, FaThreads, FaMastodon,
    FaAppStore, FaGooglePlay, FaEnvelope, FaPhone
} from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSeoConfig, updateSeoConfig, generateAiMetadata } from "@/actions/cms/seo-actions";
import { MediaPickerModal } from "@/components/cms/MediaPickerModal";

// --- Types ---
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

export default function SocialAdminPage() {
    const [socialSettings, setSocialSettings] = useState<SocialSettings>(defaultSocialSettings);
    const [seoSettings, setSeoSettings] = useState<SeoSettings>(defaultSeoSettings);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [footerSettings, setFooterSettings] = useState({ footerLogoUrl: "" });
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    const tabParam = searchParams.get("tab") || "profiles";

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
            // Fetch Social Profiles
            const socialRes = await fetch("/api/social");
            const socialData = await socialRes.json();
            const { newsletterEnabled, ctaText, ...restSocial } = socialData;
            setSocialSettings({ ...defaultSocialSettings, ...restSocial });

            // Fetch SEO Config
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

            // Fetch Footer Settings
            const footerRes = await fetch("/api/footer");
            const footerData = await footerRes.json();
            if (footerData.settings) {
                setFooterSettings({ footerLogoUrl: footerData.settings.footerLogoUrl || "" });
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
            await fetch("/api/social", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(socialSettings),
            });

            await updateSeoConfig(seoSettings);

            await fetch("/api/footer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settings: { footerLogoUrl: footerSettings.footerLogoUrl }
                }),
            });

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

            router.refresh();
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save settings");
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Social Command Center</h1>
                    <p className="text-slate-400 mt-1 text-base md:text-lg">Manage your digital footprint, SEO, and social presence.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} variant="gradient" className="text-white bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="profiles" value={tabParam || "profiles"} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-6">
                    <TabsTrigger value="profiles" className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">Social Profiles</TabsTrigger>
                    <TabsTrigger value="seo" className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm">SEO & Sharing Cards</TabsTrigger>
                </TabsList>

                {/* --- TAB: PROFILES --- */}
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

                {/* --- TAB: SEO & CARDS --- */}
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
                                                <Input
                                                    value={seoSettings.ogImage}
                                                    onChange={e => setSeoSettings(p => ({ ...p, ogImage: e.target.value }))}
                                                    className="bg-black/50 border-white/10"
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    title="Select Image from Library or Upload"
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
                                    <div className="space-y-3">
                                        <Label className="text-slate-300 text-base font-medium">Footer Branding</Label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <Input
                                                    value={footerSettings.footerLogoUrl}
                                                    onChange={e => setFooterSettings(p => ({ ...p, footerLogoUrl: e.target.value }))}
                                                    placeholder="/BasaltCMS.png"
                                                    className="bg-black/50 border-white/10 flex-1 h-12"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                This logo is used in the footer across the site. Leaving it empty may fallback to the default.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <Label className="text-slate-300 text-base font-medium">Favicon URL (BETA)</Label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <Input
                                                    value={seoSettings.faviconUrl}
                                                    onChange={e => setSeoSettings(p => ({ ...p, faviconUrl: e.target.value }))}
                                                    placeholder="/favicon.ico or https://..."
                                                    className="bg-black/50 border-white/10 flex-1 h-12"
                                                />
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
                                        <Input
                                            value={seoSettings.twitterImage}
                                            onChange={e => setSeoSettings(p => ({ ...p, twitterImage: e.target.value }))}
                                            placeholder="Leave empty to use Global OG Image"
                                            className="bg-black/50 border-white/10"
                                        />
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
                                        <div className="grid grid-cols-[auto_1fr] bg-[#2B2D31] items-center p-3 gap-3 border-l-[4px] border-[#2B2D31]">
                                            <div className="col-span-2">
                                                <div className="font-semibold text-[#DBDEE1] text-sm hover:underline cursor-pointer truncate">
                                                    {seoSettings.ogTitle || seoSettings.globalTitle}
                                                </div>
                                                <div className="text-[#B5BAC1] text-xs mt-1 line-clamp-2">
                                                    {seoSettings.ogDescription || seoSettings.globalDescription}
                                                </div>
                                            </div>
                                        </div>
                                        {seoSettings.ogImage && (
                                            <div className="relative aspect-[1.91/1] w-full bg-black">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={seoSettings.ogImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
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
                </TabsContent >
            </Tabs >
        </div >
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
