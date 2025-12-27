"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Image as ImageIcon, Loader2, Check, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaItem {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
    const [activeTab, setActiveTab] = useState("library");
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === "library") {
            fetchMedia();
        }
    }, [isOpen, activeTab, search]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/media?search=${search}&limit=50&scope=all`);
            const data = await res.json();
            setMediaItems(data.items || []);
        } catch (error) {
            console.error("Failed to fetch media", error);
            toast.error("Failed to load media library");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading("Uploading image...");

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;

                const res = await fetch("/api/media", {
                    method: "POST",
                    body: JSON.stringify({
                        url: base64,
                        filename: file.name,
                        mimeType: file.type,
                        size: file.size,
                        title: "Uploaded via Picker",
                        isPublic: true
                    }),
                });

                if (!res.ok) throw new Error("Upload failed");

                const data = await res.json();
                toast.success("Image uploaded successfully!", { id: loadingToast });
                onSelect(data.url);
                onClose();
            };
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Failed to upload image", { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] border-white/10 bg-[#0F1115] text-white p-0 gap-0 overflow-hidden shadow-2xl">
                <div className="p-6 bg-gradient-to-b from-indigo-500/10 to-transparent border-b border-white/5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ImageIcon className="h-5 w-5 text-indigo-400" />
                            Select Media
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Choose an image from your library or upload a new one.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-[500px] flex flex-col">
                    <div className="px-6 border-b border-white/5 bg-black/20">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            <TabsTrigger
                                value="library"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-0 py-4 text-slate-400 hover:text-white transition-colors"
                            >
                                CMS Library
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none px-0 py-4 text-slate-400 hover:text-white transition-colors"
                            >
                                Upload New
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="library" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-black/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search filename..."
                                    className="pl-9 bg-[#1A1D24] border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : mediaItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                    <p>No media found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {mediaItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onSelect(item.url);
                                                onClose();
                                            }}
                                            className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 bg-black/20 hover:border-indigo-500/50 hover:ring-1 hover:ring-indigo-500/50 transition-all"
                                        >
                                            <div className="w-full h-full relative">
                                                <img
                                                    src={item.url}
                                                    alt={item.filename}
                                                    className="absolute inset-0 w-full h-full object-contain p-1 bg-black/40 group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Check className="h-8 w-8 text-white drop-shadow-md" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                <p className="text-xs text-white truncate px-1">{item.filename}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 p-0 m-0 flex items-center justify-center bg-transparent">
                        <div className="text-center p-8 max-w-sm border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition-all cursor-pointer group" onClick={() => document.getElementById('modal-upload-input')?.click()}>
                            <input
                                id="modal-upload-input"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                {uploading ? <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" /> : <Upload className="h-8 w-8 text-indigo-400" />}
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">Click to Upload</h3>
                            <p className="text-sm text-slate-500">SVG, PNG, JPG or GIF (max 5MB)</p>
                            <Button variant="secondary" className="mt-6" disabled={uploading}>
                                Select File from Computer
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
