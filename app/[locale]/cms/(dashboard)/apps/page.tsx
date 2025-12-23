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

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [apps, setApps] = useState<AppIntegration[]>([
        // E-Commerce
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
            status: "coming_soon",
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
            status: "coming_soon",
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
            status: "coming_soon",
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

    const handleDisconnect = async (app: AppIntegration) => {
        if (!confirm(`Are you sure you want to disconnect ${app.name}? Syncing will stop.`)) return;

        try {
            const res = await fetch(`/api/cms/apps/connections?providerId=${app.providerId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success(`Disconnected ${app.name}`);
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error("Failed to disconnect");
            }
        } catch (error) {
            toast.error("Error disconnecting app");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        App Store
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Connect your favorite tools to the CMS. Manage content in one place, publish everywhere.
                    </p>
                </div>

                {/* View Toggle */}
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
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                    <TabsTrigger
                        value="ecommerce"
                        className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 border border-transparent rounded-lg transition-all"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        E-Commerce
                    </TabsTrigger>
                    <TabsTrigger
                        value="publishing"
                        className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/20 border border-transparent rounded-lg transition-all"
                    >
                        <Globe className="w-4 h-4 mr-2" />
                        Publishing
                    </TabsTrigger>
                    <TabsTrigger
                        value="utility"
                        className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/20 border border-transparent rounded-lg transition-all"
                    >
                        <Wrench className="w-4 h-4 mr-2" />
                        Utility
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
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
                                        onDisconnect={() => handleDisconnect(app)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>

            <div className="bg-slate-900/30 p-4 border border-white/5 rounded-lg text-center mt-12">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    All connections are encrypted with 256-bit AES protection.
                </p>
            </div>

            {selectedApp && isModalOpen && (
                <AppConnectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    app={selectedApp}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
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
