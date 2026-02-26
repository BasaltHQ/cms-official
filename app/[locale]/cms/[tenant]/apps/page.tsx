"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Rocket, Shield, Brain, Sparkles, Filter, SlidersHorizontal, Grid, Radio, Share2 } from "lucide-react";
import { AppMarketplaceItem, AppItem } from "@/components/cms/apps/AppMarketplaceItem";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { UniversalPostEditor } from "@/components/cms/social/UniversalPostEditor";
import { ScheduledPostsDashboard } from "@/components/cms/social/ScheduledPostsDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";
// @ts-ignore
import Autoplay from "embla-carousel-autoplay";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { AppDisconnectModal } from "@/components/cms/apps/AppDisconnectModal";

// Mock Data
const MOCK_APPS: AppItem[] = [
    {
        id: "surge",
        name: "Surge",
        description: "The preferred payment solution for your CMS. Accept crypto and fiat with instant reconciliation.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ethereum-eth-icon.png", // Using ETH icon as placeholder for Surge
        author: "BasaltHQ",
        rating: 5.0,
        installs: "10k+ Merchants", // Custom Label Logic needed or just string
        status: "active",
        connected: false,
        category: "Commerce",
        updatedAt: "Just now"
    },
    {
        id: "shopify",
        name: "Shopify",
        description: "Seamlessly sync products requiring e-commerce functionality directly from your Shopify store.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.png",
        author: "Shopify Inc.",
        rating: 4.8,
        installs: "2M+",
        status: "active",
        connected: false,
        category: "Commerce",
        updatedAt: "2 days ago"
    },
    {
        id: "woocommerce",
        name: "WooCommerce",
        description: "The most popular e-commerce platform for WordPress. Sync products and orders.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/woocommerce-icon.png",
        author: "Automattic",
        rating: 4.5,
        installs: "5M+",
        status: "active",
        connected: false,
        category: "Commerce",
        updatedAt: "1 week ago"
    },
    {
        id: "wordpress",
        name: "WordPress Publisher",
        description: "Publish your CMS content directly to any WordPress site via XML-RPC or REST API.",
        icon: "https://s.w.org/style/images/about/WordPress-logotype-wmark.png",
        author: "CMS Core",
        rating: 4.9,
        installs: "10k+",
        status: "active",
        connected: true,
        category: "Marketing",
        updatedAt: "Yesterday"
    },
    {
        id: "yoast",
        name: "Yoast SEO",
        description: "Improve your site's SEO with advanced analysis and tools.",
        icon: "https://avatars.githubusercontent.com/u/4690436?v=4",
        author: "Team Yoast",
        rating: 4.7,
        installs: "1M+",
        status: "coming_soon",
        connected: false,
        category: "Marketing",
        updatedAt: "Coming Soon"
    },
    {
        id: "hubspot",
        name: "HubSpot CRM",
        description: "Sync contacts and forms directly to your HubSpot CRM.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/hubspot-icon.png",
        author: "HubSpot",
        rating: 4.6,
        installs: "800k+",
        status: "active",
        connected: false,
        category: "Marketing",
        updatedAt: "1 day ago"
    },
    {
        id: "slack",
        name: "Slack Notifications",
        description: "Get notified in Slack when new content is published or forms are submitted.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/slack-icon.png",
        author: "Slack",
        rating: 4.9,
        installs: "2M+",
        status: "active",
        connected: false,
        category: "Utility",
        updatedAt: "Just now"
    },
    {
        id: "google-analytics",
        name: "Google Analytics 4",
        description: "Deep integration with GA4 for content performance metrics.",
        icon: "https://cdn.simpleicons.org/googleanalytics/E37400",
        author: "Google",
        rating: 4.5,
        installs: "10M+",
        status: "active",
        connected: false,
        category: "AI & Data",
        updatedAt: "1 week ago"
    },
    {
        id: "algolia",
        name: "Algolia Search",
        description: "Superfast, relevant search for your CMS content.",
        icon: "https://cdn.simpleicons.org/algolia/003DFF",
        author: "Algolia",
        rating: 4.8,
        installs: "50k+",
        status: "coming_soon",
        connected: false,
        category: "Utility",
        updatedAt: "Coming Soon"
    },
    {
        id: "intercom",
        name: "Intercom Messenger",
        description: "Add the Intercom messenger to your site with one click.",
        icon: "https://cdn.simpleicons.org/intercom/000000",
        author: "Intercom",
        rating: 4.7,
        installs: "300k+",
        status: "active",
        connected: false,
        category: "Marketing",
        updatedAt: "3 days ago"
    },
    {
        id: "zapier",
        name: "Zapier Automation",
        description: "Connect your CMS to 5,000+ apps. Automate workflows when content is published.",
        icon: "https://cdn.simpleicons.org/zapier/FF4F00",
        author: "Zapier",
        rating: 4.8,
        installs: "500k+",
        status: "active",
        connected: false,
        category: "Utility",
        updatedAt: "3 days ago"
    },
    {
        id: "mailchimp",
        name: "Mailchimp",
        description: "Send newsletters and manage subscribers directly from your dashboard.",
        icon: "https://cdn.simpleicons.org/mailchimp/FFE01B",
        author: "Intuit",
        rating: 4.4,
        installs: "800k+",
        status: "coming_soon",
        connected: false,
        category: "Marketing",
        updatedAt: "Coming Soon"
    },
    {
        id: "stripe",
        name: "Stripe Payments",
        description: "Accept payments securely with the global standard for online payments.",
        icon: "https://cdn.simpleicons.org/stripe/635BFF",
        author: "Stripe",
        rating: 4.9,
        installs: "3M+",
        status: "active",
        connected: false,
        category: "Commerce",
        updatedAt: "1 day ago"
    },
    {
        id: "openai",
        name: "Nano Banana AI",
        description: "Draft content, generate images, and optimize SEO with our proprietary AI model.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/chatgpt-icon.png",
        author: "Basalt AI",
        rating: 5.0,
        installs: "Internal",
        status: "active",
        connected: true,
        category: "AI & Data",
        updatedAt: "Hourly"
    },
    {
        id: "x_social",
        name: "X (Twitter)",
        description: "Auto-post updates and analyze social sentiment.",
        icon: "https://cdn.simpleicons.org/x/white",
        author: "X Corp",
        rating: 4.2,
        installs: "10M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Daily"
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        description: "Professional network publishing and analytics.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg",
        author: "Microsoft",
        rating: 4.6,
        installs: "5M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Weekly"
    },
    {
        id: "meta_suite",
        name: "Meta Suite",
        description: "Instagram and Facebook cross-posting and management.",
        icon: "https://cdn.simpleicons.org/meta/0081FB",
        author: "Meta",
        rating: 4.3,
        installs: "15M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Daily"
    },
    {
        id: "youtube",
        name: "YouTube",
        description: "Video hosting, streaming, and community engagement.",
        icon: "https://cdn.simpleicons.org/youtube/white",
        author: "Google",
        rating: 4.8,
        installs: "2B+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Daily"
    },
    {
        id: "reddit",
        name: "Reddit",
        description: "Dive into anything. Community discussions and threads.",
        icon: "https://cdn.simpleicons.org/reddit/FF4500",
        author: "Reddit Inc.",
        rating: 4.5,
        installs: "500M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Hourly"
    },
    {
        id: "discord",
        name: "Discord",
        description: "Chat, voice, and video for communities and friends.",
        icon: "https://cdn.simpleicons.org/discord/5865F2",
        author: "Discord Inc.",
        rating: 4.7,
        installs: "300M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Now"
    },
    {
        id: "tiktok",
        name: "TikTok",
        description: "Short-form mobile video. Trends start here.",
        icon: "https://cdn.simpleicons.org/tiktok/white",
        author: "ByteDance",
        rating: 4.9,
        installs: "1B+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Daily"
    },
    {
        id: "pinterest",
        name: "Pinterest",
        description: "Visual discovery engine for finding ideas like recipes and style.",
        icon: "https://cdn.simpleicons.org/pinterest/E60023",
        author: "Pinterest",
        rating: 4.6,
        installs: "400M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Weekly"
    },
    {
        id: "twitch",
        name: "Twitch",
        description: "Live streaming platform for gamers and creators.",
        icon: "https://cdn.simpleicons.org/twitch/9146FF",
        author: "Amazon",
        rating: 4.4,
        installs: "100M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Live"
    },
    {
        id: "telegram",
        name: "Telegram",
        description: "Pure instant messaging — simple, fast, secure, and synced.",
        icon: "https://cdn.simpleicons.org/telegram/26A5E4",
        author: "Telegram FZ-LLC",
        rating: 4.7,
        installs: "700M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Now"
    },
    {
        id: "snapchat",
        name: "Snapchat",
        description: "Share the moment with friends and family.",
        icon: "https://cdn.simpleicons.org/snapchat/FFFC00",
        author: "Snap Inc.",
        rating: 4.5,
        installs: "500M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Daily"
    },
    {
        id: "threads",
        name: "Threads",
        description: "Say more with Threads — Instagram’s text-based conversation app.",
        icon: "https://cdn.simpleicons.org/threads/white",
        author: "Meta",
        rating: 4.1,
        installs: "100M+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Hourly"
    },
    {
        id: "whatsapp_business",
        name: "WhatsApp",
        description: "Connect with your customers on their favorite messaging app.",
        icon: "https://cdn.simpleicons.org/whatsapp/25D366",
        author: "Meta",
        rating: 4.8,
        installs: "2B+",
        status: "active",
        connected: false,
        category: "Social",
        updatedAt: "Now"
    },
    {
        id: "farcaster",
        name: "Farcaster",
        description: "Sufficiently decentralized social network. Sync your casts.",
        icon: "https://github.com/farcasterxyz.png",
        author: "Merkle Manufactory",
        rating: 4.9,
        installs: "150k+",
        status: "active",
        connected: true,
        category: "Web3",
        updatedAt: "Hourly"
    },
    {
        id: "zora",
        name: "Zora",
        description: "Mint and collect on the Zora network. Universal media registry.",
        icon: "https://avatars.githubusercontent.com/u/60056322?s=200&v=4",
        author: "Zora",
        rating: 4.8,
        installs: "50k+",
        status: "active",
        connected: false,
        category: "Web3",
        updatedAt: "Daily"
    },
    {
        id: "base_app",
        name: "Base App",
        description: "On-chain capabilities powered by Base, secured by Ethereum.",
        icon: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
        author: "Coinbase",
        rating: 5.0,
        installs: "1M+",
        status: "active",
        connected: true,
        category: "Web3",
        updatedAt: "Now"
    },
    {
        id: "wordfence",
        name: "Wordfence Security",
        description: "Firewall and malware scanner specially built for your CMS.",
        icon: "https://ps.w.org/wordfence/assets/icon-256x256.png",
        author: "Defiant",
        rating: 4.8,
        installs: "4M+",
        status: "active",
        connected: false,
        category: "Security",
        updatedAt: "2 days ago"
    },
    {
        id: "cloudflare",
        name: "Cloudflare",
        description: "Global CDN, DDoS protection, and security suite.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg",
        author: "Cloudflare",
        rating: 4.9,
        installs: "10M+",
        status: "active",
        connected: false,
        category: "Security",
        updatedAt: "Active"
    }
];

