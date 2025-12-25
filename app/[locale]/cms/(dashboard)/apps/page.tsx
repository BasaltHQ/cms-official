"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, ShieldCheck, ShoppingCart, Globe, Wrench, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppConnectModal } from "@/components/cms/AppConnectModal";
import { BasePostEditor } from "@/components/cms/apps/BasePostEditor";
import { BasePostHistory } from "@/components/cms/apps/BasePostHistory";
import { AppDisconnectModal } from "@/components/cms/AppDisconnectModal";
import { BroadcastConnectModal } from "@/components/cms/BroadcastConnectModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Radio } from "lucide-react";

interface AppIntegration {
    id: string;
    providerId: string;
    category: "ECOMMERCE" | "PUBLISHING" | "UTILITY";
    name: string;
    icon: string;
    description: string;
    status: "active" | "coming_soon";
    connected: boolean;
    config?: any;
}

export default function AppsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("ecommerce");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Broadcast Settings State
    const [broadcastConnectOpen, setBroadcastConnectOpen] = useState(false);
    const [baseConfig, setBaseConfig] = useState({
        neynarApiKey: "",
        signerUuid: "",
        zoraPrivateKey: ""
    });

    const isBroadcastConnected = !!(baseConfig.neynarApiKey && baseConfig.signerUuid);

    useEffect(() => {
        // Check for tab param
        const tab = searchParams.get("tab");
        if (tab) setActiveTab(tab);
        else setActiveTab("broadcast"); // Default to broadcast

        // Fetch existing keys for placeholder/check
        fetch("/api/social").then(res => res.json()).then(data => {
            setBaseConfig({
                neynarApiKey: data.neynarApiKey || data.baseApiKey || "",
                signerUuid: data.baseSignerUuid || "",
                zoraPrivateKey: data.zoraPrivateKey || ""
            });
        });
    }, [searchParams]);



    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [apps, setApps] = useState<AppIntegration[]>([
        {
            id: "shopify",
            providerId: "shopify",
            category: "ECOMMERCE",
            name: "Shopify",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.png",
            description: "Sync your store products, blogs, and pages effortlessly.",
            status: "active",
            connected: false,
        },
        {
            id: "woocommerce",
            providerId: "woocommerce",
            category: "ECOMMERCE",
            name: "WooCommerce",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/woocommerce-icon.png",
            description: "Connect your WordPress store via REST API.",
            status: "active",
            connected: false,
        },
        {
            id: "bigcommerce",
            providerId: "bigcommerce",
            category: "ECOMMERCE",
            name: "BigCommerce",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/bigcommerce-icon.png",
            description: "Enterprise e-commerce logic and content sync.",
            status: "active",
            connected: false,
        },
        // Publishing
        {
            id: "wordpress",
            providerId: "wordpress",
            category: "PUBLISHING",
            name: "WordPress",
            icon: "https://s.w.org/style/images/about/WordPress-logotype-wmark.png",
            description: "Publish articles to self-hosted WordPress sites.",
            status: "active",
            connected: false,
        },
        {
            id: "medium",
            providerId: "medium",
            category: "PUBLISHING",
            name: "Medium",
            icon: "https://cdn.simpleicons.org/medium/000000",
            description: "Syndicate your best content to Medium's network.",
            status: "active",
            connected: false,
        },
        // Utility
        {
            id: "zapier",
            providerId: "zapier",
            category: "UTILITY",
            name: "Zapier",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/zapier-icon.png",
            description: "Trigger automations when content is published.",
            status: "active",
            connected: false,
        },
    ]);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await fetch("/api/cms/apps/connections");
                if (res.ok) {
                    const data = await res.json();
                    const connectedMap = new Set(data.connections.map((c: any) => c.providerId));

                    setApps(prev => prev.map(app => ({
                        ...app,
                        connected: connectedMap.has(app.providerId)
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch app connections", error);
            }
        };

        fetchConnections();
    }, [refreshTrigger]);

    const handleConfigure = (app: AppIntegration) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    // Disconnect Logic
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [appToDisconnect, setAppToDisconnect] = useState<AppIntegration | null>(null);

    const handleDisconnectRequest = (app: AppIntegration) => {
        setAppToDisconnect(app);
        setIsDisconnectModalOpen(true);
    };

    const tabDetails: Record<string, { title: string; description: string; gradient: string }> = {
        broadcast: {
            title: "Broadcast Command Center",
            description: "Publish updates to Farcaster, Base, and other social networks directly from your CMS.",
            gradient: "from-blue-400 via-blue-300 to-cyan-300"
        },
        ecommerce: {
            title: "E-Commerce Integrations",
            description: "Connect your store to sync products, manage inventory, and process orders centrally.",
            gradient: "from-emerald-400 via-green-300 to-lime-300"
        },
        publishing: {
            title: "Content Publishing",
            description: "Syndicate your content to external platforms like WordPress and Medium.",
            gradient: "from-amber-200 via-orange-300 to-rose-400"
        },
        utility: {
            title: "Utility & Automation",
            description: "Enhance your workflow with automation tools, analytics, and infrastructure connections.",
            gradient: "from-violet-400 via-purple-300 to-fuchsia-300"
        }
    };

    const currentTab = tabDetails[activeTab] || tabDetails.ecommerce;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className={cn(
                        "text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                        currentTab.gradient
                    )}>
                        {currentTab.title}
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        {currentTab.description}
                    </p>
                </div>

                {/* View Toggle */}
                {activeTab !== "broadcast" && (
                    <div className="flex bg-slate-900 border border-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                <div className="bg-current rounded-[1px]" />
                                <div className="bg-current rounded-[1px]" />
                                <div className="bg-current rounded-[1px]" />
                                <div className="bg-current rounded-[1px]" />
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <div className="flex flex-col gap-0.5 w-4 h-4 justify-center">
                                <div className="bg-current h-0.5 w-full rounded-full" />
                                <div className="bg-current h-0.5 w-full rounded-full" />
                                <div className="bg-current h-0.5 w-full rounded-full" />
                            </div>
                        </button>
                    </div>
                )}
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-8">
                    <TabsTrigger
                        value="broadcast"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Radio className="w-3.5 h-3.5 hidden sm:block" />
                        Broadcast
                    </TabsTrigger>
                    <TabsTrigger
                        value="ecommerce"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <ShoppingCart className="w-3.5 h-3.5 hidden sm:block" />
                        E-Commerce
                    </TabsTrigger>
                    <TabsTrigger
                        value="publishing"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Globe className="w-3.5 h-3.5 hidden sm:block" />
                        Publishing
                    </TabsTrigger>
                    <TabsTrigger
                        value="utility"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Wrench className="w-3.5 h-3.5 hidden sm:block" />
                        Utility
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="broadcast" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!isBroadcastConnected ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#0A0A0B]/50 border border-white/5 rounded-2xl text-center">
                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                                    <Radio className="w-10 h-10 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Connect Broadcast Hub</h3>
                                <p className="text-slate-400 max-w-md mb-8">
                                    Connect your Farcaster, Base, and Zora accounts to start broadcasting updates directly from your CMS.
                                </p>
                                <Button
                                    onClick={() => setBroadcastConnectOpen(true)}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 text-base shadow-lg shadow-blue-500/20"
                                >
                                    <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                                    Connect Services
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end mb-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setBroadcastConnectOpen(true)}
                                        className="border-white/10 hover:bg-white/5 text-xs h-8"
                                    >
                                        <Wrench className="w-3 h-3 mr-2" />
                                        Manage Keys
                                    </Button>
                                </div>

                                <BasePostEditor onPostSuccess={() => setRefreshTrigger(prev => prev + 1)} />

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 mb-6">
                                        Broadcast History
                                    </h3>
                                    <BasePostHistory refreshTrigger={refreshTrigger} />
                                </div>
                            </>
                        )}
                    </TabsContent>
                    {["ecommerce", "publishing", "utility"].map((tab) => (
                        <TabsContent key={tab} value={tab} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className={cn(
                                "grid gap-6",
                                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                            )}>
                                {apps.filter(app => app.category.toLowerCase() === tab).map((app) => (
                                    <AppCard
                                        key={app.id}
                                        app={app}
                                        viewMode={viewMode}
                                        onConfigure={() => handleConfigure(app)}
                                        onDisconnect={() => handleDisconnectRequest(app)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>

            <BroadcastConnectModal
                isOpen={broadcastConnectOpen}
                onClose={() => setBroadcastConnectOpen(false)}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                initialConfig={baseConfig}
            />

            <div className="bg-slate-900/30 p-4 border border-white/5 rounded-lg text-center mt-12">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    All connections are encrypted with 256-bit AES protection.
                </p>
            </div>

            {
                selectedApp && isModalOpen && (
                    <AppConnectModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        app={selectedApp}
                        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    />
                )
            }
            {
                appToDisconnect && isDisconnectModalOpen && (
                    <AppDisconnectModal
                        isOpen={isDisconnectModalOpen}
                        onClose={() => setIsDisconnectModalOpen(false)}
                        app={appToDisconnect}
                        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    />
                )
            }
        </div >
    );
}

function AppCard({ app, viewMode, onConfigure, onDisconnect }: { app: AppIntegration, viewMode: "grid" | "list", onConfigure: () => void, onDisconnect: () => void }) {
    return (
        <div className={cn(
            "relative group bg-[#0A0A0B]/80 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 flex",
            viewMode === "grid" ? "flex-col h-full" : "flex-row items-center gap-6",
            app.connected
                ? "border-emerald-500/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.4)]"
                : "border-white/10 hover:border-emerald-500/30 hover:shadow-emerald-500/10",
            app.status === "coming_soon" && "opacity-60 grayscale-[0.5]"
        )}>
            {/* Header / Icon */}
            <div className={cn("flex justify-between items-start", viewMode === "grid" ? "mb-4 w-full" : "mb-0 shrink-0")}>
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 group-hover:border-white/20 transition-colors bg-white p-2">
                    <NextImage
                        src={app.icon}
                        alt={app.name}
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
                {viewMode === "grid" && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors",
                        app.connected
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_-2px_rgba(16,185,129,0.4)]"
                            : app.status === "coming_soon"
                                ? "bg-slate-800 text-slate-500 border border-white/5"
                                : "bg-slate-800 text-slate-400 border border-white/5"
                    )}>
                        {app.connected ? (
                            <><CheckCircle className="h-3 w-3" /> Connected</>
                        ) : app.status === "coming_soon" ? (
                            "Coming Soon"
                        ) : (
                            "Not Connected"
                        )}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className={cn("flex-grow", viewMode === "list" && "flex items-center justify-between w-full gap-8")}>
                <div className={cn(viewMode === "list" ? "flex-1" : "")}>
                    <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                        {app.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">
                        {app.description}
                    </p>
                </div>

                {/* Action Button */}
                <div className={cn(viewMode === "list" ? "shrink-0 w-48" : "w-full mt-auto")}>
                    <div className="flex gap-2 w-full">
                        {app.connected ? (
                            <Button
                                onClick={onDisconnect}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 shadow-none transition-all"
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                onClick={onConfigure}
                                disabled={app.status === "coming_soon"}
                                variant={(!app.connected && app.status !== "coming_soon") ? "gradient" : "default"}
                                className={cn(
                                    "w-full rounded-lg font-semibold transition-all",
                                    app.connected
                                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
                                        : app.status === "coming_soon"
                                            ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5"
                                            : ""
                                )}
                            >
                                {app.status === "coming_soon" ? "Coming Soon" : "Connect"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
