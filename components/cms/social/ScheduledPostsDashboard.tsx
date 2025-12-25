"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    MoreVertical,
    Trash2,
    Edit2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
    getScheduledPosts,
    deleteScheduledPost,
    cancelScheduledPost,
    updateScheduledPost
} from "@/actions/cms/scheduled-posts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { PLATFORM_TO_PROVIDER_MAP } from "@/lib/social-utils";

// Re-using platform icons from UniversalPostEditor ideally, 
// but for simplicity importing icons here or using text badges.
import {
    FaXTwitter,
    FaLinkedin,
    FaFacebook,
    FaInstagram,
    FaYoutube,
} from "react-icons/fa6";

const PLATFORM_ICONS: Record<string, any> = {
    x: FaXTwitter,
    linkedin: FaLinkedin,
    facebook: FaFacebook,
    instagram: FaInstagram,
    youtube: FaYoutube,
    web3: () => <span className="font-bold text-xs">WEB3</span>
};

interface ScheduledPost {
    id: string;
    content: string;
    platforms: string[];
    attachments: string[];
    scheduledFor: Date;
    status: "PENDING" | "PUBLISHED" | "FAILED" | "CANCELLED";
    errorMessage?: string;
}

export function ScheduledPostsDashboard() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editPost, setEditPost] = useState<ScheduledPost | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch Posts
    const loadPosts = async () => {
        setIsLoading(true);
        const res = await getScheduledPosts();
        if (res.success && res.posts) {
            // @ts-ignore - Date conversion from server
            setPosts(res.posts);
        } else {
            toast.error("Failed to load scheduled posts");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this scheduled post?")) return;

        const res = await deleteScheduledPost(id);
        if (res.success) {
            toast.success("Post deleted");
            setPosts(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error("Failed to delete post");
        }
    };

    const handleSaveEdit = async () => {
        if (!editPost) return;

        setIsEditing(true);
        const res = await updateScheduledPost(editPost.id, {
            content: editPost.content,
            scheduledFor: editPost.scheduledFor,
            // We could add platform editing here too if needed
        });

        if (res.success) {
            toast.success("Post updated");
            setEditPost(null);
            loadPosts(); // Reload to get fresh data
        } else {
            toast.error("Failed to update post");
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500 bg-[#0A0A0B] border border-white/5 rounded-2xl">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-2">No Scheduled Posts</h3>
                <p>Create a post in the Broadcast Studio and schedule it for later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">Scheduled Posts</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => {
                    const postDate = new Date(post.scheduledFor);
                    const isPast = postDate < new Date();

                    return (
                        <div key={post.id} className="bg-[#0A0A0B] border border-white/10 rounded-xl p-5 shadow-lg group hover:border-white/20 transition-all flex flex-col h-full">
                            {/* Header: Date & Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-white font-medium">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {format(postDate, "MMM d, yyyy")}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(postDate, "h:mm a")}
                                    </div>
                                </div>

                                <Badge status={post.status} />
                            </div>

                            {/* Content Preview */}
                            <div className="flex-1 mb-4">
                                <p className="text-slate-300 text-sm line-clamp-3 mb-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                    {post.content}
                                </p>

                                {post.attachments.length > 0 && (
                                    <div className="flex gap-2 overflow-hidden">
                                        {post.attachments.map((url, i) => (
                                            <div key={i} className="relative w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                                                <Image src={url} alt="media" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer: Platforms & Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex -space-x-2">
                                    {post.platforms.map((p, i) => {
                                        const Icon = PLATFORM_ICONS[p];
                                        return (
                                            <div key={i} className="w-8 h-8 rounded-full bg-[#1A1B1E] border border-[#0A0A0B] flex items-center justify-center text-slate-400 relative z-[1]" style={{ zIndex: 10 - i }}>
                                                {Icon ? <Icon className="w-4 h-4" /> : <span className="text-[10px]">{p.slice(0, 1).toUpperCase()}</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[#1A1B1E] border-white/10 text-slate-300">
                                        <DropdownMenuItem onClick={() => setEditPost(post)} className="cursor-pointer hover:bg-white/5 hover:text-white focus:bg-white/5">
                                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(post.id)} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={!!editPost} onOpenChange={(open) => !open && setEditPost(null)}>
                <DialogContent className="bg-[#1A1B1E] border-white/10 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Action</DialogTitle>
                    </DialogHeader>

                    {editPost && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Content</label>
                                <Textarea
                                    className="bg-black/20 border-white/10 min-h-[120px]"
                                    value={editPost.content}
                                    onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Scheduled Time</label>
                                <Input
                                    type="datetime-local"
                                    className="bg-black/20 border-white/10"
                                    value={format(new Date(editPost.scheduledFor), "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => setEditPost({ ...editPost, scheduledFor: new Date(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditPost(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={isEditing}>
                            {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Badge({ status }: { status: ScheduledPost["status"] }) {
    const styles = {
        PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        PUBLISHED: "bg-green-500/10 text-green-500 border-green-500/20",
        FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
        CANCELLED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    };

    const icons = {
        PENDING: Clock,
        PUBLISHED: CheckCircle2,
        FAILED: AlertCircle,
        CANCELLED: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
            <Icon className="w-3 h-3" />
            {status}
        </div>
    );
}
