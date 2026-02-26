"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Image as ImageIcon, Settings, RefreshCw, ExternalLink } from "lucide-react";
import Image from "next/image";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function WordPressCommandCenter() {
    const [activeTab, setActiveTab] = useState("overview");
    const [pages, setPages] = useState<any[]>([]);
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [connectionData, setConnectionData] = useState<{ isConnected: boolean; url: string; counts?: { pages: number; posts: number; media: number } } | null>(null);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch Connection Status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/cms/apps/wordpress/status");
                if (res.ok) {
                    const data = await res.json();
                    setConnectionData(data);
                }
            } catch (error) {
                console.error("Failed to fetch connection status", error);
            }
        };
        fetchStatus();
    }, []);

    // Fetch Content
    const fetchContent = async (type: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/cms/apps/wordpress/content?type=${type}`);
            const data = await res.json();
            if (data.items) {
                if (type === 'media') setMedia(data.items);
                else setPages(data.items);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (type: "media" | "pages" | "posts", items: number[] | "all") => {
        setImporting(true);
        try {
            const res = await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, items }) // items can be "all" now
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Import failed");
            }
            const data = await res.json();

            setSuccessMessage(data.message);
            setSuccessModalOpen(true);

            // Refresh content after import
            if (type === 'pages' || type === 'posts') fetchContent('pages');
            if (type === 'media') fetchContent('media');
        } catch (error: any) {
            console.error(error);
            setSuccessMessage("Import failed: " + (error.message || "Unknown error"));
            setSuccessModalOpen(true);
        } finally {
            setImporting(false);
        }
    }

    const handleSyncAll = async () => {
        setImporting(true);
        try {
            // Sequential Import
            // 1. Pages
            await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "pages", items: "all" })
            });

            // 2. Posts 
            await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "posts", items: "all" })
            });

            // 3. Media
            await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "media", items: "all" })
            });

            setSuccessMessage("Full Site Sync Complete! Content and Media have been imported.");
            setSuccessModalOpen(true);

            fetchContent('pages');
            fetchContent('media');
        } catch (error: any) {
            console.error(error);
            setSuccessMessage("Sync All failed: " + (error.message || "Unknown error. Check connection settings."));
            setSuccessModalOpen(true);
        } finally {
            setImporting(false);
        }
    };


    const [importUrlModalOpen, setImportUrlModalOpen] = useState(false);
    const [manualUrl, setManualUrl] = useState("");

    const handleImportUrl = async () => {
        if (!manualUrl) return;
        setImporting(true);
        setImportUrlModalOpen(false); // Close modal immediately

        try {
            const res = await fetch("/api/cms/apps/wordpress/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "url", url: manualUrl })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Import failed");
            }

            const data = await res.json();
            setSuccessMessage(data.message || "Page imported successfully!");
            setSuccessModalOpen(true);
            setManualUrl("");
            fetchContent('pages');

        } catch (error: any) {
            console.error(error);
            setSuccessMessage("Import failed: " + error.message);
            setSuccessModalOpen(true);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        WordPress Command Center
                    </h1>
                    <p className="text-slate-400">
                        Manage your connected WordPress site, sync content, and import media directly into your CMS.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-white/10 text-slate-300 hover:text-white"
                        disabled={!connectionData?.url}
                        onClick={() => connectionData?.url && window.open(connectionData.url, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Site
                    </Button>
                    <Button
                        onClick={handleSyncAll}
                        disabled={importing || !connectionData?.isConnected}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        <RefreshCw className={importing ? "w-4 h-4 mr-2 animate-spin" : "w-4 h-4 mr-2"} />
                        {importing ? "Syncing Site..." : "Sync All"}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => {
                setActiveTab(val);
                if (val === 'content') fetchContent('pages');
                if (val === 'media') fetchContent('media');
            }} className="w-full">
                <TabsList className="bg-[#0A0A0B] border border-white/10 p-1 mb-8">
                    <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <FileText className="w-4 h-4" /> Content Browser
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4" /> Media Sync
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Settings className="w-4 h-4" /> Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard title="Total Posts" value={connectionData?.counts?.posts?.toString() || "-"} icon={FileText} />
                        <StatsCard title="Total Pages" value={connectionData?.counts?.pages?.toString() || "-"} icon={LayoutDashboard} />
                        <StatsCard title="Media Items" value={connectionData?.counts?.media?.toString() || "-"} icon={ImageIcon} />
                    </div>

                    <div className="p-12 text-center border border-white/5 rounded-xl bg-slate-900/50">
                        <p className="text-slate-500">Connection status: <span className={connectionData?.isConnected ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                            {connectionData?.isConnected ? "Active" : "Connecting..."}
                        </span></p>
                        {connectionData?.url && <p className="text-xs text-slate-600 mt-2">{connectionData.url}</p>}
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">WordPress Pages</h3>
                        <div className="flex gap-2">
                            <Button onClick={() => setImportUrlModalOpen(true)} disabled={importing} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                                <RefreshCw className={importing ? "animate-spin mr-2" : "mr-2"} />
                                Import from URL
                            </Button>
                            <Button onClick={() => handleImport('pages', 'all')} disabled={importing} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                <RefreshCw className={importing ? "animate-spin mr-2" : "mr-2"} />
                                Fetch All & Import
                            </Button>
                            <Button onClick={() => fetchContent('pages')} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <RefreshCw className={loading ? "animate-spin mr-2" : "mr-2"} /> Refresh List
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>
                    ) : (
                        <div className="grid gap-4">
                            {pages.map((page: any) => (
                                <div key={page.id} className="p-4 bg-[#0A0A0B] border border-white/10 rounded-lg flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                                    <div>
                                        <h4 className="font-medium text-white mb-1" dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                                        <p className="text-xs text-slate-500 flex gap-4">
                                            <span>Status: {page.status}</span>
                                            <span>Date: {new Date(page.date).toLocaleDateString()}</span>
                                            <a href={page.link} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></a>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {page.importedId ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(`/cms/landing/${page.importedId}?mode=visual`, '_blank')}
                                                className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                            >
                                                Edit in CMS
                                            </Button>
                                        ) : null}
                                        <Button
                                            size="sm"
                                            onClick={() => handleImport('pages', [page.id])}
                                            disabled={importing || !!page.importedId}
                                            className={page.importedId
                                                ? "bg-emerald-900/20 text-emerald-600 cursor-default border border-emerald-900/20"
                                                : "bg-slate-800 hover:bg-emerald-600 border border-white/5 hover:border-emerald-500/50 transition-colors text-white"}
                                        >
                                            {page.importedId ? "Imported" : (importing ? "Importing..." : "Import to CMS")}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {pages.length === 0 && <p className="text-slate-500 text-center py-8">No pages found or connection failed.</p>}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">WordPress Media Library</h3>
                        <div className="flex gap-2">
                            <Button onClick={() => handleImport('media', 'all')} disabled={importing} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                <RefreshCw className={importing ? "animate-spin mr-2" : "mr-2"} />
                                {importing ? "Syncing..." : "Sync All Media"}
                            </Button>
                            <Button onClick={() => fetchContent('media')} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <RefreshCw className={loading ? "animate-spin mr-2" : "mr-2"} /> Refresh
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {media.map((item: any) => (
                                <div key={item.id} className="group relative aspect-square bg-[#0A0A0B] border border-white/10 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all">
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <Image
                                            src={item.source_url}
                                            alt={item.alt_text || "WordPress Media"}
                                            fill
                                            className="object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <p className="text-[10px] text-white truncate">{item.title.rendered || "Untitled"}</p>
                                        <Button onClick={() => handleImport('media', [item.id])} size="sm" className="w-full mt-2 h-6 text-[10px] bg-white/10 hover:bg-emerald-600 text-white border border-white/10">
                                            Import
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {media.length === 0 && <div className="col-span-full p-8 text-center text-slate-500">No media found.</div>}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card className="p-6 bg-[#0A0A0B] border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4">Connection Settings</h3>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">WordPress Site URL</label>
                                <input
                                    type="text"
                                    placeholder="https://your-site.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-emerald-500"
                                    defaultValue={connectionData?.url || ""}
                                    id="wp-url"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    placeholder="admin"
                                    className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-emerald-500"
                                    id="wp-username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Application Password</label>
                                <input
                                    type="password"
                                    placeholder="xxxx xxxx xxxx xxxx"
                                    className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:border-emerald-500"
                                    id="wp-password"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Generate this in your WordPress Admin: Users &gt; Profile &gt; Application Passwords.
                                </p>
                            </div>
                            <Button
                                onClick={async () => {
                                    const url = (document.getElementById('wp-url') as HTMLInputElement).value;
                                    const username = (document.getElementById('wp-username') as HTMLInputElement).value;
                                    const password = (document.getElementById('wp-password') as HTMLInputElement).value;

                                    if (!url || !username || !password) {
                                        setSuccessMessage("Please fill in all fields.");
                                        setSuccessModalOpen(true);
                                        return;
                                    }

                                    try {
                                        const res = await fetch("/api/cms/apps/connect", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                providerId: "wordpress",
                                                displayName: "My WP Site",
                                                category: "cms",
                                                credentials: {
                                                    url,
                                                    username,
                                                    application_password: password
                                                }
                                            })
                                        });

                                        if (res.ok) {
                                            setSuccessMessage("Connection updated successfully!");
                                            setSuccessModalOpen(true);
                                            // Refresh status
                                            const statusRes = await fetch("/api/cms/apps/wordpress/status");
                                            if (statusRes.ok) setConnectionData(await statusRes.json());
                                        } else {
                                            throw new Error("Failed to update connection");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        setSuccessMessage("Failed to update connection. Please check your credentials.");
                                        setSuccessModalOpen(true);
                                    }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
                            >
                                Save Connection
                            </Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0B] border border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-emerald-400">Success</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {successMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setSuccessModalOpen(false)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importUrlModalOpen} onOpenChange={setImportUrlModalOpen}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0B] border border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Import from URL</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Enter the full URL of the WordPress page or post you want to import.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <input
                            type="text"
                            placeholder="https://your-site.com/my-page"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setImportUrlModalOpen(false)} className="text-slate-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={handleImportUrl} className="bg-blue-600 hover:bg-blue-500 text-white">
                            <RefreshCw className={importing ? "animate-spin mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function StatsCard({ title, value, icon: Icon }: { title: string, value: string, icon: any }) {
    return (
        <Card className="p-6 bg-[#0A0A0B] border-white/10 text-white">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">{title}</span>
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </Card>
    );
}
