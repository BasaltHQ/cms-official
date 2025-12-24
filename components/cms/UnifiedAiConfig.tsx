"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Power, ShieldCheck, Eye, EyeOff, Lock, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MessageSentModal from "@/components/modals/message-sent-modal";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";

// Define supported providers
// Define supported providers
const PROVIDERS = [
    { id: "OPENAI", label: "OpenAI", color: "text-green-400", link: "https://platform.openai.com/api-keys" },
    { id: "AZURE", label: "Azure", color: "text-blue-400", link: "https://portal.azure.com" },
    { id: "ANTHROPIC", label: "Anthropic", color: "text-orange-400", link: "https://console.anthropic.com/settings/keys" },
    { id: "AWS", label: "AWS Bedrock", color: "text-orange-500", link: "https://aws.amazon.com/bedrock/" },
    { id: "GOOGLE", label: "Google", color: "text-yellow-400", link: "https://aistudio.google.com/app/apikey" },
    { id: "GROK", label: "Grok", color: "text-slate-200", link: "https://console.x.ai/" },
    { id: "DEEPSEEK", label: "DeepSeek", color: "text-purple-400", link: "https://platform.deepseek.com" },
    { id: "PERPLEXITY", label: "Perplexity", color: "text-teal-400", link: "https://www.perplexity.ai/settings/api" },
    { id: "MISTRAL", label: "Mistral", color: "text-yellow-600", link: "https://console.mistral.ai/api-keys/" },
];

interface AiConfig {
    id?: string;
    provider: string;
    apiKey: string;
    defaultModelId: string;
    baseUrl?: string;
    configuration?: any; // JSON for extras
    isActive: boolean;
}


