"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Loader2, CheckCircle, ShieldCheck, Brain, Share2, Key, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, getProviders } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeyModal } from "@/components/cms/ApiKeyModal";
import { SocialConnectModal } from "@/components/cms/SocialConnectModal";
import { UnifiedAiConfig } from "@/components/cms/UnifiedAiConfig";
import { Lock } from "lucide-react";

interface Integration {
    id: string;
    name: string;
    icon: string;
    description: string;
    type: "ai" | "social";
    status: "active" | "coming_soon";
    apiKeyLink?: string; // For AI providers
    connected: boolean;
    maskedKey?: string; // For BYOK
    configuration?: any; // For complex providers
    isBeta?: boolean;
}

export default function IntegrationsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("ai");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Integration | null>(null);
    const [availableProviders, setAvailableProviders] = useState<Record<string, any>>({});

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [integrations, setIntegrations] = useState<Integration[]>([
        // AI Models (BYOK)
        {
            id: "google",
            name: "Google Nano Banana",
            // Legacy generic Google G
            icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
            description: "Nano Banana image generation & advanced reasoning (Legacy).",
            type: "ai",
            status: "active",
            apiKeyLink: "https://makersuite.google.com/app/apikey",
            connected: false,
        },
        {
            id: "google_standard",
            name: "Google Gemini",
            // Official Google Gemini Sparkle Icon
            icon: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
            description: "Advanced multi-modal reasoning.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://aistudio.google.com/app/apikey",
            connected: false,
        },
        {
            id: "openai",
            name: "OpenAI",
            icon: "https://avatars.githubusercontent.com/u/14957082?s=200&v=4",
            description: "GPT-5, o1, and DALL-E 3 models.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://platform.openai.com/api-keys",
            connected: false,
        },
        {
            id: "azure",
            name: "Azure OpenAI",
            icon: "https://avatars.githubusercontent.com/u/6844498?s=200&v=4",
            description: "Enterprise-grade GPT models via Azure.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://portal.azure.com",
            connected: false,
        },
        {
            id: "aws",
            name: "AWS Bedrock",
            icon: "https://avatars.githubusercontent.com/u/2232217?s=200&v=4",
            description: "Access Claude, Nova, and more via Bedrock.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://aws.amazon.com/bedrock/",
            connected: false,
        },
        {
            id: "anthropic",
            name: "Anthropic",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/claude-ai-icon.png",
            description: "Claude 3.5 Sonnet & Opus for reasoning.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://console.anthropic.com/settings/keys",
            connected: false,
        },
        {
            id: "grok",
            name: "Grok (xAI)",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/x-social-media-white-icon.png",
            description: "Grok-4 models with real-time knowledge.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://console.x.ai/",
            connected: false,
        },
        {
            id: "deepseek",
            name: "DeepSeek",
            icon: "https://avatars.githubusercontent.com/u/148330874?s=200&v=4",
            description: "Code and chat models efficient & powerful.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://platform.deepseek.com",
            connected: false,
        },
        {
            id: "mistral",
            name: "Mistral AI",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/mistral-ai-icon.png",
            description: "Open-weight models optimized for efficiency.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://console.mistral.ai/api-keys/",
            connected: false,
        },
        {
            id: "perplexity",
            name: "Perplexity",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png",
            description: "Real-time web search and citation-backed answers.",
            type: "ai",
            status: "active",
            apiKeyLink: "https://www.perplexity.ai/settings/api",
            connected: false,
        },

        // Social Integrations (OAuth)
        {
            id: "google_social",
            name: "Google",
            icon: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
            description: "Connect your Google account for Drive, Gmail, and Calendar access.",
            type: "social",
            status: "active",
            connected: false,
        },
        {
            id: "twitter",
            name: "X (Twitter)",
            // Official White X Logo (Verified Stable PNG from UXWing)
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/x-social-media-white-icon.png",
            description: "Auto-post updates and analyze social sentiment.",
            type: "social",
            status: "active",
            connected: false,
        },
        {
            id: "linkedin",
            name: "LinkedIn",
            icon: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg",
            description: "Professional network publishing and analytics.",
            type: "social",
            status: "active",
            connected: false,
        },
        {
            id: "microsoft",
            name: "Microsoft",
            icon: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
            description: "Outlook and Teams enterprise integration.",
            type: "social",
            status: "active",
            connected: false,
        },
        {
            id: "meta",
            name: "Meta",
            icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/meta-icon.png",
            description: "Instagram and Facebook cross-posting.",
            type: "social",
            status: "active",
            connected: false,
        },
        {
            id: "slack",
            name: "Slack",
            icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
            description: "Team notifications and bot integrations.",
            type: "social",
            status: "active",
            connected: false,
        }
    ]);


    useEffect(() => {
        const tabParam = searchParams.get("tab");
        console.log("OAuth Page Params:", { tab: tabParam, error: searchParams.get("error") });
        if (tabParam && ["ai", "social", "system"].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        const fetchStatus = async () => {
            try {
                // Fetch Available NextAuth Providers
                const providers = await getProviders();
                setAvailableProviders(providers || {});

                // Fetch Legacy Keys
                const legacyResponse = await fetch('/api/cms/api-keys');
                let legacyData = {};
                if (legacyResponse.ok) {
                    const json = await legacyResponse.json();
                    legacyData = json.data || {};
                }

                // Fetch New Flexible Configs
                const newResponse = await fetch('/api/cms/user-ai-config');
                let newData: Record<string, any> = {};
                if (newResponse.ok) {
                    const json = await newResponse.json();
                    newData = json.data || {};
                }

                // Fetch Social Status
                const socialResponse = await fetch('/api/cms/social-status');
                let socialData: Record<string, boolean> = {};
                if (socialResponse.ok) {
                    socialData = await socialResponse.json();
                }

                setIntegrations(prev => prev.map(integration => {
                    // Logic to map status based on stored config
                    if (integration.id === 'google') {
                        // Legacy logic
                        if (legacyData && (legacyData as any)['google']) {
                            return {
                                ...integration,
                                connected: (legacyData as any)['google'].configured,
                                maskedKey: (legacyData as any)['google'].masked
                            };
                        }
                    } else if (integration.type === 'ai') {
                        const providerKey = integration.id === 'google_standard' ? 'GOOGLE' : integration.id.toUpperCase();

                        if (newData[providerKey]) {
                            return {
                                ...integration,
                                connected: newData[providerKey].configured,
                                maskedKey: newData[providerKey].masked,
                                configuration: newData[providerKey].configuration
                            };
                        }
                    } else if (integration.type === 'social') {
                        const providerIdMap: Record<string, string> = {
                            "twitter": "twitter",
                            "linkedin": "linkedin",
                            "microsoft": "azure-ad",
                            "google_social": "google",
                            "github": "github",
                            "meta": "facebook",
                            "slack": "slack"
                        };
                        const dbProvider = providerIdMap[integration.id] || integration.id;

                        if (socialData[dbProvider]) {
                            return {
                                ...integration,
                                connected: true
                            };
                        }
                    }

                    return integration;
                }));
            } catch (error) {
                console.error("Error fetching integration status:", error);
            }
        };

        fetchStatus();
    }, [refreshTrigger, session, searchParams]); // Add session dependency

    // Handle OAuth Errors
    useEffect(() => {
        const error = searchParams.get("error");
        const params_obj = (params as any);
        const locale = params_obj?.locale;
        const tenant = params_obj?.tenant;

        if (error) {
            let message = "Authentication failed";
            if (error === "OAuthAccountNotLinked") {
                message = "This email is already associated with another account. Please sign in with the original provider.";
            } else if (error === "OAuthCallback") {
                message = "Error during OAuth callback.";
            } else if (error === "AccessDenied") {
                message = "Access denied by provider.";
            }

            toast.error("Integration Error", {
                description: message,
            });

            // Clean URL
            if (locale && tenant) {
                router.replace(`/${locale}/cms/${tenant}/oauth`);
            } else {
                router.replace("/cms/oauth");
            }
        }
    }, [searchParams, router, params]);

    const handleDisconnect = async (integration: Integration) => {
        try {
            const res = await fetch(`/api/cms/social-status?provider=${integration.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success(`Disconnected ${integration.name}`);
                setRefreshTrigger(prev => prev + 1);
            } else {
                toast.error("Failed to disconnect");
            }
        } catch (error) {
            console.error("Disconnect error", error);
            toast.error("Failed to disconnect");
        }
    };

    const handleConfigure = (integration: Integration) => {
        // AI Provider: Open User API Key Modal
        if (integration.type === "ai") {
            const modalProvider = {
                ...integration,
                id: integration.id === 'google_standard' ? 'google' : integration.id
            };
            setSelectedProvider(modalProvider as any); // Cast for type compatibility
            setIsKeyModalOpen(true);
            return;
        }

        // Social Provider
        if (integration.type === "social") {
            if (integration.connected) {
                // If connected, open modal to confirm disconnect or show settings? 
                // Or just disconnect directly? User requested "option to disconnect".
                // Let's add a confirmation via toast or just direct disconnect for now, 
                // but usually better to have a small confirmation. 
                // For this request, let's allow re-opening the modal OR handle disconnect via a separate button.
                // Re-using the button: if connected, maybe show "Disconnect" button variant.
                // The prompt says "will have the option to disconnect".
            }
            setSelectedProvider(integration);
            setIsSocialModalOpen(true);
        }
    };

    const getAuthProviderId = (integrationId: string) => {
        const providerMap: Record<string, string> = {
            "twitter": "twitter",
            "linkedin": "linkedin",
            "microsoft": "azure-ad",
            "google_social": "google",
            "meta": "facebook",
            "slack": "slack",
        };
        return providerMap[integrationId];
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        AI Integrations
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        {activeTab === "ai" && "Manage your AI models. Bring your own keys (BYOK) for full control."}
                        {activeTab === "system" && "Configure global system settings and defaults for your AI integrations."}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-8">
                    <TabsTrigger
                        value="ai"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Brain className="w-3.5 h-3.5 hidden sm:block" />
                        <span className="sm:hidden">AI Models</span>
                        <span className="hidden sm:inline">AI Models (BYOK)</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="system"
                        className="px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Lock className="w-3.5 h-3.5 hidden sm:block" />
                        <span className="sm:hidden">System</span>
                        <span className="hidden sm:inline">Unified System Config</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="ai" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                        )}>
                            {integrations.filter(i => i.type === "ai").map((integration) => (
                                <IntegrationCard
                                    key={integration.id}
                                    integration={integration}
                                    viewMode={viewMode}
                                    onConfigure={() => handleConfigure(integration)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <UnifiedAiConfig isAdmin={!!session?.user?.isAdmin} />
                    </TabsContent>
                </div>
            </Tabs>

            <div className="bg-slate-900/30 p-4 border border-white/5 rounded-lg text-center mt-12">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    All API keys are encrypted with AES-256 and stored securely. We never share your keys.
                </p>
            </div>

            {/* AI Key Modal */}
            {selectedProvider && isKeyModalOpen && (
                <ApiKeyModal
                    isOpen={isKeyModalOpen}
                    onClose={() => setIsKeyModalOpen(false)}
                    provider={selectedProvider}
                    currentStatus={{
                        configured: selectedProvider.connected,
                        masked: selectedProvider.maskedKey || null,
                        configuration: selectedProvider.configuration
                    }}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}
        </div>
    );
}

function IntegrationCard({ integration, viewMode, onConfigure, onDisconnect }: { integration: Integration, viewMode: "grid" | "list", onConfigure: () => void, onDisconnect?: () => void }) {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className={cn(
            "relative group bg-[#0A0A0B]/80 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 flex",
            viewMode === "grid" ? "flex-col h-full" : "flex-row items-center gap-6",
            integration.connected
                ? "border-green-500/50 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)]"
                : "border-white/10 hover:border-cyan-500/30 hover:shadow-cyan-500/10",
            integration.status === "coming_soon" && "opacity-60 grayscale-[0.5]"
        )}>
            {/* Header / Icon */}
            <div className={cn("flex justify-between items-start", viewMode === "grid" ? "mb-4 w-full" : "mb-0 shrink-0")}>
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 group-hover:border-white/20 transition-colors bg-black/50">
                    <NextImage
                        src={integration.icon}
                        alt={integration.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                {viewMode === "grid" && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors",
                        integration.connected
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_-2px_rgba(34,197,94,0.4)]"
                            : integration.status === "coming_soon"
                                ? "bg-slate-800 text-slate-500 border border-white/5"
                                : "bg-slate-800 text-slate-400 border border-white/5"
                    )}>
                        {integration.connected ? (
                            <><CheckCircle className="h-3 w-3" /> Connected</>
                        ) : integration.status === "coming_soon" ? (
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
                        {integration.name}
                        {integration.isBeta && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded uppercase">Beta</span>}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">
                        {integration.description}
                    </p>
                </div>

                {/* Key Display (Only Grid or if space allows) */}
                {integration.connected && integration.maskedKey && (
                    <div className={cn("mb-4", viewMode === "list" && "w-64 mb-0 hidden lg:block")}>
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                            <span>API Configuration</span>
                        </div>
                        <div className="relative group/key">
                            <div className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-3 pr-20 font-mono text-xs text-slate-300 truncate">
                                {showKey ? integration.maskedKey : "••••••••••••••••••••••••"}
                            </div>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className={cn(viewMode === "list" ? "shrink-0 w-48" : "w-full mt-auto")}>
                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={onConfigure}
                            disabled={integration.status === "coming_soon"}
                            variant={(!integration.connected && integration.status !== "coming_soon") ? "gradient" : "default"}
                            className={cn(
                                "w-full rounded-lg font-semibold transition-all",
                                integration.connected
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5"
                                    : integration.status === "coming_soon"
                                        ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5"
                                        : ""
                            )}
                        >
                            {integration.status === "coming_soon" ? "Coming Soon" : integration.connected ? "Update Configuration" : "Connect"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
