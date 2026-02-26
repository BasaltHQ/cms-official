"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEditor } from "@/components/landing/EditorContext";
import { Button } from "@/components/ui/button";
import { Plus, LayoutTemplate, Search, Sparkles, Trash2, MoreVertical, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { createLandingPage } from "@/actions/cms/create-landing-page";
import { createLandingPageGenius } from "@/actions/cms/create-landing-page-genius";
import { DeletePageModal } from "@/components/modals/DeletePageModal";
import { AiAssistantModal } from "@/components/cms/AiAssistantModal";

interface PageItem {
    id: string;
    title: string;
    slug: string;
    isPublished?: boolean;
}

export function LandingPageSidebar({
    pages,
    locale,
    tenant
}: {
    pages: PageItem[],
    locale: string,
    tenant: string
}) {
    const pathname = usePathname();
    const { isAdvancedMode } = useEditor();
    const [searchQuery, setSearchQuery] = useState("");
    const [pageToDelete, setPageToDelete] = useState<PageItem | null>(null);
    const [isGeniusOpen, setIsGeniusOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // In Advanced Mode, we hide this sidebar to give full width to the JSON editor
    if (isAdvancedMode) return null;

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !["Footer Components", "Documentation", "Careers", "Blog Home", "About Us"].includes(p.title)
    );

    const handleGeniusGenerate = async (topic: string) => {
        setIsGenerating(true);
        // Server action will redirect
        await createLandingPageGenius(locale, topic);
    };

    return (
        <div className="w-64 border-r border-white/10 flex flex-col h-full glass rounded-none border-y-0 border-l-0">
            {/* Using global 'glass' utility as requested, consistent with other sidebars */}
            <div className="p-4 border-b border-white/10 space-y-4">
                <Link href={`/${locale}/cms/${tenant}/landing`} className="group">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                        <LayoutTemplate className="h-5 w-5 text-emerald-500" />
                        Landing Pages
                    </h2>
                </Link>

                {/* Genius Mode Button (Primary Call to Action) */}
                <Button
                    variant="outline"
                    onClick={() => setIsGeniusOpen(true)}
                    className="w-full justify-start gap-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Sparkles className="h-4 w-4" />
                    Genius Mode
                </Button>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/5 border-white/5 text-xs focus:ring-emerald-500/50 text-neutral-300 placeholder:text-neutral-600"
                    />
                </div>

                <form action={createLandingPage.bind(null, locale)}>
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/20" type="submit">
                        <Plus className="mr-2 h-4 w-4" /> New Page
                    </Button>
                </form>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredPages.length > 0 ? (
                        filteredPages.map((page) => {
                            const isActive = pathname.includes(page.id);
                            return (
                                <div key={page.id} className="group/item relative flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className={cn(
                                            "w-full justify-start text-neutral-400 hover:text-white hover:bg-white/5 relative pr-9",
                                            isActive && "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20"
                                        )}
                                    >
                                        <Link href={`/${locale}/cms/${tenant}/landing/${page.id}`} className="flex items-center justify-between w-full">
                                            <span className="truncate pr-2">{page.title || "Untitled Page"}</span>
                                        </Link>
                                    </Button>

                                    {/* Delete Button (Visible on Hover) */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPageToDelete(page);
                                        }}
                                        className="absolute right-2 opacity-0 group-hover/item:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-neutral-500 hover:text-red-500 transition-all"
                                        title="Delete Page"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-xs text-neutral-500">
                            No pages found.
                        </div>
                    )}
                </div>

            </ScrollArea>

            <DeletePageModal
                isOpen={!!pageToDelete}
                onClose={() => setPageToDelete(null)}
                pageId={pageToDelete?.id || ""}
                pageTitle={pageToDelete?.title || ""}
                locale={locale}
            />

            <AiAssistantModal
                isOpen={isGeniusOpen}
                onClose={() => setIsGeniusOpen(false)}
                mode="create"
                type="landing"
                isGenerating={isGenerating}
                onGenerate={handleGeniusGenerate}
            />
        </div>
    );
}
