"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Edit, Download } from "lucide-react";

interface WordPressPageSelectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    locale: string;
}

interface WPPage {
    id: number;
    title: { rendered: string };
    status: string;
    date: string;
    link: string;
    importedId: string | null;
}

export function WordPressPageSelectorModal({ open, onOpenChange, locale }: WordPressPageSelectorModalProps) {
    const router = useRouter();
    const [pages, setPages] = useState<WPPage[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchPages();
        }
    }, [open]);

    const fetchPages = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/cms/apps/wordpress/content?type=pages");
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setPages(data.items || []);
            }
        } catch (e) {
            setError("Failed to fetch WordPress pages");
        } finally {
            setLoading(false);
        }
    };

    const handleImportAndEdit = async (page: WPPage) => {
        setImporting(page.id);
        try {
            const res = await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "pages", items: [page.id] })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Import failed");
            }

            // Refetch to get the new importedId
            const contentRes = await fetch("/api/cms/apps/wordpress/content?type=pages");
            const contentData = await contentRes.json();
            const updatedPage = contentData.items?.find((p: WPPage) => p.id === page.id);

            if (updatedPage?.importedId) {
                onOpenChange(false);
                router.refresh(); // Refresh to update sidebar/dashboard with the new page
                router.push(`/${locale}/cms/landing/${updatedPage.importedId}?mode=visual`);
            } else {
                throw new Error("Import succeeded but page ID not found");
            }
        } catch (e: any) {
            setError(e.message || "Import failed");
        } finally {
            setImporting(null);
        }
    };

    const handleEditInCMS = (importedId: string) => {
        onOpenChange(false);
        router.push(`/${locale}/cms/landing/${importedId}?mode=visual`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-[#0A0A0B] border border-white/10 text-white max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Select WordPress Page
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Choose a page to import and edit in the visual builder, then push changes back to WordPress.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400">
                            <p>{error}</p>
                            <Button onClick={fetchPages} variant="outline" size="sm" className="mt-4 border-white/10">
                                Retry
                            </Button>
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No pages found on your WordPress site.
                        </div>
                    ) : (
                        pages.map((page) => (
                            <div
                                key={page.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white truncate" dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className={page.status === 'publish' ? 'text-emerald-500' : 'text-amber-500'}>
                                            {page.status === 'publish' ? 'Published' : page.status}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(page.date).toLocaleDateString()}</span>
                                        <a href={page.link} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                                            View <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {page.importedId ? (
                                        <Button
                                            size="sm"
                                            onClick={() => handleEditInCMS(page.importedId!)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit in CMS
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => handleImportAndEdit(page)}
                                            disabled={importing === page.id}
                                            className="bg-blue-600 hover:bg-blue-500 text-white"
                                        >
                                            {importing === page.id ? (
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 mr-2" />
                                            )}
                                            {importing === page.id ? "Importing..." : "Import & Edit"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
