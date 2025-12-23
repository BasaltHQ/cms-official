"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmbedFormModal } from "@/components/cms/EmbedFormModal";
import { Loader2, Plus, Trash, Edit, Code, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateFormModal } from "@/components/cms/CreateFormModal";
import { cn } from "@/lib/utils";
import Link from "next/link"; // Correct import for Link
import { Badge } from "@/components/ui/badge";

interface Form {
    id: string;
    title: string;
    description: string;
    project: string;
    isPublic: boolean;
    status: string;
    submissions: number;
    views: number;
    clicks: number;
    content: any;
    createdAt: string;
    _count?: {
        submissions: number;
    };
}

export default function FormsAdminPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingForm, setEditingForm] = useState<Form | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // New State
    const [activeTab, setActiveTab] = useState<"public" | "private" | "drafts">("public");
    const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
    const [embedModalForm, setEmbedModalForm] = useState<{ id: string, title: string } | null>(null);

    // Stats
    const totalSubmissions = forms.reduce((acc, curr) => acc + (curr._count?.submissions || 0), 0);
    const activeFormsCount = forms.filter(f => f.status === "ACTIVE").length;

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await fetch("/api/forms");
            const data = await res.json();
            setForms(data);
        } catch (error) {
            toast.error("Failed to fetch forms");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure? Submissions will be deleted too.")) return;
        try {
            const res = await fetch(`/api/forms?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            toast.success("Form deleted");
            fetchForms();
        } catch (error) {
            toast.error("Error deleting form");
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedFormId(prev => prev === id ? null : id);
    };

    const handleEmbed = (form: Form, e: React.MouseEvent) => {
        e.stopPropagation();
        setEmbedModalForm({ id: form.id, title: form.title });
    };

    const filteredForms = forms.filter(f => {
        // Search Filter
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.project?.toLowerCase().includes(searchQuery.toLowerCase());

        // Tab Filter
        if (activeTab === "drafts") return matchesSearch && f.status === "DRAFT";
        if (activeTab === "public") return matchesSearch && f.status !== "DRAFT" && f.isPublic;
        if (activeTab === "private") return matchesSearch && f.status !== "DRAFT" && !f.isPublic;

        return false;
    });

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-teal-500" /></div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <CreateFormModal
                isOpen={showCreateModal || !!editingForm}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingForm(null);
                    fetchForms();
                }}
                initialData={editingForm || undefined}
            />

            {embedModalForm && (
                <EmbedFormModal
                    isOpen={true}
                    onClose={() => setEmbedModalForm(null)}
                    formId={embedModalForm.id}
                    formTitle={embedModalForm.title}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Form Builder</h1>
                    <p className="text-slate-400 mt-1">Create and manage lead capture forms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3">
                        <div className="text-center">
                            <span className="text-xs text-slate-500 block uppercase font-bold">Active Forms</span>
                            <span className="text-xl font-mono text-white">{activeFormsCount}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <span className="text-xs text-slate-500 block uppercase font-bold">Submissions</span>
                            <span className="text-xl font-mono text-teal-400">{totalSubmissions}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-teal-900/20"
                    >
                        <Plus className="h-4 w-4" /> New Form
                    </Button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                    {(["public", "private", "drafts"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                activeTab === tab
                                    ? "bg-teal-500 text-white shadow-lg shadow-teal-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all placeholder:text-slate-600"
                        placeholder="Search forms by title or project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List View (Expandable Rows) */}
            <div className="space-y-4">
                {filteredForms.map((form) => (
                    <div
                        key={form.id}
                        className="bg-[#0F1115] hover:bg-[#13161C] border border-white/5 hover:border-teal-500/30 rounded-xl transition-all group overflow-hidden"
                    >
                        {/* Summary Row */}
                        <div
                            onClick={(e) => toggleExpand(form.id, e)}
                            className="p-5 flex items-center gap-4 cursor-pointer"
                        >
                            <div className="p-2 bg-teal-500/10 rounded-lg">
                                <FileText className="h-5 w-5 text-teal-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors truncate">
                                        {form.title}
                                    </h3>
                                    {activeTab === "drafts" && (
                                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-0 px-2">DRAFT</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 truncate">{form.description || "No description provided."}</p>
                            </div>

                            {/* Stats Pills */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400">
                                    <span className="text-white font-mono">{form.views || 0}</span> views
                                </div>
                                <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-xs text-slate-400">
                                    <span className="text-teal-400 font-mono font-bold">{form._count?.submissions || 0}</span> replies
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleEmbed(form, e)}
                                    className="h-8 bg-slate-900 border-white/10 hover:bg-teal-500/10 hover:text-teal-400 text-slate-400 gap-2"
                                >
                                    <Code className="h-4 w-4" /> <span className="hidden sm:inline">Get Code</span>
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); setEditingForm(form); }}
                                    className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => handleDelete(form.id, e)}
                                    className="h-8 w-8 hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Chevron */}
                            <div className="pl-2">
                                <Badge variant="outline" className="border-0 bg-transparent text-slate-500">
                                    {expandedFormId === form.id ? "Collapse" : "Expand"}
                                </Badge>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedFormId === form.id && (
                            <div className="bg-black/20 border-t border-white/5 p-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slug / ID</span>
                                            <p className="font-mono text-sm text-teal-400">{form.id}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Created</span>
                                            <p className="text-sm text-slate-300">
                                                {new Date(form.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Fields Preview</span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Extract fields from content if available, else show placeholder */}
                                            {form.content?.fields?.map((field: any, idx: number) => (
                                                <div key={idx} className="bg-slate-900 border border-white/5 p-3 rounded-lg flex justify-between items-center group/field hover:border-white/10 transition-colors">
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-200 block">{field.label}</span>
                                                        <span className="text-[10px] text-slate-500 uppercase">{field.type}</span>
                                                    </div>
                                                    {field.required && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded">Required</span>}
                                                </div>
                                            ))}
                                            {(!form.content?.fields || form.content.fields.length === 0) && (
                                                <div className="col-span-2 text-sm text-slate-500 italic">No fields configured.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredForms.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4">
                            <Filter className="h-6 w-6 text-slate-600" />
                        </div>
                        <h3 className="text-white font-medium">No forms found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try changing tabs or creating a new form.</p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            variant="link"
                            className="text-teal-400 mt-2"
                        >
                            Create New Form
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
