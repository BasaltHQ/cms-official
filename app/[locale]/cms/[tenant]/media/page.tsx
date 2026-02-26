"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Loader2, Upload, Plus, Search, X, Image as ImageIcon, FileVideo, MoreVertical, Trash, Calendar, Type, Maximize2, Sparkles, Globe, Lock, Copy, LayoutTemplate, ScanLine, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateMediaSEO } from "@/actions/cms/generate-media-seo";
import { generateVendorFromMedia } from "@/app/actions/vcms/generate-vendor"; // Import server action
import { MediaPreview } from "@/components/cms/MediaPreview";
import { NanoBananaImageModal } from "@/components/cms/NanoBananaImageModal";
import { DeleteMediaModal } from "@/components/modals/DeleteMediaModal";
import { AddMediaLinkModal } from "@/components/modals/AddMediaLinkModal";
import { MediaAiModal } from "@/components/modals/MediaAiModal";
import { ScanCardModal } from "@/components/cms/ScanCardModal";


// Types based on our prisma schema
interface MediaItem {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    title?: string;
    caption?: string;
    altText?: string;
    description?: string;
    isPublic: boolean;
    createdAt: string;
    isBusinessCard?: boolean; // VCMS
    vendorId?: string; // VCMS
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab");

    // Initialize scope based on URL tab, default to "mine"
    const getInitialScope = () => {
        if (initialTab === "landing_pages") return "landing_pages";
        if (initialTab === "wordpress") return "wordpress";
        return "mine";
    };

