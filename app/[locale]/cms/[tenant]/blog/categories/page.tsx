"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tags, ArrowRight, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryStat {
    name: string;
    count: number;
    lastActive: string;
}

export default function BlogCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/blog"); // Fetch all posts to derive categories
            const posts = await res.json();

            // Derive categories from posts
            const catMap = new Map<string, { count: number, lastActive: string }>();

            posts.forEach((post: any) => {
                const cat = post.category || "Uncategorized";
                const current = catMap.get(cat) || { count: 0, lastActive: post.publishedAt };

                // Update count
                current.count++;

                // Keep most recent date
                if (new Date(post.publishedAt) > new Date(current.lastActive)) {
                    current.lastActive = post.publishedAt;
                }

                catMap.set(cat, current);
            });

            const derived = Array.from(catMap.entries()).map(([name, data]) => ({
                name,
                count: data.count,
                lastActive: data.lastActive
            })).sort((a, b) => b.count - a.count);

            setCategories(derived);
        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: string) => {
        toast.info("Bulk rename feature coming soon!");
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Blog Categories</h1>
                    <p className="text-slate-400">Manage and organize your content topics.</p>
                </div>
                {/* <Button variant="gradient" className="gap-2">
                    <Plus className="h-4 w-4" /> New Category
                </Button> */}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.name}
                            className="group bg-[#0A0A0B] border border-white/10 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    <Tags className="h-5 w-5" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(cat.name)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Last active: {new Date(cat.lastActive).toLocaleDateString()}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-2xl font-bold text-slate-200">
                                        {cat.count} <span className="text-sm font-normal text-slate-500">posts</span>
                                    </span>
                                    <Button
                                        variant="ghost"
                                        className="text-xs hover:bg-white/5"
                                        onClick={() => router.push(`/en/cms/blog?category=${encodeURIComponent(cat.name)}`)}
                                    >
                                        View Posts <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State if no categories */}
                    {categories.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <Tags className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No categories found. Start tagging your posts!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
