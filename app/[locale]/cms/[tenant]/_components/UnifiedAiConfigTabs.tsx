"use client";

import { useState } from "react";
import { AiProvider } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSystemAiConfig } from "@/actions/cms/unified-ai";
import { toast } from "sonner";
import { Brain } from "lucide-react";

interface UnifiedAiConfigTabsProps {
    providers: AiProvider[];
    allModels: any[]; // Using any[] for simplicity as passing complex Prisma types can be tricky, but ideally precise
    systemConfigs: any[];
}

export function UnifiedAiConfigTabs({
    providers,
    allModels,
    systemConfigs
}: UnifiedAiConfigTabsProps) {
    const [activeTab, setActiveTab] = useState<string>("OPENAI");

    const getConfig = (provider: string) => systemConfigs.find(c => c.provider === provider);

    const handleSave = async (formData: FormData) => {
        try {
            await saveSystemAiConfig(formData);
            toast.success("Configuration saved successfully");
        } catch (error) {
            toast.error("Failed to save configuration");
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile View: Select Dropdown */}
            <div className="md:hidden mb-6">
                <Label className="text-slate-400 mb-2 block text-xs uppercase tracking-wider font-semibold">Select Provider</Label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full bg-[#0A0A0B] border-white/10 text-white">
                        <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0B] border-white/10 text-white">
                        {providers.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Desktop View: Tabs List */}
            {/* Desktop View: Tabs List */}
            <div className="hidden md:block">
                <TabsList className="inline-flex h-auto bg-[#0A0A0B] border border-white/10 rounded-lg p-1 flex-wrap gap-1 mb-4">
                    {providers.map(p => (
                        <TabsTrigger
                            key={p}
                            value={p}
                            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-sm"
                        >
                            {p}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* Content Areas */}
            {providers.map(provider => {
                const config = getConfig(provider);
                const configJson = config?.configuration as any || {};
                const providerModels = allModels.filter(m => m.provider === provider);

                return (
                    <TabsContent key={provider} value={provider} className="animate-in fade-in-50 slide-in-from-bottom-2">
                        <form action={handleSave} className="space-y-4 p-4 border border-white/5 rounded-xl bg-black/20">
                            <input type="hidden" name="provider" value={provider} />

                            <div className="grid gap-2">
                                <Label className="text-slate-300">API Key (System Key)</Label>
                                <div className="relative">
                                    <Input
                                        name="apiKey"
                                        type="password"
                                        placeholder={`Enter ${provider} API Key`}
                                        defaultValue={config?.apiKey || ""}
                                        className="bg-black/50 border-white/10 pr-10" // pr-10 for the icon space
                                    />
                                    <Brain className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                </div>
                            </div>

                            {/* Default Model Selector */}
                            <div className="grid gap-2">
                                <Label className="text-slate-300">System Default Model</Label>
                                <Select name="defaultModelId" defaultValue={config?.defaultModelId || ""}>
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select System Default Model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0B] border-white/10 text-white">
                                        {providerModels.length === 0 && <SelectItem value="none" disabled>No active models found</SelectItem>}
                                        {providerModels.map(m => (
                                            <SelectItem key={m.id} value={m.modelId}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">This model will be used if a Team selects "Provider Default".</p>
                            </div>

                            {/* AZURE SPECIFIC FIELDS */}
                            {provider === "AZURE" && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-white/10 rounded-lg bg-white/5">
                                    <div className="grid gap-2">
                                        <Label className="text-slate-300">Resource Name</Label>
                                        <Input name="resourceName" placeholder="my-openai-resource" defaultValue={configJson.resourceName || ""} className="bg-black/50 border-white/10" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-300">Deployment ID</Label>
                                        <Input name="deploymentId" placeholder="my-gpt4-deployment" defaultValue={configJson.deploymentId || ""} className="bg-black/50 border-white/10" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-slate-300">API Version</Label>
                                        <Input name="apiVersion" placeholder="2024-02-15-preview" defaultValue={configJson.apiVersion || ""} className="bg-black/50 border-white/10" />
                                    </div>
                                </div>
                            )}

                            {/* GOOGLE VERTEX FIELDS */}
                            {provider === "GOOGLE" && (
                                <div className="grid gap-2 p-4 border border-white/10 rounded-lg bg-white/5">
                                    <Label className="text-slate-300">Project ID (Vertex AI only)</Label>
                                    <Input name="projectId" placeholder="my-gcp-project-id" defaultValue={configJson.projectId || ""} className="bg-black/50 border-white/10" />
                                    <p className="text-xs text-slate-500">Leave empty if using Google AI Studio API Key.</p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label className="text-slate-300">Base URL (Optional)</Label>
                                <Input
                                    name="baseUrl"
                                    placeholder="https://api.example.com/v1"
                                    defaultValue={config?.baseUrl || ""}
                                    className="bg-black/50 border-white/10"
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                                <Switch name="isActive" defaultChecked={config?.isActive ?? true} />
                                <Label className="text-slate-200">Enable Provider</Label>
                            </div>

                            <Button type="submit" variant="gradient" className="w-full md:w-auto text-white">Save {provider} Config</Button>
                        </form>
                    </TabsContent>
                )
            })}
        </Tabs>
    );
}