export function UnifiedAiConfig({ isAdmin }: { isAdmin: boolean }) {
    const [activeTab, setActiveTab] = useState("OPENAI");
    const [configs, setConfigs] = useState<Record<string, AiConfig>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch("/api/cms/system-ai-config");
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Failed to load configs", error);
            toast.error("Failed to load system configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const currentConfig = configs[activeTab] || {
            provider: activeTab,
            apiKey: "",
            defaultModelId: "",
            isActive: true,
            configuration: {}
        };
        console.log("Saving config for", activeTab, "Default Model:", currentConfig.defaultModelId); // Debug statement


        try {
            setSaving(true);
            const res = await fetch("/api/cms/system-ai-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentConfig),
            });

            if (!res.ok) throw new Error("Failed to save");

            const saved = await res.json();
            setConfigs(prev => ({ ...prev, [activeTab]: saved }));
            setShowSuccessModal(true);
        } catch (error) {
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (field: keyof AiConfig, value: any) => {
        setConfigs(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                provider: activeTab, // Ensure provider is set
                [field]: value
            }
        }));
    };

    const updateNestedConfig = (key: string, value: string) => {
        setConfigs(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                provider: activeTab,
                configuration: {
                    ...prev[activeTab]?.configuration,
                    [key]: value
                }
            }
        }));
    };



    const handleSetActive = async (providerId: string) => {
        try {
            setLoading(true); // Short loading state for the switch
            const res = await fetch("/api/cms/system-ai-config/set-active", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: providerId }),
            });

            if (!res.ok) throw new Error("Failed to set active provider");

            // Update local state: Set selected to True, all others to False
            setConfigs(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    next[key].isActive = key === providerId;
                });
                return next;
            });

            toast.success(`${PROVIDERS.find(p => p.id === providerId)?.label} is now the Primary System Model`);

        } catch (error) {
            toast.error("Failed to update active provider");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/cms/system-ai-config?provider=${activeTab}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setConfigs(prev => {
                const next = { ...prev };
                delete next[activeTab];
                return next;
            });
            setShowDeleteModal(false);
            toast.success("Configuration deleted successfully");
        } catch (error) {
            toast.error("Failed to delete configuration");
        } finally {
            setSaving(false);
        }
    };

    const current = configs[activeTab] || { apiKey: "", defaultModelId: "", isActive: false, configuration: {} };
    const hasKey = current.apiKey && current.apiKey.length > 0;

    // Defined supported models per provider (2025 Refresh)
    const PROVIDER_MODELS: Record<string, string[]> = {
        OPENAI: [
            "gpt-5",
            "gpt-4.5-preview",
            "o3-pro",
            "o3-mini",
            "o1-pro",
            "o1",
            "gpt-4o",
            "gpt-4o-mini"
        ],
        AZURE: [
            "gpt-5",
            "gpt-4o",
            "o3-pro",
            "o1",
            "gpt-4-turbo",
            "gpt-35-turbo"
        ],
        ANTHROPIC: [
            "claude-4-5-opus",
            "claude-4-5-sonnet",
            "claude-4-5-haiku",
            "claude-4-1-opus",
            "claude-4-opus",
            "claude-3-5-sonnet-latest",
            "claude-3-5-haiku-latest"
        ],
        AWS: [
            "anthropic.claude-4-5-sonnet-20250929-v1:0",
            "anthropic.claude-4-5-haiku-20251001-v1:0",
            "anthropic.claude-opus-4-5-20251101-v1:0",
            "amazon.nova-premier-v1:0",
            "anthropic.claude-3-5-sonnet-20240620-v1:0",
            "anthropic.claude-3-5-haiku-20241022-v1:0"
        ],
        GOOGLE: [
            "gemini-3.0-pro",
            "gemini-3.0-deep-think",
            "gemini-2.5-pro",
            "gemini-2.5-flash",
            "gemini-2.0-pro",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ],
        GROK: [
            "grok-4-1",
            "grok-4",
            "grok-3",
            "grok-2-1212"
        ],
        DEEPSEEK: [
            "deepseek-v3.2",
            "deepseek-r1",
            "deepseek-v3",
            "deepseek-chat",
            "deepseek-coder"
        ],
        PERPLEXITY: [
            "sonar-deep-research",
            "sonar-reasoning-pro",
            "sonar-pro",
            "sonar"
        ],
        MISTRAL: [
            "mistral-large-3",
            "mistral-small-3",
            "pixtral-large",
            "codestral-latest",
            "ministral-3"
        ]
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>;

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#0A0A0B] border border-white/10 rounded-xl space-y-4 text-center">
                <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                    <Lock className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Access Denied</h3>
                <p className="text-slate-400 max-w-md">
                    Unified AI Configuration is restricted to Administrators only. Please contact your system administrator to manage these settings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-[#0A0A0B] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/50 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Unified AI Configuration</h2>
                        <p className="text-sm text-slate-400">Manage System-wide API keys and Default Models.</p>
                    </div>

                    {/* Primary Model Selector */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 pl-4 rounded-lg border border-white/10">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider whitespace-nowrap">Primary System Model</span>
                        <Select
                            value={Object.values(configs).find(c => c.isActive)?.provider || "AZURE"}
                            onValueChange={handleSetActive}
                        >
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-900 border-white/10 text-white focus:ring-0">
                                <SelectValue placeholder="Select Active Model" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0B] border-white/10 text-white">
                                {PROVIDERS.map(p => {
                                    const isConfigured = configs[p.id]?.apiKey?.length > 0;
                                    return (
                                        <SelectItem
                                            key={p.id}
                                            value={p.id}
                                            disabled={!isConfigured}
                                            className="text-xs focus:bg-white/10 focus:text-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", isConfigured ? "bg-green-500" : "bg-slate-700")} />
                                                {p.label}
                                            </div>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="hidden md:flex px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/10 text-yellow-200 text-xs items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Note: These settings define the <span className="font-bold text-yellow-100">System Key</span> and <span className="font-bold text-yellow-100">System Defaults</span>. Teams can override these in their own settings.
                </div>

                {/* Tabs */}
                <div className="hidden md:flex border-b border-white/10 overflow-x-auto scrollbar-hide bg-black/40">
                    {PROVIDERS.map((provider) => (
                        <button
                            key={provider.id}
                            onClick={() => setActiveTab(provider.id)}
                            className={cn(
                                "px-6 py-4 text-xs font-bold tracking-wider transition-all border-b-2 whitespace-nowrap",
                                activeTab === provider.id
                                    ? `border-cyan-500 bg-cyan-500/5 text-white shadow-[inset_0_-10px_20px_-15px_rgba(6,182,212,0.3)]`
                                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                            )}
                        >
                            {provider.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 min-h-[400px]">
                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">API Key (System Key)</label>
                        <div className="relative group">
                            <input
                                type={showKey ? "text" : "password"}
                                placeholder={`Enter ${activeTab} API Key`}
                                className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                value={current.apiKey || ""}
                                onChange={(e) => updateConfig("apiKey", e.target.value)}
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {PROVIDERS.find(p => p.id === activeTab)?.link && (
                            <p className="text-xs text-slate-500 mt-2">
                                Get your key from{" "}
                                <a
                                    href={PROVIDERS.find(p => p.id === activeTab)?.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                                >
                                    {PROVIDERS.find(p => p.id === activeTab)?.label} Dashboard <ExternalLink className="h-3 w-3" />
                                </a>
                            </p>
                        )}
                    </div>

                    {/* Default Model */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Default Model</label>

                        <Select
                            value={current.defaultModelId}
                            onValueChange={(val) => updateConfig("defaultModelId", val)}
                        >
                            <SelectTrigger className="w-full bg-black/60 border border-white/10 rounded-lg h-11 text-sm text-white focus:ring-0">
                                <SelectValue placeholder={`Select ${PROVIDERS.find(p => p.id === activeTab)?.label} Model...`} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0B] border-white/10 text-white max-h-[300px]">
                                {PROVIDER_MODELS[activeTab]?.map((model) => (
                                    <SelectItem key={model} value={model} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                                        {model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-500">This model will be used if a Team selects &quot;Provider Default&quot;.</p>
                    </div>

                    {/* Provider Nuances - Azure */}
                    {activeTab === "AZURE" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-blue-300">Resource Name</label>
                                <input
                                    placeholder="my-azure-resource"
                                    className="w-full bg-black/40 border border-blue-500/20 rounded px-3 py-2 text-xs text-blue-100 placeholder:text-blue-500/30 focus:border-blue-500 outline-none"
                                    value={current.configuration?.resourceName || ""}
                                    onChange={(e) => updateNestedConfig("resourceName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-blue-300">Deployment ID</label>
                                <input
                                    placeholder="my-deployment-name"
                                    className="w-full bg-black/40 border border-blue-500/20 rounded px-3 py-2 text-xs text-blue-100 placeholder:text-blue-500/30 focus:border-blue-500 outline-none"
                                    value={current.configuration?.deploymentId || ""}
                                    onChange={(e) => updateNestedConfig("deploymentId", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-blue-300">API Version</label>
                                <input
                                    placeholder="2024-02-15-preview"
                                    className="w-full bg-black/40 border border-blue-500/20 rounded px-3 py-2 text-xs text-blue-100 placeholder:text-blue-500/30 focus:border-blue-500 outline-none"
                                    value={current.configuration?.apiVersion || ""}
                                    onChange={(e) => updateNestedConfig("apiVersion", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Provider Nuances - Google */}
                    {activeTab === "GOOGLE" && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-yellow-300">Project ID (Vertex AI only)</label>
                                <input
                                    placeholder="my-gcp-project-id"
                                    className="w-full bg-black/40 border border-yellow-500/20 rounded px-3 py-2 text-xs text-yellow-100 placeholder:text-yellow-500/30 focus:border-yellow-500 outline-none"
                                    value={current.configuration?.projectId || ""}
                                    onChange={(e) => updateNestedConfig("projectId", e.target.value)}
                                />
                                <p className="text-[10px] text-yellow-500/50">Leave empty if using Google AI Studio API Key (Nano Banana).</p>
                            </div>
                        </div>
                    )}

                    {/* Provider Nuances - AWS */}
                    {activeTab === "AWS" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-orange-300">AWS Region</label>
                                <Select
                                    value={current.configuration?.region || "us-east-1"}
                                    onValueChange={(val) => updateNestedConfig("region", val)}
                                >
                                    <SelectTrigger className="w-full bg-black/40 border border-orange-500/20 rounded h-[34px] className text-xs text-orange-100 focus:ring-0">
                                        <SelectValue placeholder="Select AWS Region..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0B] border-white/10 text-white max-h-[300px]">
                                        <SelectItem value="us-east-1">us-east-1 (N. Virginia)</SelectItem>
                                        <SelectItem value="us-east-2">us-east-2 (Ohio)</SelectItem>
                                        <SelectItem value="us-west-1">us-west-1 (N. California)</SelectItem>
                                        <SelectItem value="us-west-2">us-west-2 (Oregon)</SelectItem>
                                        <SelectItem value="ap-south-1">ap-south-1 (Mumbai)</SelectItem>
                                        <SelectItem value="ap-northeast-1">ap-northeast-1 (Tokyo)</SelectItem>
                                        <SelectItem value="ap-northeast-2">ap-northeast-2 (Seoul)</SelectItem>
                                        <SelectItem value="ap-northeast-3">ap-northeast-3 (Osaka)</SelectItem>
                                        <SelectItem value="ap-southeast-1">ap-southeast-1 (Singapore)</SelectItem>
                                        <SelectItem value="ap-southeast-2">ap-southeast-2 (Sydney)</SelectItem>
                                        <SelectItem value="ca-central-1">ca-central-1 (Canada Central)</SelectItem>
                                        <SelectItem value="eu-central-1">eu-central-1 (Frankfurt)</SelectItem>
                                        <SelectItem value="eu-west-1">eu-west-1 (Ireland)</SelectItem>
                                        <SelectItem value="eu-west-2">eu-west-2 (London)</SelectItem>
                                        <SelectItem value="eu-west-3">eu-west-3 (Paris)</SelectItem>
                                        <SelectItem value="sa-east-1">sa-east-1 (São Paulo)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-orange-300">Access Key ID</label>
                                <input
                                    placeholder="AKIA..."
                                    className="w-full bg-black/40 border border-orange-500/20 rounded px-3 py-2 text-xs text-orange-100 placeholder:text-orange-500/30 focus:border-orange-500 outline-none"
                                    value={current.configuration?.accessKeyId || ""}
                                    onChange={(e) => updateNestedConfig("accessKeyId", e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] text-orange-500/50">Note: Enter your Secret Access Key in the main API Key field above.</p>
                            </div>
                        </div>
                    )}

                    {/* Base URL (Common) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Base URL (Optional)</label>
                        <input
                            type="text"
                            placeholder="https://api.example.com/v1"
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                            value={current.baseUrl || ""}
                            onChange={(e) => updateConfig("baseUrl", e.target.value)}
                        />
                    </div>

                    {/* Enable Toggle */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <Switch
                            disabled={!hasKey}
                            checked={current.isActive !== false}
                            onCheckedChange={(val) => updateConfig("isActive", val)}
                            className="data-[state=checked]:bg-cyan-500 disabled:opacity-50"
                        />
                        <span className={cn("text-sm font-medium transition-colors", !hasKey ? "text-slate-600" : "text-white")}>Enable {PROVIDERS.find(p => p.id === activeTab)?.label} Provider</span>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 flex items-center gap-3">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !hasKey}
                            className="flex-1 bg-cyan-900/50 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-900/80 hover:text-white transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save {PROVIDERS.find(p => p.id === activeTab)?.label} Config
                        </Button>

                        {hasKey && (
                            <Button
                                variant="outline"
                                disabled={saving}
                                onClick={() => setShowDeleteModal(true)}
                                className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                </div>
            </div>
            {/* Success Modal */}
            <MessageSentModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Configuration Saved"
                message={`The ${PROVIDERS.find(p => p.id === activeTab)?.label} AI configuration has been successfully updated and secured.`}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={saving}
                title={`Delete ${PROVIDERS.find(p => p.id === activeTab)?.label} Config?`}
                description="Are you sure you want to delete this configuration? This will permanently remove the API key and settings for this provider."
            />
        </div>
    );
}
