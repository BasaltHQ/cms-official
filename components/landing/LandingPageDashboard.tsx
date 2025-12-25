"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, LayoutTemplate, Sparkles, Clock, Globe, FileText, ArrowRight } from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { createLandingPage } from "@/actions/cms/create-landing-page";
import { AiWizard } from "@/components/landing/AiWizard";
import { WordPressPageSelectorModal } from "@/components/landing/WordPressPageSelectorModal";

interface LandingPageDashboardProps {
    stats: {
        total: number;
        published: number;
        drafts: number;
    };
    recentPages: {
        id: string;
        title: string;
        updatedAt: Date;
        isPublished: boolean;
    }[];
    locale: string;
}

export function LandingPageDashboard({ stats, recentPages, locale }: LandingPageDashboardProps) {
    const [wpModalOpen, setWpModalOpen] = useState(false);

    return (
        <>
            <WordPressPageSelectorModal open={wpModalOpen} onOpenChange={setWpModalOpen} locale={locale} />
            <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Landing Pages</h1>
                        <p className="text-neutral-400 text-lg">Manage your marketing pages and campaigns.</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Genius Mode Trigger */}
                        <div className="backdrop-blur-sm">
                            <AiWizard trigger={
                                <Button variant="outline" className="border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/40 transition-all">
                                    <Sparkles className="mr-2 h-4 w-4" /> Genius Mode
                                </Button>
                            } />
                        </div>
                        <form action={createLandingPage.bind(null, locale)}>
                            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border-t border-white/10">
                                <Plus className="mr-2 h-4 w-4" /> Create New Page
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/90 via-black to-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                <LayoutTemplate className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Total Pages</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/90 via-black to-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <Globe className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Published Live</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.published}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/90 via-black to-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">Drafts</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.drafts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-500" />
                        Recently Updated
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        {recentPages.length > 0 ? (
                            recentPages.map((page) => (
                                <Link
                                    key={page.id}
                                    href={`/${locale}/cms/landing/${page.id}`}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-neutral-900/80 to-black/80 border border-white/10 hover:from-neutral-800 hover:to-black hover:border-emerald-500/30 transition-all shadow-lg backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-inner ${page.isPublished ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-neutral-400 border-white/5'}`}>
                                            {page.title.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg group-hover:text-emerald-400 transition-colors">{page.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                                {page.isPublished ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" /> Live</span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-neutral-600" /> Draft</span>
                                                )}
                                                <span className="text-neutral-700">|</span>
                                                <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full text-neutral-500 group-hover:text-white group-hover:bg-white/5 transition-all transform group-hover:translate-x-1">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 text-neutral-500 bg-gradient-to-br from-neutral-900/50 to-black/50 rounded-xl border border-white/5 border-dashed backdrop-blur-sm">
                                No recent activity found. Create your first page!
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions (Large Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                    <form action={createLandingPage.bind(null, locale)} className="h-full">
                        <button type="submit" className="w-full h-full p-8 text-left rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/10 hover:border-emerald-500/30 hover:shadow-emerald-900/10 transition-all group shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="p-4 w-fit rounded-2xl bg-emerald-600 text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/20">
                                    <Plus className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Create Blank Page</h3>
                                <p className="text-neutral-400">Start from scratch with the visual builder.</p>
                            </div>
                        </button>
                    </form>

                    <Link href={`/${locale}/cms/landing/templates`} className="h-full">
                        <div className="w-full h-full p-8 text-left rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/10 hover:border-purple-500/30 hover:shadow-purple-900/10 transition-all group shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="p-4 w-fit rounded-2xl bg-purple-600 text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
                                    <LayoutTemplate className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Browse Templates</h3>
                                <p className="text-neutral-400">Choose from 20+ professional designs.</p>
                            </div>
                        </div>
                    </Link>

                    <AiWizard trigger={
                        <button className="w-full relative overflow-hidden h-full p-8 text-left rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/10 hover:border-indigo-500/30 hover:shadow-indigo-900/10 transition-all group shadow-2xl backdrop-blur-xl">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10">
                                <div className="p-4 w-fit rounded-2xl bg-indigo-600 text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/20">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Genius Mode AI</h3>
                                <p className="text-neutral-400">Generate entire sites with one prompt.</p>
                            </div>
                        </button>
                    } />
                    <button onClick={() => setWpModalOpen(true)} className="w-full h-full p-8 text-left rounded-3xl bg-gradient-to-br from-neutral-900 via-black to-neutral-900 border border-white/10 hover:border-blue-500/30 hover:shadow-blue-900/10 transition-all group shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="p-4 w-fit rounded-2xl bg-blue-600 text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/20">
                                <SiWordpress className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">WordPress Site</h3>
                            <p className="text-neutral-400">Import and edit content from your connected site.</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
}