    const [scope, setScope] = useState<"mine" | "public" | "landing_pages" | "wordpress">(getInitialScope() as any);
    const [landingPages, setLandingPages] = useState<any[]>([]);
    const [showNanoBanana, setShowNanoBanana] = useState(false);
    const [nanoBananaPrompt, setNanoBananaPrompt] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingVendor, setProcessingVendor] = useState(false); // UI state for vendor extraction
    const [scanModalOpen, setScanModalOpen] = useState(false); // Scan Modal State

    // Session for admin check
    const { data: session } = useSession();
    const isAdmin = session?.user?.isAdmin;

    const fetchLandingPagesList = useCallback(async () => {
        setLoading(true);
        try {
            const { getAllLandingPages } = await import("@/actions/cms/get-all-landing-pages");
            const res = await getAllLandingPages();
            if (res.success && res.pages) {
                setLandingPages(res.pages);
            }
        } catch (e) {
            toast.error("Failed to load landing pages");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMedia = useCallback(async () => {
        if (scope === "landing_pages") {
            return fetchLandingPagesList();
        }
        try {
            setLoading(true);
            const res = await fetch(`/api/media?search=${search}&scope=${scope}`);

            // Check if response is actually JSON
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Received non-JSON response:", text.substring(0, 500)); // Log first 500 chars
                throw new Error(`Invalid response (not JSON): ${res.status} ${res.statusText}`);
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            setMedia(data.items || []);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to load media");
        } finally {
            setLoading(false);
        }
    }, [search, scope, fetchLandingPagesList]);


    useEffect(() => {
        fetchMedia();
    }, [search, scope, fetchMedia]);

    // Handle File Drop & Mobile Upload
    const handleFiles = async (files: File[]) => {
        setUploading(true);

        for (const file of files) {
            let finalUrl = "";
            let mediaId = "";

            // Mock Upload for now (Limit to < 5MB for DB safe Base64)
            if (file.size < 5 * 1024 * 1024) {
                finalUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            } else {
                toast.warning(`File ${file.name} too large for demo storage.`);
                finalUrl = "https://via.placeholder.com/150?text=Large+File";
            }

            try {
                // Create Media Record
                const res = await fetch("/api/media", {
                    method: "POST",
                    body: JSON.stringify({
                        url: finalUrl,
                        filename: file.name,
                        mimeType: file.type,
                        size: file.size,
                        title: file.name,
                        isPublic: true,
                        // If we are in "Vendors" tab, flag it automatically
                        isBusinessCard: false
                    }),
                });

                const savedMedia = await res.json();
                mediaId = savedMedia.id;


            } catch (e) {
                console.error("Upload failed", e);
                toast.error(`Failed to save ${file.name}`);
            }
        }

        setUploading(false);
        fetchMedia();
        toast.success("Assets added");
    };

    const [initialScanFile, setInitialScanFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFiles(acceptedFiles);
    }, []);

    // Helper
    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    };

    // New Handler for Scan Modal
    const handleScanComplete = async (front: File, back: File | null) => {
        setUploading(true);
        try {
            // A. Front Upload
            const frontUrl = await readFileAsDataURL(front);
            const frontRes = await fetch("/api/media", {
                method: "POST",
                body: JSON.stringify({
                    url: frontUrl,
                    filename: "Front_" + front.name,
                    mimeType: front.type,
                    size: front.size,
                    title: "Business Card (Front)",
                    isPublic: false,
                    isBusinessCard: true
                }),
            });
            const frontData = await frontRes.json();

            // B. Generate Vendor
            setProcessingVendor(true);
            toast.info("Analyzing Front Side...");
            const vendorRes = await generateVendorFromMedia(frontData.id);
            setProcessingVendor(false);

            if (vendorRes.success) {
                toast.success("Vendor Created!");

                // C. Back Upload (Linked)
                if (back) {
                    const backUrl = await readFileAsDataURL(back);
                    await fetch("/api/media", {
                        method: "POST",
                        body: JSON.stringify({
                            url: backUrl,
                            filename: "Back_" + back.name,
                            mimeType: back.type,
                            size: back.size,
                            title: "Business Card (Back)",
                            isPublic: false,
                            isBusinessCard: true,
                            vendorId: (vendorRes as any).vendorId // Link to same vendor
                        }),
                    });
                    toast.success("Back side attached.");
                }
            } else {
                toast.error("Could not extract vendor info.");
            }

            fetchMedia();

        } catch (e) {
            console.error(e);
            toast.error("Scan processing failed");
            setUploading(false);
        }
        setUploading(false);
    }

    // Mobile Camera Handler
    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);

    // Initialize scope from URL handled by initial state
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "landing_pages" && scope !== "landing_pages") setScope("landing_pages");
    }, [searchParams]);

    const handleAddUrl = async (url: string) => {
        const isVideo = url.match(/\.(mp4|webm|mov)$/i) || url.includes("youtube");
        const mimeType = isVideo ? "video/mp4" : "image/jpeg";

        try {
            await fetch("/api/media", {
                method: "POST",
                body: JSON.stringify({
                    url,
                    filename: "External Link",
                    mimeType,
                    size: 0,
                    title: "External Asset",
                }),
            });
            fetchMedia();
            toast.success("External link added");
        } catch (e) {
            toast.error("Failed to add link");
            throw e;
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const updateMetadata = async (id: string, updates: Partial<MediaItem>) => {
        try {
            setMedia(media.map(m => m.id === id ? { ...m, ...updates } : m));
            if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, ...updates });

            await fetch("/api/media", {
                method: "PUT",
                body: JSON.stringify({ id, ...updates }),
            });
            toast.success("Saved");
        } catch (error) {
            toast.error("Failed to save");
            fetchMedia();
        }
    };

    const handleGenerateSEO = async () => {
        if (!selectedItem) return;
        setIsGenerating(true);
        try {
            const result = await generateMediaSEO(selectedItem.filename, selectedItem.description);
            await updateMetadata(selectedItem.id, {
                title: result.title,
                altText: result.altText,
                caption: result.caption,
                description: result.description,
            });
            toast.success("SEO Metadata Generated!");
        } catch (error) {
            toast.error("Failed to generate SEO");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyUrl = () => {
        if (!selectedItem?.url) return;
        navigator.clipboard.writeText(selectedItem.url);
        toast.success("URL Copied to clipboard");
    };

    const handleDelete = async (item: MediaItem) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/media?id=${itemToDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete asset");
            setMedia(media.filter(m => m.id !== itemToDelete.id));
            if (selectedItem?.id === itemToDelete.id) setSelectedItem(null);
            toast.success("Deleted");
            setDeleteModalOpen(false);
            setTimeout(() => { setItemToDelete(null); }, 300);
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Find related media (e.g. Back Side) for selected item
    const relatedMedia = selectedItem?.vendorId
        ? media.filter(m => m.vendorId === selectedItem.vendorId && m.id !== selectedItem.id)
        : [];

    return (
        <div className="flex h-full min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Content: Upload + Grid */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Media Library
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage all your images, videos, and assets.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        {/* Scope Toggle */}
                        <div className="flex bg-[#0A0A0B] border border-white/10 rounded-lg p-1">
                            <button onClick={() => setScope("mine")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", scope === "mine" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                My Files
                            </button>
                            <button onClick={() => setScope("public")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", scope === "public" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}>
                                <Globe className="h-3.5 w-3.5" /> Public
                            </button>
                            <button onClick={() => setScope("wordpress")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", scope === "wordpress" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}>
                                <ImageIcon className="h-3.5 w-3.5" /> WordPress
                            </button>
                            {/* Landing Pages - Admin Only */}
                            {isAdmin && (
                                <button onClick={() => setScope("landing_pages")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2", scope === "landing_pages" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}>
                                    <LayoutTemplate className="h-3.5 w-3.5" /> Pages
                                </button>
                            )}
                        </div>

                        <div className="hidden md:block h-6 w-px bg-white/10 mx-1" />

                        {/* View Toggle */}
                        <div className="flex bg-[#0A0A0B] border border-white/10 rounded-lg p-1">
                            <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")} title="Grid View">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                            </button>
                            <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")} title="List View">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
                            </button>
                        </div>

                        <Button onClick={() => setShowLinkModal(true)} variant="gradient" className="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Link</span>
                        </Button>
                        <button onClick={() => { setNanoBananaPrompt(""); setShowNanoBanana(true); }} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-yellow-500/20 whitespace-nowrap">
                            <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">AI Generate</span>
                        </button>

                        {/* DESKTOP SCAN BUTTON - Only visible when in Vendor mode */}
                        {/* Removed as vendor scope is removed */}
                        {/* {scope === "vendors" && (
                            <button
                                onClick={() => setScanModalOpen(true)}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap animate-pulse"
                            >
                                <ScanLine className="h-4 w-4" />
                                <span className="hidden sm:inline">Scan Card</span>
                                <span className="sm:hidden">Scan</span>
                            </button>
                        )} */}


                    </div>
                </div>

                <ScanCardModal
                    isOpen={scanModalOpen}
                    onClose={() => { setScanModalOpen(false); setInitialScanFile(null); }}
                    onScanComplete={handleScanComplete}
                    initialFile={initialScanFile}
                />
                <NanoBananaImageModal isOpen={showNanoBanana} onClose={() => setShowNanoBanana(false)} initialPrompt={nanoBananaPrompt} onImageSelect={(url) => { fetchMedia(); }} />
                <MediaAiModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} item={selectedItem} onUpdate={async (updates) => { if (selectedItem) await updateMetadata(selectedItem.id, updates); }} />
                <DeleteMediaModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} loading={isDeleting} item={itemToDelete} />
                <AddMediaLinkModal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} onConfirm={handleAddUrl} />

                {/* Search & Actions */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                </div>

                {/* Upload Zone */}
                <div {...getRootProps()} className={cn("border-2 border-dashed border-white/10 rounded-2xl p-8 mb-8 text-center transition-all cursor-pointer group", isDragActive ? "border-blue-500/50 bg-blue-500/5 text-blue-400" : "hover:border-white/20 hover:bg-white/5", uploading && "pointer-events-none opacity-50")}>
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Uploading assets...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-slate-400 group-hover:text-white" />
                            </div>
                            <p className="text-sm font-medium text-slate-300">
                                {isDragActive ? "Drop here" : "Drag & drop files or click to upload"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Media Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {scope === "landing_pages" ? (
                            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                                {landingPages.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map((page) => (
                                    <div key={page.id} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-[#0A0A0B] hover:border-blue-500/50 transition-all flex flex-col" onClick={() => window.open(`/cms/landing/${page.id}`, '_blank')}>
                                        <div className="flex-1 flex items-center justify-center bg-black/50 relative">
                                            {page.thumbnail ? <NextImage src={page.thumbnail} alt={page.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized /> : <LayoutTemplate className="h-10 w-10 text-slate-700" />}
                                        </div>
                                        <div className="p-3 bg-[#0A0A0B] border-t border-white/5 relative z-10">
                                            <p className="text-xs font-semibold text-white truncate">{page.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 flex justify-between">
                                                <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                                                <span className={page.isPublished ? "text-emerald-500" : "text-amber-500"}>{page.isPublished ? "Published" : "Draft"}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                                {media
                                    // STRICT FILTER: Check scope on client side too to avoid data leaks
                                    .map((item) => (
                                        <div key={item.id} onClick={() => setSelectedItem(item)} className={cn("group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all bg-[#0A0A0B]", selectedItem?.id === item.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10 z-10 scale-[1.02]" : "border-white/5 hover:border-white/20")}>
                                            <div className="w-full h-full flex items-center justify-center p-2">
                                                <MediaPreview url={item.url} alt={item.altText || item.filename} mimeType={item.mimeType} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs font-medium text-white truncate">{item.title || item.filename}</p>
                                                <p className="text-xs text-slate-400 max-w-[90%] truncate mt-0.5">{item.mimeType.split("/")[1]}</p>
                                            </div>
                                            {item.isBusinessCard && (
                                                <div className="absolute top-2 right-2 bg-emerald-500/90 text-white p-1 rounded-full shadow-lg">
                                                    <UserCheck className="h-3 w-3" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="bg-[#0A0A0B] border border-white/5 rounded-xl overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#0A0A0B] text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-white/5">Asset</th>
                                            <th className="px-4 py-3 border-b border-white/5">Type</th>
                                            <th className="px-4 py-3 border-b border-white/5">Size</th>
                                            <th className="px-4 py-3 border-b border-white/5">Uploaded</th>
                                            <th className="px-4 py-3 border-b border-white/5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {media
                                            // STRICT FILTER: Check scope on client side too
                                            .map((item) => (
                                                <tr key={item.id} onClick={() => setSelectedItem(item)} className={cn("cursor-pointer hover:bg-white/5 transition-colors", selectedItem?.id === item.id ? "bg-white/5" : "")}>
                                                    <td className="px-4 py-3 flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded bg-[#0A0A0B] flex-shrink-0 overflow-hidden border border-white/10">
                                                            {item.mimeType.startsWith("image/") ? <div className="relative h-full w-full"><NextImage src={item.url} alt={item.filename} fill className="object-contain bg-black/20" unoptimized /></div> : <div className="h-full w-full flex items-center justify-center"><Type className="h-5 w-5 text-slate-500" /></div>}
                                                        </div>
                                                        <span className="text-slate-200 font-medium truncate max-w-[200px]">{item.filename}</span>
                                                        {item.isBusinessCard && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">Vendor</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400 uppercase text-xs">{item.mimeType.split("/")[1]}</td>
                                                    <td className="px-4 py-3 text-slate-400 text-xs">{(item.size / 1024).toFixed(1)} KB</td>
                                                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="p-1 hover:text-red-400 text-slate-500"><Trash className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Editing Sidebar (Right Panel) */}
            {/* Editing Sidebar (Right Panel) */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 md:static md:z-auto md:w-80 flex justify-end md:block">
                    {/* Backdrop for mobile */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setSelectedItem(null)} />

                    <aside className="w-full sm:w-80 border-l border-white/10 bg-[#0A0A0B] h-full overflow-y-auto z-50 transition-all flex flex-col relative animate-in slide-in-from-right duration-300 md:animate-none shadow-2xl md:shadow-none">
                        <div className="p-6 space-y-6 flex-1">
                            <div className="flex items-start justify-between">
                                <h2 className="text-lg font-semibold text-white">Details</h2>
                                <button onClick={() => setSelectedItem(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors md:p-1 md:bg-transparent md:rounded-md"><X className="h-5 w-5 text-slate-400 md:h-4 md:w-4" /></button>
                            </div>
                            <div className="aspect-video rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center group relative">
                                {selectedItem.mimeType.startsWith("video/") || selectedItem.filename.endsWith(".webm") ? <video src={selectedItem.url} controls className="w-full h-full object-contain" /> : <NextImage src={selectedItem.url} alt="Preview" fill className="object-contain" unoptimized />}
                                <a href={selectedItem.url} target="_blank" className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur rounded hover:bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-all"><Maximize2 className="h-3.5 w-3.5" /></a>
                            </div>

                            {/* --- SHOW RELATED IMAGES (BACK SIDE) --- */}
                            {relatedMedia.length > 0 && (
                                <div className="bg-[#0A0A0B] rounded-lg p-3 border border-white/5">
                                    <p className="text-xs font-semibold text-slate-400 mb-2">Related Media</p>
                                    <div className="flex gap-2 bg-black p-2 rounded border border-white/5 overflow-x-auto">
                                        {relatedMedia.map(rm => (
                                            <div key={rm.id} onClick={() => setSelectedItem(rm)} className="h-16 w-16 relative rounded overflow-hidden border border-white/10 cursor-pointer hover:border-blue-500">
                                                <NextImage src={rm.url} alt="Back" fill className="object-cover" unoptimized />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* VCMS Specific Actions */}
                            {selectedItem.isBusinessCard ? (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-2 mb-2"><UserCheck className="h-3 w-3" /> Vendor ID</p>
                                    <p className="text-[10px] text-slate-400 font-mono break-all">{selectedItem.vendorId || "Processing..."}</p>
                                    <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs" onClick={() => window.open(`/cms/contacts`, '_blank')}>View Contact</Button>
                                </div>
                            ) : (
                                <button onClick={() => setShowAiModal(true)} className={cn("w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-purple-900/20", "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:shadow-purple-500/20 hover:scale-[1.02]")}>
                                    <Sparkles className="h-5 w-5" /> Improve Task with AI
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <button onClick={() => updateMetadata(selectedItem.id, { isPublic: !selectedItem.isPublic })} className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors border", selectedItem.isPublic ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20")}>
                                    {selectedItem.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} {selectedItem.isPublic ? "Public" : "Private"}
                                </button>
                                <button onClick={handleCopyUrl} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/10 text-xs font-medium"><Copy className="h-3.5 w-3.5" /> URL</button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5"><label className="text-xs font-medium text-slate-400 flex items-center gap-2"><Type className="h-3 w-3" /> Title</label><input value={selectedItem.title || ""} onChange={(e) => updateMetadata(selectedItem.id, { title: e.target.value })} className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50" placeholder="Media title..." /></div>
                                <div className="space-y-1.5"><label className="text-xs font-medium text-slate-400 flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Alt Text</label><input value={selectedItem.altText || ""} onChange={(e) => updateMetadata(selectedItem.id, { altText: e.target.value })} className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50" placeholder="Descriptive text..." /></div>
                                <div className="space-y-1.5"><label className="text-xs font-medium text-slate-400 flex items-center gap-2"><MoreVertical className="h-3 w-3" /> Caption</label><textarea value={selectedItem.caption || ""} onChange={(e) => updateMetadata(selectedItem.id, { caption: e.target.value })} className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[60px]" placeholder="Caption..." /></div>
                                <div className="space-y-1.5"><label className="text-xs font-medium text-slate-400">Description</label><textarea value={selectedItem.description || ""} onChange={(e) => updateMetadata(selectedItem.id, { description: e.target.value })} className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[80px]" placeholder="Internal notes..." /></div>
                            </div>
                            <div className="bg-[#0A0A0B] rounded-lg p-4 space-y-2 text-xs text-slate-400 border border-white/5">
                                <div className="flex justify-between"><span>Size</span><span className="text-slate-300">{(selectedItem.size / 1024).toFixed(1)} KB</span></div>
                                <div className="flex justify-between"><span>Date</span><span className="text-slate-300">{new Date(selectedItem.createdAt).toLocaleDateString()}</span></div>
                            </div>
                            <div className="pt-4 border-t border-white/10 text-center"><p className="text-[10px] text-slate-600">ID: {selectedItem.id}</p></div>
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <button onClick={() => handleDelete(selectedItem)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"><Trash className="h-4 w-4" /> Delete Asset</button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
