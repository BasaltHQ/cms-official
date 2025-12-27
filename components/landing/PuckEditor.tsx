"use client";

import { useState, useEffect } from "react";
import { Puck, Data, Render, usePuck } from "@measured/puck";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "@measured/puck/puck.css";
import { ArrowLeft, Save, Sparkles, Monitor, Code, Loader2, LayoutTemplate, Tablet, Smartphone, PanelLeft, PanelRight, ArrowUpFromLine, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DeploymentDropdown } from "./DeploymentDropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { TemplateModal } from "./TemplateModal";
import { Template } from "@/lib/puck.templates";
import { syncToWordPress } from "@/actions/cms/sync-to-wordpress";
import "@/components/landing/puck-theme.css"; // Custom Dark Theme
import { useEditor } from "@/components/landing/EditorContext";
import { puckConfig } from "@/lib/puck.config";
import { Button } from "@/components/ui/button";
import { saveLandingPage } from "@/actions/cms/save-landing-page";
import { askEditorAi } from "@/actions/cms/ask-editor-ai";
import { toast } from "sonner";

const VIEWPORTS = [
    { width: 360, height: "auto" as const, label: "Mobile", icon: <Smartphone size={16} /> },
    { width: 768, height: "auto" as const, label: "Tablet", icon: <Tablet size={16} /> },
    { width: 2400, height: "auto" as const, label: "Desktop", icon: <Monitor size={16} /> },
];

