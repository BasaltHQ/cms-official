"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    Image as ImageIcon,
    Send,
    Hash,
    Repeat,
    MessageCircle,
    Heart,
    MoreHorizontal,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "@/components/cms/MediaPickerModal";

// Channel options
const CHANNELS = [
    { id: "base", name: "/base", icon: "https://warpcast.com/~/channel-images/base.png" },
    { id: "farcaster", name: "/farcaster", icon: "https://warpcast.com/~/channel-images/farcaster.png" },
    { id: "ethereum", name: "/ethereum", icon: "https://warpcast.com/~/channel-images/ethereum.png" },
    { id: "gnars", name: "/gnars", icon: "https://warpcast.com/~/channel-images/gnars.png" },
    { id: "degen", name: "/degen", icon: "https://warpcast.com/~/channel-images/degen.png" }
];

interface BasePostEditorProps {
    onPostSuccess?: () => void;
}

export function BasePostEditor({ onPostSuccess }: BasePostEditorProps) {
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);
    const [earningsEnabled, setEarningsEnabled] = useState(false);

    // Preview toggle
    const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

    const handlePost = async () => {
        if (!content && attachments.length === 0) {
            toast.error("Post cannot be empty");
            return;
        }

        setIsPosting(true);
        try {
            let finalContent = content;
            let finalEmbeds = [...attachments];

            // 1. If Earnings Enabled, Create Zora Mint first
            if (earningsEnabled) {
                // Use first attachment as mint image
                const mintImage = attachments[0];
                if (!mintImage) throw new Error("Earnings require at least 1 image attachment");

                toast.loading("Converting to Creator Post (Minting)...");
                const zoraRes = await fetch("/api/social/zora", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: `Cast by @${selectedChannel.name || "User"}`,
                        description: content.slice(0, 100) + "...",
                        image: mintImage
                    })
                });

                if (!zoraRes.ok) {
                    const errorData = await zoraRes.json();
                    throw new Error(errorData.message || "Failed to create mint");
                }

                const zoraData = await zoraRes.json();
                const mintUrl = zoraData.url;

                // Append URL to content
                finalContent = `${finalContent}\n\nCollect: ${mintUrl}`;
                toast.dismiss();
            }

            const res = await fetch("/api/social/base", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: finalContent,
                    embeds: finalEmbeds,
                    channelId: selectedChannel.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to post");

            toast.success("Broadcast sent successfully!");
            setContent("");
            setAttachments([]);
            if (onPostSuccess) onPostSuccess();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsPosting(false);
        }
    };

    const handleMediaSelect = (url: string) => {
        // MediaPicker sends one URL. We can append it.
        // If the modal supports multiple, we might adjust, but usually one by one or array.
        // Assuming single select based on previous usage, but let's just append.
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* EDITOR */}
            <div className="space-y-6 flex flex-col h-full">
                <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl p-6 flex-1 flex flex-col shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full inline-block" />
                            Compose Broadcast
                        </h2>

                        {/* Channel Selector */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-slate-200">
                                <span className="opacity-60"><Hash className="w-3 h-3" /></span>
                                {selectedChannel.name}
                            </button>
                            {/* Dropdown */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1B1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block z-50">
                                {CHANNELS.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => setSelectedChannel(channel)}
                                        className={cn(
                                            "w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center gap-2",
                                            selectedChannel.id === channel.id ? "text-blue-400 bg-blue-500/10" : "text-slate-400"
                                        )}
                                    >
                                        <Hash className="w-3 h-3 opacity-50" />
                                        {channel.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Textarea
                        placeholder="What's happening on Base?"
                        className="flex-1 bg-transparent border-0 resize-none text-lg p-0 focus-visible:ring-0 placeholder:text-slate-600 mb-4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* Attachments Area */}
                    {attachments.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {attachments.map((url, i) => (
                                <div key={i} className="relative aspect-square bg-black/40 rounded-xl overflow-hidden border border-white/10 group">
                                    <Image src={url} alt="Attachment" fill className="object-contain" />
                                    <button
                                        onClick={() => removeAttachment(i)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/90 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto shrink-0">
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMediaPickerOpen(true)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={cn("text-xs font-mono", content.length > 320 ? "text-red-400" : "text-slate-500")}>
                                {content.length}/320
                            </span>

                            <button
                                onClick={() => setEarningsEnabled(!earningsEnabled)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5",
                                    earningsEnabled
                                        ? "bg-purple-500/10 border-purple-500 text-purple-400"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <div className={cn("w-2 h-2 rounded-full", earningsEnabled ? "bg-purple-400" : "bg-slate-600")} />
                                Earn
                            </button>

                            <Button
                                onClick={handlePost}
                                disabled={isPosting || (!content && attachments.length === 0)}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 font-semibold"
                            >
                                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cast"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW */}
            <div className="bg-[#000] rounded-[2.5rem] border-[8px] border-[#1A1B1E] overflow-hidden shadow-2xl relative h-[600px] lg:h-auto max-w-sm mx-auto w-full lg:max-w-none lg:w-3/4 self-center flex flex-col">
                {/* Simulated Mobile Header */}
                <div className="bg-[#000] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800" />
                    <div className="font-bold text-white">Warpcast</div>
                    <div className="w-8" />
                </div>

                {/* Feed Item Preview */}
                <div className="p-4 flex gap-3 text-white">
                    <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold">You</span>
                            <span className="text-slate-500">@you</span>
                            <span className="text-slate-500 text-xs">• now</span>
                        </div>
                        <div className="whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">
                            {content || <span className="text-slate-600 italic">Preview your cast...</span>}
                        </div>

                        {attachments.length > 0 && (
                            <div className={cn(
                                "rounded-xl overflow-hidden border border-white/10 mb-3",
                                attachments.length === 1 ? "aspect-video" : "grid grid-cols-2 aspect-square"
                            )}>
                                {attachments.map(url => (
                                    <div key={url} className="relative w-full h-full min-h-[100px]">
                                        <Image src={url} alt="Embed" fill className="object-cover" unoptimized />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-slate-500 pr-4">
                            <MessageCircle className="w-4 h-4" />
                            <Repeat className="w-4 h-4" />
                            <Heart className="w-4 h-4" />
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Config Modal for Signer - Simplified placeholder if needed or assume handled in Settings */}

            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={(url) => handleMediaSelect(url)}
            />
        </div>
    );
}