const CATEGORIES = [
    { id: "all", label: "All Apps", icon: Sparkles },
    { id: "Marketing", label: "Marketing", icon: Rocket },
    { id: "Commerce", label: "Commerce", icon: ShoppingCart },
    { id: "AI & Data", label: "AI & Data", icon: Brain },
    { id: "Social", label: "Social", icon: Share2 },
    { id: "Web3", label: "Base/Farcaster", icon: Grid },
    { id: "Utility", label: "Utility", icon: SlidersHorizontal },
    { id: "Security", label: "Security", icon: Shield },
];

export default function AppsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Use tab param to control view: "store" | "broadcast"
    const currentTab = searchParams.get("tab") === "broadcast" ? "broadcast" : "store";
    // Use view param to control broadcast sub-view: "compose" | "scheduled"
    const broadcastView = searchParams.get("view") === "scheduled" ? "scheduled" : "compose";

    // Initialize state with MOCK_APPS to allow local mutations (disconnecting)
    const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Modal States
    const [selectedApp, setSelectedApp] = useState<AppItem | null>(null); // For Config
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const [disconnectApp, setDisconnectApp] = useState<AppItem | null>(null); // For Disconnect
    const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

    // Filter Logic
    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "store") {
            params.delete("tab");
            params.delete("view"); // Clean up view param when switching to store
        } else {
            params.set("tab", val);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleViewChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", "broadcast"); // Ensure we are in broadcast tab
        params.set("view", val);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleConfigure = (id: string) => {
        const app = apps.find(a => a.id === id);
        if (app) {
            setSelectedApp(app);
            setIsConfigOpen(true);
        }
    };

    const handleDisconnectRequest = (id: string) => {
        const app = apps.find(a => a.id === id);
        if (app) {
            setDisconnectApp(app);
            setIsDisconnectOpen(true);
        }
    };

    const confirmDisconnect = () => {
        if (disconnectApp) {
            setApps(prev => prev.map(a => a.id === disconnectApp.id ? { ...a, connected: false } : a));
            setIsDisconnectOpen(false);
            setDisconnectApp(null);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <AppConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                app={selectedApp}
            />

            <AppDisconnectModal
                isOpen={isDisconnectOpen}
                onClose={() => setIsDisconnectOpen(false)}
                onConfirm={confirmDisconnect}
                app={disconnectApp}
            />

            {/* VIEW TOGGLE */}
            <div className="flex justify-center mb-8">
                <div className="bg-[#0A0A0B] p-1 rounded-xl border border-white/10 inline-flex shadow-lg backdrop-blur-md">
                    <button
                        onClick={() => handleTabChange("store")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                            currentTab === "store"
                                ? "bg-[#1C1C1E] text-white shadow-xl translate-y-[-1px] border border-white/5"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Grid className="w-4 h-4" />
                        App Marketplace
                    </button>
                    <button
                        onClick={() => handleTabChange("broadcast")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                            currentTab === "broadcast"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl translate-y-[-1px]"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Radio className="w-4 h-4" />
                        Broadcast Studio
                    </button>
                </div>
            </div>

            {currentTab === "store" ? (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                    {/* HERO CAROUSEL */}
                    <HeroCarousel />

                    {/* SEARCH & FILTER BAR */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20 bg-[#000]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl transition-all duration-300">
                        <div className="relative w-full md:w-64 group transition-all duration-300 ease-in-out">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 group-hover:text-slate-400 transition-colors" />
                            <Input
                                placeholder="Search apps..."
                                className="pl-10 bg-[#1A1B1E] border-white/10 h-10 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-transparent group-hover:placeholder:text-slate-500 focus:placeholder:text-slate-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                                            selectedCategory === cat.id
                                                ? "bg-white text-black shadow-lg scale-105"
                                                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* APPS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredApps.length > 0 ? (
                            filteredApps.map(app => (
                                <AppMarketplaceItem
                                    key={app.id}
                                    app={app}
                                    onConfigure={() => handleConfigure(app.id)}
                                    onDisconnect={() => handleDisconnectRequest(app.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-500">
                                <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                                    <Search className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-lg">No apps found matching "{searchQuery}"</p>
                                <Button variant="link" onClick={() => { setSearchQuery(""); setSelectedCategory("all") }} className="text-blue-400">
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
                    <div className="flex flex-col items-center mb-8 space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                                <Radio className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Universal Broadcast Studio</h2>
                            <p className="text-slate-400 max-w-lg mx-auto">
                                Create, schedule, and publish content across all your social/web3 channels from one powerful interface.
                            </p>
                        </div>

                        {/* SUB-NAV for Broadcast Studio */}
                        <div className="bg-[#0A0A0B] p-1 rounded-lg border border-white/10 inline-flex">
                            <button
                                onClick={() => handleViewChange("compose")}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    broadcastView === "compose"
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                Compose
                            </button>
                            <button
                                onClick={() => handleViewChange("scheduled")}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                    broadcastView === "scheduled"
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                Scheduled Posts
                            </button>
                        </div>
                    </div>

                    {broadcastView === "compose" ? (
                        <UniversalPostEditor onPostSuccess={() => handleViewChange("scheduled")} />
                    ) : (
                        <ScheduledPostsDashboard />
                    )}
                </div>
            )}
        </div>
    );
}

function HeroCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    const slides = [
        {
            id: 1,
            badge: "PREFERRED PAYMENT",
            title: (
                <>
                    Accept payments with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Surge</span>
                </>
            ),
            desc: "The official payment partner of Basalt CMS. Crypto, Fiat, and Instant Reconciliation for modern merchants.",
            bg: "bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900",
            button: "Connect Wallet",
            glow: "bg-emerald-500/30"
        },
        {
            id: 2,
            badge: "FEATURED AI",
            title: (
                <>
                    Supercharge with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Nano Banana</span>
                </>
            ),
            desc: "Generate blog posts, optimize SEO, and create stunning visuals automatically. The most powerful AI assistant, now native.",
            bg: "bg-gradient-to-r from-blue-900 via-indigo-900 to-violet-900",
            button: "Install Plugin",
            glow: "bg-blue-500/30"
        },
        {
            id: 3,
            badge: "ANALYTICS",
            title: (
                <>
                    Deep Insights with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Google Analytics 4</span>
                </>
            ),
            desc: "Understand your audience like never before. Real-time tracking, conversion events, and user journey mapping.",
            bg: "bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900",
            button: "Connect Account",
            glow: "bg-orange-500/30"
        },
        {
            id: 4,
            badge: "WEB3 NATIVE",
            title: (
                <>
                    Build on-chain with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Base</span>
                </>
            ),
            desc: "Secure, low-cost, builder-friendly Ethereum L2. The perfect home for your on-chain content.",
            bg: "bg-gradient-to-r from-blue-900 via-cyan-900 to-slate-900",
            button: "Start Building",
            glow: "bg-blue-500/30"
        }
    ];

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative group" ref={emblaRef}>
            <div className="flex">
                {slides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative min-h-[300px] flex items-center">
                        <div className={cn("absolute inset-0", slide.bg)}>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                        </div>

                        <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-bold mb-4 backdrop-blur-md">
                                <Sparkles className="w-3 h-3" /> {slide.badge}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
                                {slide.desc}
                            </p>
                            <div className="flex gap-4">
                                <Button className="bg-white text-black hover:bg-slate-200 font-bold px-8 h-12 rounded-full shadow-lg transition-transform hover:scale-105">
                                    {slide.button}
                                </Button>
                                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 h-12 rounded-full px-8 backdrop-blur-sm">
                                    Learn More
                                </Button>
                            </div>
                        </div>

                        {/* Decorative Element */}
                        <div className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl -mr-20 opacity-50", slide.glow)}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
