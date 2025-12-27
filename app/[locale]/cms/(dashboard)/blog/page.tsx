"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Edit, Save, X, Sparkles, Image as ImageIcon, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "../_components/MarkdownEditor";
import { generateBlogPost } from "@/actions/cms/generate-blog-post";
import { generateNanoBananaImage } from "@/actions/cms/generate-nano-banana-image";
import { publishToSocial } from "@/actions/cms/publish-social";
import { reviseContent } from "@/actions/cms/revise-content";
import { NanoBananaImageModal } from "@/components/cms/NanoBananaImageModal";
import { AiAssistantModal } from "@/components/cms/AiAssistantModal";

import { cn } from "@/lib/utils";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    coverImage: string;
    author?: string;
    publishedAt: string;
}

import { Suspense } from "react";

function BlogAdminContent() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [saving, setSaving] = useState(false);
    const [shareToTwitter, setShareToTwitter] = useState(false);

    // AI Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAiPrompt, setShowAiPrompt] = useState(false);
    const [aiMode, setAiMode] = useState<"create" | "revise">("create");
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaItems, setMediaItems] = useState<any[]>([]); // Simple cache for picker

    // Nano Banana State
    const [showNanoBanana, setShowNanoBanana] = useState(false);
    const [nanoBananaPrompt, setNanoBananaPrompt] = useState("");
    const [targetPostId, setTargetPostId] = useState<string | null>(null);

    const fetchMediaForPicker = async () => {
        try {
            const res = await fetch("/api/media?limit=50&scope=all");
            const data = await res.json();
            setMediaItems(data.items || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (showMediaPicker) {
            fetchMediaForPicker();
        }
    }, [showMediaPicker]);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        fetchPosts();
    }, []);

    // Deep Linking: Sync URL with Editing State
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const editId = searchParams.get("edit");
            if (editId) {
                const targetPost = posts.find(p => p.id === editId);
                // Only set if not already editing or different
                if (targetPost && editingPost?.id !== targetPost.id) {
                    setEditingPost(targetPost);
                }
            } else if (!editId && editingPost?.id) {
                // If param removed but state implies editing? 
                // No, usually state drives URL or vice versa. 
                // Let's make URL drive State initially, and State drive URL subsequently?
                // Actually easier: When setEditingPost is called, we update URL.
            }
        }
    }, [loading, posts, searchParams]);

    // Update URL when editing state changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (editingPost?.id) {
            params.set("edit", editingPost.id);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        } else {
            if (params.has("edit")) {
                params.delete("edit");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }
    }, [editingPost, pathname]); // Intentionally not including searchParams/router to avoid cycles if possible, though router should be stable.

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/blog");
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            toast.error("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingPost?.title || !editingPost?.slug) {
            toast.error("Title and Slug are required");
            return;
        }

        try {
            setSaving(true);
            const method = editingPost.id ? "PUT" : "POST";
            const res = await fetch("/api/blog", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingPost),
            });

            if (!res.ok) throw new Error("Failed to save");

            if (shareToTwitter && editingPost.title) {
                await publishToSocial("twitter", editingPost.title, editingPost.slug ? `${window.location.origin}/blog/${editingPost.slug}` : "");
                toast.success("Posted to X (Twitter)!");
            }

            toast.success("Post saved successfully");
            setEditingPost(null);
            setShareToTwitter(false);
            fetchPosts();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Post deleted");
            fetchPosts();
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleAiGenerate = async (topic: string) => {
        try {
            setIsGenerating(true);

            const generatedData = await generateBlogPost(topic);

            setEditingPost(prev => ({
                ...prev,
                title: generatedData.title,
                slug: generatedData.slug,
                excerpt: generatedData.excerpt,
                category: generatedData.category,
                content: generatedData.content,
            }));

            toast.success("Blog post generated successfully!");
            setShowAiPrompt(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiRevise = async (instruction: string) => {
        if (!editingPost?.content) {
            toast.error("No content to revise");
            return;
        }

        try {
            setIsGenerating(true);
            const revisedContent = await reviseContent(editingPost.content, instruction, "blog");

            setEditingPost(prev => ({
                ...prev,
                content: revisedContent
            }));

            toast.success("Content revised successfully!");
            setShowAiPrompt(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to revise content.");
        } finally {
            setIsGenerating(false);
        }
    };

    const openAiModal = (mode: "create" | "revise") => {
        setAiMode(mode);
        setShowAiPrompt(true);
    };

    // Nano Banana Handlers
    const handleImageSelect = (url: string) => {
        if (targetPostId) {
            // Updating from dashboard list
            setPosts(prev => prev.map(p => p.id === targetPostId ? { ...p, coverImage: url } : p));

            // Background save
            const post = posts.find(p => p.id === targetPostId);
            if (post) {
                fetch("/api/blog", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...post, coverImage: url }),
                }).then(() => toast.success("Image updated!"));
            }
            setTargetPostId(null);
        } else if (editingPost) {
            // Updating from editor
            setEditingPost(prev => ({ ...prev!, coverImage: url }));
        }
    };

    const openNanoBanana = (prompt: string, postId?: string) => {
        setNanoBananaPrompt(prompt);
        setTargetPostId(postId || null);
        setShowNanoBanana(true);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (editingPost) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 relative">
                <NanoBananaImageModal
                    isOpen={showNanoBanana}
                    onClose={() => setShowNanoBanana(false)}
                    initialPrompt={nanoBananaPrompt}
                    onImageSelect={handleImageSelect}
                />

                {/* AI Assistant Modal */}
                <AiAssistantModal
                    isOpen={showAiPrompt}
                    onClose={() => setShowAiPrompt(false)}
                    mode={aiMode}
                    type="blog"
                    isGenerating={isGenerating}
                    onGenerate={handleAiGenerate}
                    onRevise={handleAiRevise}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">{editingPost.id ? "Edit Post" : "New Post"}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* ... buttons ... */}
                        <button
                            onClick={() => openAiModal("create")}
                            className="px-3 py-2 md:px-4 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 text-xs md:text-sm"
                        >
                            <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Create AI</span><span className="sm:hidden">Create</span>
                        </button>
                        <button
                            onClick={() => openAiModal("revise")}
                            className="px-3 py-2 md:px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 text-xs md:text-sm"
                        >
                            <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Revise AI</span><span className="sm:hidden">Revise</span>
                        </button>
                        <button onClick={() => setEditingPost(null)} className="px-3 py-2 md:px-4 border rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-xs md:text-sm">Cancel</button>
                        <Button onClick={handleSave} disabled={saving} variant="gradient" className="px-3 py-2 md:px-4 flex items-center gap-2 text-xs md:text-sm">
                            {saving && <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />} Save
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ... Title, Slug, Category ... */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                            value={editingPost.title || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                            value={editingPost.slug || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                            value={editingPost.category || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cover Image URL</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                                value={editingPost.coverImage || ""}
                                onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                            />
                            <button
                                onClick={() => openNanoBanana(editingPost.title || "Beautiful blog post cover image")}
                                className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 rounded hover:bg-yellow-500/20 transition-colors flex items-center gap-2"
                                title="Generate with Nano Banana"
                            >
                                <Sparkles className="h-4 w-4" /> Generate
                            </button>
                            <button
                                onClick={() => setShowMediaPicker(true)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-slate-300 transition-colors"
                                title="Select from Media Library"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {/* ... Author, Share to Twitter, Publish Date ... */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Author</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                            value={editingPost.author || ""}
                            onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="shareToTwitter"
                                className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50"
                                checked={shareToTwitter}
                                onChange={(e) => setShareToTwitter(e.target.checked)}
                            />
                            <label htmlFor="shareToTwitter" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                <Share2 className="h-4 w-4 text-sky-400" />
                                Post to X (Twitter)
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">
                            Updates will be posted to the connected X account.
                        </p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-white/10 mt-auto">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Publish Settings</label>
                            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="schedulePost"
                                className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50"
                                checked={!!editingPost.publishedAt && new Date(editingPost.publishedAt) > new Date()}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Set to next hour as default future time
                                        const now = new Date();
                                        now.setHours(now.getHours() + 1);
                                        now.setMinutes(0);
                                        setEditingPost({ ...editingPost, publishedAt: now.toISOString() });
                                    } else {
                                        // Reset to now (or undefined to mean 'publish immediately' logic if handled by backend, but here we just set to now for current published state)
                                        setEditingPost({ ...editingPost, publishedAt: new Date().toISOString() });
                                    }
                                }}
                            />
                            <label htmlFor="schedulePost" className="text-sm font-medium flex items-center gap-2 cursor-pointer text-slate-300">
                                Schedule Post
                            </label>
                        </div>

                        {(!!editingPost.publishedAt && new Date(editingPost.publishedAt) > new Date()) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="text-xs text-slate-500 mb-1 block">Scheduled Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors"
                                    value={editingPost.publishedAt ? new Date(editingPost.publishedAt).toLocaleString('sv').slice(0, 16).replace(' ', 'T') : ""}
                                    onChange={(e) => setEditingPost({ ...editingPost, publishedAt: new Date(e.target.value).toISOString() })}
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Standard PST (or local detected) will apply.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Excerpt</label>
                    <textarea
                        className="w-full p-2 border rounded bg-black/50 border-white/10 text-slate-200 placeholder:text-slate-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors h-20"
                        value={editingPost.excerpt || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Content (Markdown)</label>
                    <MarkdownEditor
                        value={editingPost.content || ""}
                        onChange={(val) => setEditingPost({ ...editingPost, content: val })}
                        className="min-h-[400px]"
                    />
                </div>


                {/* Simple Media Picker Modal */}
                {
                    showMediaPicker && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-[#0A0A0B] backdrop-blur-2xl border border-white/10 rounded-xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl">
                                <div className="flex items-center justify-between p-4 border-b border-white/10">
                                    <h3 className="text-lg font-bold text-white">Select Media</h3>
                                    <button onClick={() => setShowMediaPicker(false)} className="p-1 hover:bg-white/10 rounded">
                                        <X className="h-5 w-5 text-slate-400" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {mediaItems.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => {
                                                    setEditingPost(prev => ({ ...prev!, coverImage: item.url }));
                                                    setShowMediaPicker(false);
                                                }}
                                                className="aspect-square relative group cursor-pointer border border-white/5 rounded-lg overflow-hidden hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20"
                                            >
                                                <NextImage src={item.url} alt={item.filename} fill className="object-contain bg-black" unoptimized />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-medium bg-blue-600 px-2 py-1 rounded">Select</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            <NanoBananaImageModal
                isOpen={showNanoBanana}
                onClose={() => setShowNanoBanana(false)}
                initialPrompt={nanoBananaPrompt}
                onImageSelect={handleImageSelect}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-white/10 pb-1 mb-6">
                <button
                    className="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-white"
                >
                    All Posts
                </button>
                <a
                    href="/en/cms/blog/categories"
                    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                >
                    Categories
                </a>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Blog Management</h1>
                <Button
                    onClick={() => setEditingPost({})}
                    variant="gradient"
                    className="px-4 py-2 rounded-md flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> New Post
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-lg p-6 space-y-4 hover:border-blue-500 transition-colors shadow-lg group relative overflow-hidden">

                        {/* Image Preview / Generation Trigger */}
                        <div
                            className="aspect-video w-full bg-black rounded-md overflow-hidden relative cursor-pointer border border-white/5 group-hover:border-blue-500/50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                openNanoBanana(post.title || "Blog post cover", post.id);
                            }}
                            title="Click to Generate/Reprompt Image"
                        >
                            {post.coverImage ? (
                                <>
                                    <NextImage src={post.coverImage} alt={post.title} fill className="object-contain bg-black" unoptimized />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Sparkles className="h-4 w-4 text-yellow-400" />
                                            <span>Reprompt Image</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 hover:text-slate-300 transition-colors bg-white/5">
                                    <Sparkles className="h-8 w-8 opacity-20" />
                                    <span className="text-xs font-medium">Generate Image</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">
                                    {post.category || "Uncategorized"}
                                </span>
                                <h3 className="text-xl font-bold mt-2 line-clamp-2">{post.title}</h3>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingPost(post)} className="p-1 hover:bg-white/10 rounded">
                                    <Edit className="h-4 w-4 text-slate-400 hover:text-white" />
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="p-1 hover:bg-white/10 rounded">
                                    <Trash className="h-4 w-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-3">{post.excerpt}</p>
                        <div className="text-xs text-slate-500">
                            {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BlogAdminPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <BlogAdminContent />
        </Suspense>
    );
}
