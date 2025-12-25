"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { createScheduledPost } from "@/actions/cms/scheduled-posts";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Loader2,
    Image as ImageIcon,
    X,
    Calendar as CalendarIcon,
    Sparkles,
    Check,
    ChevronDown
} from "lucide-react";
import {
    FaXTwitter,
    FaLinkedin,
    FaFacebook,
    FaInstagram,
    FaYoutube,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "@/components/cms/MediaPickerModal";
import { format } from "date-fns";

// Platforms
const PLATFORMS = [
    { id: "x", name: "X (Twitter)", icon: FaXTwitter, color: "hover:text-white" },
    { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "hover:text-blue-500" },
    { id: "facebook", name: "Facebook", icon: FaFacebook, color: "hover:text-blue-600" },
    { id: "instagram", name: "Instagram", icon: FaInstagram, color: "hover:text-pink-500" },
    { id: "youtube", name: "YouTube", icon: FaYoutube, color: "hover:text-red-500" },
    { id: "web3", name: "Web3 (Base/Farcaster)", icon: null, color: "hover:text-violet-400" }, // Custom Icon logic
];

interface UniversalPostEditorProps {
    onPostSuccess?: () => void;
}

export function UniversalPostEditor({ onPostSuccess }: UniversalPostEditorProps) {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    // Platform Selection (Default to Web3)
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["web3"]);

    // Media & Scheduling
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // AI State
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Preview
    const [previewPlatform, setPreviewPlatform] = useState("web3");

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => {
            const next = prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id];

            // Update preview if the current previewed platform is deselected
            if (prev.includes(id) && previewPlatform === id) {
                setPreviewPlatform(next[0] || "web3");
            } else if (!prev.includes(id) && next.length === 1) {
                setPreviewPlatform(id);
            }
            return next;
        });
    };

    const handleMediaSelect = (url: string) => {
        if (attachments.length >= 4) {
            toast.error("Max 4 attachments allowed");
            return;
        }
        setAttachments([...attachments, url]);
        setMediaPickerOpen(false);
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    // --- AI FUNCTIONS ---
    const handleAiEnhance = async () => {
        if (!content) return toast.error("Write something first for Nano Banana to enhance!");

        setIsAiGenerating(true);
        toast.message("Nano Banana is thinking...", { description: "Enhancing your post for engagement." });

        // Mock AI Delay
        await new Promise(r => setTimeout(r, 1500));

        const enhancedVersions = [
            content + " 🚀 #Growth #Tech",
            "✨ " + content + "\n\nDesigned for the future.",
            "🔥 Hot take: " + content
        ];

        setContent(enhancedVersions[0]); // Just pick one for now
        setIsAiGenerating(false);
        toast.success("Post enhanced!");
    };

    const handleAiImage = async () => {
        setIsAiGenerating(true);
        toast.message("Nano Banana is painting...", { description: "Generating a visual for your post." });

        // Mock AI Delay
        await new Promise(r => setTimeout(r, 2500));

        // Mock specific image based on user request (placeholder)
        const mockImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop";
        setAttachments(prev => [...prev, mockImage]);

        setIsAiGenerating(false);
        toast.success("Image generated!");
    };

    const handlePost = async () => {
        if (!content && attachments.length === 0) {
            toast.error("Post cannot be empty");
            return;
        }

        if (selectedPlatforms.length === 0) {
            toast.error("Select at least one platform");
            return;
        }

        setIsPosting(true);

        try {
            if (scheduledDate) {
                // Save to database for scheduled post
                const result = await createScheduledPost({
                    content,
                    platforms: selectedPlatforms,
                    attachments,
                    scheduledFor: scheduledDate
                });

                if (result.success) {
                    toast.success(`Scheduled for ${format(scheduledDate, "PPP p")}`);
                    setContent("");
                    setAttachments([]);
                    setScheduledDate(undefined);
                    if (onPostSuccess) onPostSuccess();
                } else {
                    toast.error(result.error || "Failed to schedule post");
                }
            } else {
                // Immediate post (mock for now - platform APIs would be called here)
                await new Promise(r => setTimeout(r, 1500));
                toast.success(`Broadcast sent to ${selectedPlatforms.length} platforms!`);
                setContent("");
                setAttachments([]);
                if (onPostSuccess) onPostSuccess();
            }
        } catch (error) {
            toast.error("Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            {/* EDITOR COLUMN */}
            <div className="xl:col-span-7 flex flex-col h-full space-y-6">
                <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">

                    {/* Header & Platform Selector */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full inline-block" />
                                Universal Broadcast
                            </h2>

                            {/* Schedule Indicator */}
                            {scheduledDate && (
                                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/30 flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" />
                                    {format(scheduledDate, "MMM d, h:mm a")}
                                    <button onClick={() => setScheduledDate(undefined)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                        </div>

                        {/* Platform Toggles */}
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(p => {
                                const isSelected = selectedPlatforms.includes(p.id);
                                const Icon = p.icon;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlatform(p.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200",
                                            isSelected
                                                ? "bg-white/10 border-white/20 text-white shadow-lg shadow-white/5"
                                                : "bg-[#111] border-white/5 text-slate-500 hover:bg-white/5",
                                            isSelected && p.color
                                        )}
                                    >
                                        {Icon ? <Icon className="w-4 h-4" /> : <span className="text-lg leading-none">⚡️</span>}
                                        {p.name.split(" ")[0]}
                                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex flex-col min-h-[200px] border border-white/10 rounded-lg bg-black/20 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                        {/* Toolbar */}
                        <div className="flex items-center justify-end px-3 py-2 border-b border-white/5 bg-white/5 gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAiEnhance}
                                disabled={isAiGenerating}
                                className="h-7 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Enhance Text
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAiImage}
                                disabled={isAiGenerating}
                                className="h-7 text-xs text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 gap-1.5"
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Gen Image
                            </Button>
                        </div>

                        <Textarea
                            placeholder="What's on your mind? Write once, post everywhere..."
                            className="flex-1 bg-transparent border-none resize-none text-lg p-4 focus-visible:ring-0 placeholder:text-slate-600 min-h-[150px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {attachments.map((url, i) => (
                                <div key={i} className="relative aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 group">
                                    <Image src={url} alt="Attachment" fill className="object-cover" />
                                    <button
                                        onClick={() => removeAttachment(i)}
                                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMediaPickerOpen(true)}
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </Button>

                            {/* Schedule Popover */}
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className={cn("text-slate-400 hover:text-white hover:bg-white/10", scheduledDate && "text-blue-400")}>
                                        <CalendarIcon className="w-5 h-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-4 border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl rounded-2xl"
                                    align="start"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-white text-sm flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-blue-400" />
                                                Pick Date & Time
                                            </h4>
                                            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                                                <Calendar
                                                    mode="single"
                                                    selected={scheduledDate}
                                                    onSelect={setScheduledDate}
                                                    initialFocus
                                                    className="rounded-md"
                                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                    fromDate={new Date()}
                                                    toDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs text-slate-400 ml-1">Time</label>
                                                    <Input
                                                        type="time"
                                                        className="bg-white/5 border-white/10 text-white focus:border-blue-500 backdrop-blur-sm"
                                                        defaultValue="09:00"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            if (scheduledDate) {
                                                                const [hours, minutes] = e.target.value.split(':');
                                                                const newDate = new Date(scheduledDate);
                                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                                setScheduledDate(newDate);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {!scheduledDate && <p className="text-xs text-amber-500 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">Please select a date first.</p>}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2 border-t border-white/10">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setScheduledDate(undefined);
                                                    setCalendarOpen(false);
                                                }}
                                                className="flex-1 text-slate-400 hover:text-white hover:bg-white/10"
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setCalendarOpen(false)}
                                                disabled={!scheduledDate}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white gap-1.5"
                                            >
                                                <Check className="w-4 h-4" />
                                                Confirm
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={cn("text-xs font-mono", content.length > 280 ? "text-red-400" : "text-slate-500")}>
                                {content.length} chars
                            </span>

                            <Button
                                onClick={handlePost}
                                disabled={isPosting || (!content && attachments.length === 0)}
                                className="bg-white text-black hover:bg-slate-200 rounded-full px-6 font-bold"
                            >
                                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : scheduledDate ? "Schedule Post" : "Post Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW COLUMN */}
            <div className="xl:col-span-5 flex flex-col gap-4">

                {/* Preview Tabs */}
                <div className="flex gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
                    {selectedPlatforms.length === 0 && <span className="text-xs text-slate-500 p-2">Select a platform to preview</span>}
                    {selectedPlatforms.map(pid => {
                        const p = PLATFORMS.find(x => x.id === pid);
                        if (!p) return null;
                        return (
                            <button
                                key={pid}
                                onClick={() => setPreviewPlatform(pid)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                                    previewPlatform === pid ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {p.name}
                            </button>
                        );
                    })}
                </div>

                {/* The Preview Card */}
                <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center p-4 min-h-[400px]">
                    <PreviewCard
                        platform={previewPlatform}
                        content={content}
                        attachments={attachments}
                    />
                </div>
            </div>

            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
}

// --- SUB-COMPONENTS for Previews ---

function PreviewCard({ platform, content, attachments }: { platform: string, content: string, attachments: string[] }) {
    if (!platform) return <div className="text-slate-500">No platform selected</div>;

    const p = PLATFORMS.find(x => x.id === platform) || PLATFORMS[5]; // Default to Web3 if not found

    // Generic Wrapper Style
    return (
        <div className="w-full max-w-[400px] bg-white text-black rounded-sm overflow-hidden shadow-lg mx-auto">
            {/* Header Mockup */}
            <div className="p-3 flex items-center gap-2 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                    {/* Placeholder Avatar */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 to-gray-100" />
                </div>
                <div className="flex-1 leading-tight">
                    <div className="font-bold text-sm">Your Name</div>
                    <div className="text-xs text-gray-500">@{platform}_handle • now</div>
                </div>
                {p.icon && <p.icon className="text-gray-400" />}
            </div>

            {/* Content */}
            <div className="p-3 pb-2 text-[15px] whitespace-pre-wrap leading-snug">
                {content || <span className="text-gray-400 italic">Writing...</span>}
            </div>

            {/* Images */}
            {attachments.length > 0 && (
                <div className={cn("w-full bg-gray-100", attachments.length > 1 ? "grid grid-cols-2 gap-0.5" : "")}>
                    {attachments.map((url, i) => (
                        <div key={i} className="relative aspect-square">
                            <Image src={url} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Interaction Stats Mockup */}
            <div className="p-3 flex justify-between text-gray-400 text-sm border-t border-gray-50">
                <span>Like</span>
                <span>Comment</span>
                <span>Share</span>
            </div>
        </div>
    );
}