export default function EditorPage({
    params,
    initialData,
    pageSlug,
    lastPublishedAt,
    aiModels = [],
    allPages = [],
    wordpressPostId,
    wordpressPostType
}: {
    params: { id: string };
    initialData: Data | null;
    pageSlug: string;
    lastPublishedAt?: Date | null;
    aiModels?: { name: string; modelId: string; provider: string }[];
    allPages?: { id: string; title: string; slug: string }[];
    wordpressPostId?: number | null;
    wordpressPostType?: string | null;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAdvancedMode, aiModelId, setAiModelId, isAdvancedMode } = useEditor();

    // Initialize from URL or default to visual
    const initialMode = searchParams.get("mode") === "advanced" ? "code" : "visual";
    const [viewMode, setViewMode] = useState<"visual" | "code">(isAdvancedMode ? "code" : "visual");
    const [editorKey, setEditorKey] = useState(0);

    const setViewModeAndRefresh = (mode: "visual" | "code") => {
        setViewMode(mode);
        // Force refresh when switching back to visual to ensure clean state
        if (mode === "visual") {
            setEditorKey(prev => prev + 1);
        }
    };

    // Initial load effect
    useEffect(() => {
        setAdvancedMode(initialMode === "code");
    }, [initialMode, setAdvancedMode]);

    const [isSaving, setIsSaving] = useState(false);
    // REMOVED: const [zoom, setZoom] = useState(1);
    const [activeViewport, setActiveViewport] = useState(VIEWPORTS[2]); // Default to Desktop
    const [showSidebars, setShowSidebars] = useState(true);
    const [data, setData] = useState<Data>(initialData || { content: [], root: { props: { title: "My Page" } } });

    // Sanitize Data IDs on Mount to prevent dnd-kit crashes
    useState(() => {
        if (data?.content) {
            let hasChanges = false;
            const sanitizedContent = data.content.map(item => {
                // Ensure unique ID for drag-and-drop
                if (!item.props.id) {
                    hasChanges = true;
                    return { ...item, props: { ...item.props, id: `block-${Math.random().toString(36).substr(2, 9)}` } };
                }
                return item;
            });

            if (hasChanges) {
                setData(prev => ({ ...prev, content: sanitizedContent }));
            }
        }
    });

    // Set default AI model
    useEffect(() => {
        if (!aiModelId && aiModels && aiModels.length > 0) {
            setAiModelId(aiModels[0].modelId);
        }
    }, [aiModelId, aiModels, setAiModelId]);

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: `Ready to assist. I see you are editing "${initialData?.root?.props?.title || "this page"}".` }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const selectedModel = aiModels?.find(m => m.modelId === aiModelId);
            const modelOptions = selectedModel ? { modelId: selectedModel.modelId, provider: selectedModel.provider } : undefined;
            const result = await askEditorAi(userMsg, `Page Title: ${initialData?.root?.props?.title}`, modelOptions);
            if (result.success) {
                if (result.text) {
                    setChatMessages(prev => [...prev, { role: "assistant", content: result.text }]);
                }

                // Handle AI generated JSON Data
                if (result.data) {
                    setData(prev => {
                        const newData = {
                            ...prev,
                            ...result.data,
                            // Ensure root props are merged safely
                            root: { ...prev.root, ...(result.data.root || {}) },
                            // Replace content if provided
                            content: result.data.content || prev.content
                        };
                        return newData;
                    });

                    toast.success("Page structure updated by AI");
                }
            } else {
                setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
            }
        } catch (e) {
            setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Auto-Run Genius Mode Prompt
    useEffect(() => {
        const prompt = searchParams.get("aiPrompt");
        if (prompt && !isChatLoading && chatMessages.length === 1) {
            // Remove prompt from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("aiPrompt");
            window.history.replaceState({}, "", newUrl.toString());

            const runGenius = async () => {
                setChatMessages(prev => [...prev, { role: "user", content: prompt }]);
                setIsChatLoading(true);

                try {
                    // Use current model or default
                    const selectedModel = aiModels?.find(m => m.modelId === aiModelId) || aiModels?.[0];
                    const modelOptions = selectedModel ? { modelId: selectedModel.modelId, provider: selectedModel.provider } : undefined;

                    const result = await askEditorAi(prompt, `Page Title: ${initialData?.root?.props?.title || "New Page"}`, modelOptions);

                    if (result.success) {
                        if (result.text) {
                            setChatMessages(prev => [...prev, { role: "assistant", content: result.text }]);
                        }

                        if (result.data) {
                            setData(prev => ({
                                ...prev,
                                ...result.data,
                                root: { ...prev.root, ...(result.data.root || {}) },
                                content: result.data.content || prev.content
                            }));
                            toast.success("Page structure generated by Genius Mode");
                        }
                    } else {
                        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, Genius Mode encountered an error." }]);
                    }
                } catch (e) {
                    setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
                } finally {
                    setIsChatLoading(false);
                }
            };

            runGenius();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, aiModels, aiModelId, initialData, isChatLoading, chatMessages.length]);

    // Sync Context with Local State
    useEffect(() => {
        setAdvancedMode(viewMode === "code");
    }, [viewMode, setAdvancedMode]);

    // Handle save
    const handlePublish = async (data: Data) => {
        setIsSaving(true);
        const result = await saveLandingPage(params.id, data);
        if (result.success) {
            toast.success("Draft Saved");
            router.refresh(); // Refresh to update Sidebar list and server state
        } else {
            toast.error("Save Failed");
        }
        setIsSaving(false);
    };

    const [isSyncing, setIsSyncing] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [manualWpUrl, setManualWpUrl] = useState("");

    const handleSyncToWP = async () => {
        if (!wordpressPostId && !showLinkModal) {
            // If not linked, open the link modal first
            setShowLinkModal(true);
            return;
        }

        setIsSyncing(true);
        // Save first ensure latest state
        await handlePublish(data);

        // Then sync
        const result = await syncToWordPress(params.id, data, manualWpUrl); // Pass manual URL if available from modal context (need to refactor sync action to accept it or simple link first)

        // Wait, best approach: 
        // 1. If linked -> Sync
        // 2. If not linked -> Open Modal -> User enters URL -> We call "LinkAndSync" action

        if (result.success) {
            toast.success("Synced to WordPress successfully!");
            router.refresh(); // Refresh to get new WP ID if it was a create/link op
        } else {
            toast.error("Failed to sync: " + result.error);
        }
        setIsSyncing(false);
        setShowLinkModal(false);
    };

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    const handleSelectTemplate = (template: Template) => {
        // Sanitize IDs to ensure uniqueness
        const newContent = template.data.content?.map(item => ({
            ...item,
            props: {
                ...item.props,
                id: `block-${Math.random().toString(36).substr(2, 9)}`
            }
        })) || [];

        setData({
            ...template.data,
            content: newContent,
            root: {
                ...template.data.root,
                props: {
                    ...template.data.root.props,
                    // Preserve existing title if it exists, otherwise use template title
                    title: data.root.props?.title || template.data.root.props?.title || "My Page"
                }
            }
        });

        // Force Puck to re-mount and render the new data immediately
        setEditorKey(prev => prev + 1);

        toast.success(`Template "${template.name}" applied successfully`);
    };

    // Portal for Immersive Mode (Optional mounting check)
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const content = (
        <div className={`font-sans flex-1 flex flex-col w-full min-h-0 overflow-hidden transition-colors duration-500 ${viewMode === "visual" ? "bg-slate-950" : "bg-[#0a0a0a]"}`}>
            {/* Toolbar - Sleek & Beautiful */}
            <div className={`h-14 border-b backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-50 transition-all duration-500 ${viewMode === "visual" ? "border-white/10 bg-black/40" : "border-orange-500/20 bg-orange-950/20"}`}>
                <div className="flex items-center gap-4">
                    {/* Sidebar Toggle & Back */}
                    <div className="flex items-center gap-2">
                        {showSidebars && (
                            <Link href={`/cms/landing`} className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-slate-400 hover:text-white">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        )}

                        <button
                            onClick={() => setShowSidebars(!showSidebars)}
                            className={`h-8 w-8 rounded-full flex items-center justify-center border border-white/10 transition-all ${showSidebars ? 'bg-white/10 text-white' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`}
                            title={showSidebars ? "Hide Sidebars (Immersive Mode)" : "Show Sidebars"}
                        >
                            <PanelLeft className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    {/* Page Selector */}
                    <div className="flex flex-col">
                        {viewMode === "code" ? (
                            <select
                                className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer hover:text-indigo-400 transition-colors"
                                value={params.id}
                                onChange={(e) => {
                                    const newId = e.target.value;
                                    if (newId !== params.id) {
                                        const modeParam = viewMode === "code" ? "?mode=advanced" : "";
                                        window.location.href = `/cms/landing/${newId}${modeParam}`;
                                    }
                                }}
                            >
                                <option value={params.id} className="bg-slate-900">{initialData?.root?.props?.title || "Untitled Page"}</option>
                                {allPages && Array.from(new Set(allPages.map(p => p.id)))
                                    .map(id => allPages.find(p => p.id === id)!)
                                    .filter(p => p.id !== params.id)
                                    .map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-900">
                                            {p.title}
                                        </option>
                                    ))
                                }
                            </select>
                        ) : (
                            <div className="text-white font-bold text-sm tracking-tight">
                                {initialData?.root?.props?.title || "Untitled Page"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Viewport & Actions Group */}
                <div className="flex items-center gap-3">
                    {/* Viewport Controls */}
                    {viewMode === "visual" && (
                        <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5 mr-2">
                            {VIEWPORTS.map((vp) => (
                                <button
                                    key={vp.label}
                                    onClick={() => setActiveViewport(vp)}
                                    className={`p-1.5 rounded-md transition-all ${activeViewport.label === vp.label
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                        }`}
                                    title={vp.label}
                                >
                                    {vp.icon}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* REMOVED: ZoomControl */}

                    {/* Templates Button - Colorful Gradient */}
                    <Button
                        onClick={() => setIsTemplateModalOpen(true)}
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 text-white border-0 shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300 font-medium h-7 text-xs px-3"
                    >
                        <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" /> Templates
                    </Button>

                    {/* Mode Toggle Pill */}
                    <div className="flex items-center bg-black/40 rounded-full p-0.5 border border-white/10 backdrop-blur-md">
                        <button
                            onClick={() => setViewModeAndRefresh("visual")}
                            className={`flex items-center px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${viewMode === "visual" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <Monitor className="mr-1.5 h-3 w-3" /> Visual
                        </button>
                        <button
                            onClick={() => setViewModeAndRefresh("code")}
                            className={`flex items-center px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${viewMode === "code" ? "bg-orange-500/20 text-orange-400 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <Code className="mr-1.5 h-3 w-3" /> Code
                        </button>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <Button
                        onClick={async () => {
                            await handlePublish(data);
                            window.open('/cms/media?tab=landing_pages', '_blank');
                        }}
                        disabled={isSaving}
                        size="sm"
                        className={`rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg backdrop-blur-sm h-7 px-4 text-xs transition-all hover:border-white/30 ${viewMode === "code" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                            </>
                        )}
                    </Button>

                    <DeploymentDropdown 
                        pageId={params.id} 
                        pageSlug={pageSlug} 
                        lastPublishedAt={lastPublishedAt} 
                        data={data}
                        wordPressPostId={wordpressPostId}
                        onSyncSuccess={() => router.refresh()}
                    />

                </div>
            </div>

            {viewMode === "visual" ? (
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <Puck
                        key={editorKey}
                        config={puckConfig}
                        data={data}
                        headerPath={undefined}
                        onChange={(newData) => setData(newData)}
                        viewports={VIEWPORTS}
                        overrides={{
                            headerActions: () => <></>,
                            iframe: ({ children, document }) => {
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                useEffect(() => {
                                    if (document) {
                                        document.documentElement.style.height = "100%";
                                        document.body.style.height = "100%";
                                        document.body.style.margin = "0";
                                        document.body.style.background = "#0a0a0a";
                                    }
                                }, [document]);
                                return <>{children}</>;
                            }
                        }}
                    >
                        <div className="puck-editor-layout flex-1 flex min-h-0 w-full overflow-hidden">
                            {showSidebars && (
                                <PanelGroup direction="horizontal" className="flex-1 h-full" style={{ overflow: 'hidden' }}>
                                    {/* Components Panel - Left */}
                                    <Panel defaultSize={18} minSize={12} maxSize={30} style={{ overflow: 'hidden' }}>
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="border-r border-white/10 bg-black/20">
                                            <h3 className="text-white/60 font-semibold text-xs uppercase tracking-wider px-4 py-3 border-b border-white/5" style={{ flexShrink: 0 }}>Components</h3>
                                            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 custom-scrollbar">
                                                <Puck.Components />
                                            </div>
                                        </div>
                                    </Panel>

                                    <PanelResizeHandle className="w-1.5 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize" />

                                    {/* Page Canvas - Center */}
                                    <Panel defaultSize={54} minSize={30} style={{ overflow: 'hidden' }}>
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="bg-black/50">
                                            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }} className="custom-scrollbar p-8" id="puck-preview-container">
                                                <div 
                                                    className="preview-isolation"
                                                    style={{
                                                        width: activeViewport.width === 2400 ? '100%' : activeViewport.width,
                                                        margin: '0 auto',
                                                        minHeight: '100%',
                                                        backgroundColor: '#0a0a0a',
                                                        color: '#ffffff',
                                                        boxShadow: activeViewport.width !== 2400 && activeViewport.width !== 1280 ? '0 0 40px -10px rgba(0,0,0,0.5)' : 'none',
                                                        isolation: 'isolate',
                                                    }}>
                                                    <Puck.Preview />
                                                </div>
                                            </div>
                                        </div>
                                    </Panel>

                                    <PanelResizeHandle className="w-1.5 bg-white/5 hover:bg-emerald-500/50 transition-colors cursor-col-resize" />

                                    {/* Properties Panel - Right */}
                                    <Panel defaultSize={28} minSize={15} maxSize={40} style={{ overflow: 'hidden' }}>
                                        <PropertiesPanel />
                                    </Panel>
                                </PanelGroup>
                            )}
                            
                            {/* Immersive Mode - No sidebars */}
                            {!showSidebars && (
                                <div className="flex-1 relative bg-black/50 overflow-hidden flex flex-col min-h-0">
                                    <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative" id="puck-preview-container">
                                        <div 
                                            className="preview-isolation"
                                            style={{
                                                width: activeViewport.width === 2400 ? '100%' : activeViewport.width,
                                                margin: '0 auto',
                                                minHeight: '100vh',
                                                backgroundColor: '#0a0a0a',
                                                color: '#ffffff',
                                                boxShadow: activeViewport.width !== 2400 && activeViewport.width !== 1280 ? '0 0 40px -10px rgba(0,0,0,0.5)' : 'none',
                                                isolation: 'isolate',
                                            }}>
                                            <Puck.Preview />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Puck>
                </div>
            ) : (
                <div className="flex-1 flex bg-[#0a0a0a] overflow-hidden font-mono text-sm">
                    <PanelGroup direction="horizontal">
                        {/* LEFT: Live Preview (50%) */}
                        <Panel defaultSize={50} minSize={20} className="flex flex-col bg-slate-950 border-r border-white/5 overflow-hidden">
                            <div className="p-3 border-b border-orange-500/20 bg-orange-950/20 flex items-center justify-between">
                                <h3 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <Monitor className="h-3.5 w-3.5 text-orange-400" />
                                    Live Preview
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-black relative p-4 scrollbar-thin scrollbar-thumb-orange-900/20 scrollbar-track-transparent">
                                {/* NO TRANSFORMS, NO SCALING */}
                                <div className="bg-black rounded-lg shadow-2xl overflow-hidden min-h-full border border-white/5 ring-1 ring-white/5">
                                    <Render config={puckConfig} data={data} />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="w-1 bg-orange-900/20 hover:bg-orange-600 transition-colors cursor-col-resize" />

                        {/* MIDDLE: Code Editor (25%) */}
                        <Panel defaultSize={25} minSize={15} className="flex flex-col p-0 overflow-hidden border-r border-orange-500/10 bg-[#0f1012]">
                            <div className="flex items-center gap-3 text-orange-500 border-b border-orange-500/20 p-3 shrink-0 bg-orange-950/20">
                                <div className="p-1.5 bg-orange-950/30 rounded-lg border border-orange-500/20"><span className="text-lg">🛠️</span></div>
                                <div>
                                    <h3 className="font-bold text-sm text-amber-100">JSON Editor</h3>
                                </div>
                            </div>
                            <div className="relative group flex-1 overflow-hidden">
                                <textarea
                                    className="relative w-full h-full bg-[#0f1012] p-4 focus:ring-1 focus:ring-orange-500/50 outline-none text-[#fdf6e3] font-medium leading-relaxed resize-none text-xs"
                                    value={JSON.stringify(data, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setData(parsed);
                                        } catch (err) { }
                                    }}
                                    spellCheck={false}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="w-1 bg-orange-900/20 hover:bg-orange-600 transition-colors cursor-col-resize" />

                        {/* RIGHT: AI Agent (25%) */}
                        <Panel defaultSize={25} minSize={15} className="flex flex-col bg-[#0f1012] border-l border-orange-500/10">
                            <div className="p-3 border-b border-orange-500/20 bg-orange-950/20 backdrop-blur-sm">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-2 text-sm">
                                    <span className="p-1 bg-orange-600 rounded-md"><Sparkles className="h-3 w-3 text-white" /></span>
                                    AI Copilot
                                </h3>
                                <Select
                                    value={aiModelId}
                                    onValueChange={(val) => setAiModelId(val)}
                                >
                                    <SelectTrigger className="w-full bg-black/40 border-orange-500/20 text-stone-300 h-9 text-xs focus:ring-orange-500/50">
                                        <div className="flex items-center gap-2 truncate">
                                            {aiModelId ? (
                                                (() => {
                                                    const m = aiModels?.find(m => m.modelId === aiModelId);
                                                    return m ? (
                                                        <>
                                                            <span className="font-semibold text-white">{m.name}</span>
                                                            <span className="text-stone-500 text-[10px] uppercase">({m.provider})</span>
                                                        </>
                                                    ) : "Select Model"
                                                })()
                                            ) : (
                                                <span className="text-stone-500">Select AI Model</span>
                                            )}
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-orange-500/20 text-stone-300 max-h-[300px]">
                                        {aiModels && aiModels.length > 0 ? (
                                            (() => {
                                                const grouped = aiModels.reduce((acc, model) => {
                                                    const provider = model.provider || "OTHER";
                                                    if (!acc[provider]) acc[provider] = [];
                                                    acc[provider].push(model);
                                                    return acc;
                                                }, {} as Record<string, typeof aiModels>);

                                                return Object.entries(grouped).map(([provider, models]) => (
                                                    <SelectGroup key={provider}>
                                                        <SelectLabel className="text-[10px] text-stone-500 uppercase tracking-wider pl-2 py-1">{provider}</SelectLabel>
                                                        {models.map((model) => (
                                                            <SelectItem
                                                                key={`${model.provider}-${model.modelId}`}
                                                                value={model.modelId}
                                                                className="focus:bg-orange-600 focus:text-white text-xs cursor-pointer py-2 pl-4"
                                                            >
                                                                <span className="font-semibold">{model.name}</span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ));
                                            })()
                                        ) : (
                                            <div className="p-2 text-xs text-stone-500">No models available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        {msg.role === "assistant" ? (
                                            <>
                                                <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="bg-orange-950/30 border border-orange-500/10 rounded-2xl rounded-tl-none p-3 text-stone-300 text-xs leading-relaxed whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex-1 bg-white/10 rounded-2xl rounded-tr-none p-3 text-stone-200 text-xs leading-relaxed ml-8">
                                                    {msg.content}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center shrink-0 animate-pulse">
                                            <Sparkles className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="bg-orange-950/30 border border-orange-500/10 rounded-2xl rounded-tl-none p-3 text-stone-300 text-xs flex items-center">
                                            <Loader2 className="h-3 w-3 animate-spin mr-2" /> Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-orange-500/10 bg-black/20">
                                <div className="relative">
                                    <textarea
                                        className="w-full bg-black/40 border border-orange-500/20 rounded-xl p-3 pr-10 text-stone-200 text-xs focus:ring-1 focus:ring-orange-500 outline-none resize-none h-20 placeholder:text-stone-600"
                                        placeholder="Ask for help..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendChat();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={isChatLoading || !chatInput.trim()}
                                        className="absolute bottom-3 right-3 p-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                                    >
                                        <ArrowLeft className="h-3 w-3 rotate-90" />
                                    </button>
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>
            )}
            {/* Immersive Mode Styles - Force Hide Sidebars to escape layout constraints */}
            {!showSidebars && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                    #admin-dashboard-sidebar,
                    #landing-inner-sidebar-wrapper,
                    header.md\\:hidden {
                        display: none !important;
                    }
                `}} />
            )}
            <TemplateModal
                open={isTemplateModalOpen}
                onOpenChange={setIsTemplateModalOpen}
                onSelectTemplate={handleSelectTemplate}
            />
        </div>
    );

    return content;
}

const PropertiesPanel = () => {
    const { appState } = usePuck();
    const selectedItem = appState.ui.itemSelector ? appState.data.content.find(c => c.props.id === appState.ui.itemSelector) : null;
    const label = selectedItem ? (puckConfig.components[selectedItem.type as keyof typeof puckConfig.components]?.label || selectedItem.type) : "Page Properties";

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="w-full border-l border-white/10 bg-black/20">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5" style={{ flexShrink: 0 }}>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider truncate" title={label}>
                    {label}
                </h3>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
                <Puck.Fields />
            </div>
        </div>
    );
};
