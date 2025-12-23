"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Save, Lock, GripVertical, Trash2, RotateCcw } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/cms/DeleteConfirmationModal";
import { restoreFooterDefaults } from "@/actions/cms/restore-footer-defaults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface FooterLink {
    id?: string;
    text: string;
    url: string;
}

interface FooterSection {
    id?: string;
    title: string;
    order: number;
    isBase?: boolean;
    links: FooterLink[];
}

interface FooterSettings {
    tagline: string;
    copyrightText: string;
    footerLogoUrl: string;
}

export default function FooterAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<FooterSettings>({
        tagline: "",
        copyrightText: "",
        footerLogoUrl: "",
    });
    const [sections, setSections] = useState<FooterSection[]>([]); // sections is local state until save. 
    // However, for delete modal we need to handle "removal from local state" via modal confirmation.

    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/footer");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setSettings(data.settings || {
                tagline: "",
                copyrightText: "",
                footerLogoUrl: "",
            });
            setSections(data.sections || []);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/footer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings, sections }),
            });

            if (!res.ok) throw new Error("Failed to save");
            toast.success("Footer updated successfully");
            fetchData();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const updateSection = (index: number, field: keyof FooterSection, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const updateLink = (sectionIndex: number, linkIndex: number, field: keyof FooterLink, value: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].links[linkIndex] = {
            ...newSections[sectionIndex].links[linkIndex],
            [field]: value,
        };
        setSections(newSections);
    };

    const addLink = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links.push({ text: "New Link", url: "/" });
        setSections(newSections);
    };

    const removeLink = (sectionIndex: number, linkIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].links.splice(linkIndex, 1);
        setSections(newSections);
    };

    const addSection = () => {
        setSections([...sections, {
            title: "New Section",
            order: sections.length,
            isBase: false,
            links: []
        }]);
    };

    const confirmRemoveSection = () => {
        if (sectionToDelete === null) return;
        const newSections = [...sections];
        newSections.splice(sectionToDelete, 1);
        setSections(newSections);
        setSectionToDelete(null);
    };

    const handleRestoreDefaults = async () => {
        try {
            setRestoring(true);
            const result = await restoreFooterDefaults();
            if (result.success) {
                toast.success("Restored default sections");
                fetchData(); // Reload data from server
            } else {
                toast.error("Failed to restore defaults");
            }
        } catch (error) {
            toast.error("Error restoring defaults");
        } finally {
            setRestoring(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Footer Management</h1>
                    <p className="text-slate-400 mt-1 text-lg">Manage your site&apos;s footer content and structure.</p>
                </div>
                <Button
                    onClick={onSave}
                    disabled={saving}
                    variant="gradient"
                    className="text-white"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <DeleteConfirmationModal
                isOpen={sectionToDelete !== null}
                onClose={() => setSectionToDelete(null)}
                onConfirm={confirmRemoveSection}
                title="Delete Footer Section"
                description="Are you sure you want to remove this section? This change will be saved when you click 'Save Changes'."
            />

            {/* Global Settings */}
            <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Global Settings</CardTitle>
                    <CardDescription className="text-slate-400">Default content and social links for the footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Tagline</Label>
                            <Input
                                className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600"
                                value={settings.tagline || ""}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                placeholder="e.g. Building the future..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Copyright Text</Label>
                            <Input
                                className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600"
                                value={settings.copyrightText || ""}
                                onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                                placeholder="e.g. © 2024 Acme Inc."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Footer Logo URL</Label>
                            <Input
                                className="bg-black/50 border-white/10 text-white focus:border-blue-500 placeholder:text-slate-600 font-mono"
                                value={settings.footerLogoUrl || ""}
                                onChange={(e) => setSettings({ ...settings, footerLogoUrl: e.target.value })}
                                placeholder="/ledger1-cms-logo.png"
                            />
                            <p className="text-xs text-slate-500">Path to the logo image (e.g. /public/logo.png or external URL)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator className="bg-white/10" />

            {/* Sections Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Footer Sections</h2>
                <div className="flex gap-2">
                    <Button
                        onClick={handleRestoreDefaults}
                        variant="ghost"
                        disabled={restoring}
                        className="text-slate-400 hover:text-white"
                    >
                        {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                        Restore Defaults
                    </Button>
                    <Button
                        onClick={addSection}
                        variant="outline"
                        className="border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 text-slate-300 hover:text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Section
                    </Button>
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sections.map((section, sIndex) => (
                    <Card key={section.id || sIndex} className="bg-[#0A0A0B] backdrop-blur-sm border-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col h-full">
                        <CardHeader className="p-4 pb-2 space-y-0">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1">
                                    {section.isBase ? (
                                        <Lock className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <GripVertical className="h-4 w-4 text-slate-600 cursor-grab active:cursor-grabbing" />
                                    )}
                                    <Input
                                        className="h-8 font-semibold text-lg bg-transparent border-transparent hover:border-white/10 focus:border-blue-500 p-0 px-2 h-auto w-full text-white placeholder:text-slate-600 focus-visible:ring-0 rounded-sm"
                                        value={section.title || ""}
                                        onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                                        placeholder="Section Title"
                                    />
                                </div>
                                {!section.isBase && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setSectionToDelete(sIndex)}
                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
                            <div className="space-y-3 flex-1">
                                {section.links.map((link, lIndex) => (
                                    <div key={lIndex} className="flex gap-2 items-start group">
                                        <div className="flex-1 space-y-1.5">
                                            <Input
                                                className="h-8 text-sm bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500"
                                                placeholder="Link Text"
                                                value={link.text || ""}
                                                onChange={(e) => updateLink(sIndex, lIndex, "text", e.target.value)}
                                            />
                                            <Input
                                                className="h-7 text-xs bg-black/20 border-white/10 text-slate-400 placeholder:text-slate-700 focus:border-blue-500 font-mono"
                                                placeholder="/path"
                                                value={link.url || ""}
                                                onChange={(e) => updateLink(sIndex, lIndex, "url", e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeLink(sIndex, lIndex)}
                                            className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => addLink(sIndex)}
                                variant="ghost"
                                size="sm"
                                className="w-full border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-400 hover:text-white"
                            >
                                <Plus className="mr-2 h-3 w-3" /> Add Link
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
