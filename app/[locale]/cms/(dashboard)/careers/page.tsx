"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Edit, Save, Sparkles, LayoutGrid, List, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/cms/DeleteConfirmationModal";
import { MarkdownEditor } from "../_components/MarkdownEditor";
import { generateCareerPost } from "@/actions/cms/generate-career-post";
import { reviseContent } from "@/actions/cms/revise-content";
import { generateNanoBananaImage } from "@/actions/cms/generate-nano-banana-image";
import { NanoBananaImageModal } from "@/components/cms/NanoBananaImageModal";
import { MediaSelectorModal } from "@/components/cms/MediaSelectorModal";
import { AiAssistantModal } from "@/components/cms/AiAssistantModal";
import { cn } from "@/lib/utils";

interface JobPosting {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    summary: string;
    content: string;
    requirements: string;
    applyLink: string;
    active: boolean;
    coverImage?: string;
}

export default function CareersAdminPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingJob, setEditingJob] = useState<Partial<JobPosting> | null>(null);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // AI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAiPrompt, setShowAiPrompt] = useState(false);
    const [aiMode, setAiMode] = useState<"create" | "revise">("create");

    // Nano Banana State
    const [showNanoBanana, setShowNanoBanana] = useState(false);
    const [nanoBananaPrompt, setNanoBananaPrompt] = useState("");
    const [targetJobId, setTargetJobId] = useState<string | null>(null);

    // Media Selector State
    const [showMediaSelector, setShowMediaSelector] = useState(false);
    const [mediaSelectorTarget, setMediaSelectorTarget] = useState<"create" | "edit" | null>(null); // Context

    // Delete Modal State
    const [jobToDelete, setJobToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/careers", { cache: "no-store" });
            const data = await res.json();
            // Deep debug log to check for coverImage in response
            // console.dir(data, { depth: null }); 
            console.log("Fetched jobs count:", data.length);
            if (data.length > 0) {
                console.log("First job sample:", { id: data[0].id, title: data[0].title, coverImage: data[0].coverImage });
            }
            setJobs(data);
        } catch (error) {
            toast.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingJob?.title) {
            toast.error("Title is required");
            return;
        }

        try {
            setSaving(true);
            const method = editingJob.id ? "PUT" : "POST";
            console.log("Saving job:", editingJob);
            const res = await fetch("/api/careers", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingJob),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Job saved successfully");
            setEditingJob(null);
            fetchJobs();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setJobToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!jobToDelete) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`/api/careers?id=${jobToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Job deleted");
            setJobToDelete(null);
            fetchJobs();
        } catch (error) {
            toast.error("Failed to delete job");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAiGenerate = async (topic: string) => {
        try {
            setIsGenerating(true);
            const generatedData = await generateCareerPost(topic);

            setEditingJob(prev => ({
                ...prev,
                title: generatedData.title,
                department: generatedData.department,
                location: generatedData.location,
                type: generatedData.employmentType,
                summary: generatedData.summary,
                content: generatedData.content,
            }));

            toast.success("Job description generated successfully!");
            setShowAiPrompt(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate job description.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiRevise = async (instruction: string) => {
        if (!editingJob?.content) {
            toast.error("No content to revise");
            return;
        }

        try {
            setIsGenerating(true);
            const revisedContent = await reviseContent(editingJob.content, instruction, "career");

            setEditingJob(prev => ({
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
        // Handle selection from Nano Banana OR Media Selector
        if (targetJobId) {
            // Updating list item directly
            setJobs(prev => prev.map(j => j.id === targetJobId ? { ...j, coverImage: url } : j));
            const job = jobs.find(j => j.id === targetJobId);
            if (job) {
                console.log("Updating job image:", { ...job, coverImage: url });
                fetch("/api/careers", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...job, coverImage: url }),
                }).then(() => toast.success("Image updated!"));
            }
            setTargetJobId(null);
        } else if (editingJob) {
            // Updating edit form
            console.log("Updating editingJob image:", url);
            setEditingJob(prev => ({ ...prev!, coverImage: url }));
        }
    };

    const openNanoBanana = (prompt: string, jobId?: string) => {
        setNanoBananaPrompt(prompt);
        setTargetJobId(jobId || null);
        setShowNanoBanana(true);
    };

    const openMediaSelector = (jobId?: string) => {
        setTargetJobId(jobId || null);
        setShowMediaSelector(true);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    if (editingJob) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
                <NanoBananaImageModal
                    isOpen={showNanoBanana}
                    onClose={() => setShowNanoBanana(false)}
                    initialPrompt={nanoBananaPrompt}
                    onImageSelect={handleImageSelect}
                />

                <MediaSelectorModal
                    isOpen={showMediaSelector}
                    onClose={() => setShowMediaSelector(false)}
                    onSelect={handleImageSelect}
                />

                <AiAssistantModal
                    isOpen={showAiPrompt}
                    onClose={() => setShowAiPrompt(false)}
                    mode={aiMode}
                    type="career"
                    isGenerating={isGenerating}
                    onGenerate={handleAiGenerate}
                    onRevise={handleAiRevise}
                />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">{editingJob.id ? "Edit Position" : "New Position"}</h1>
                    <div className="flex gap-2">
                        {/* buttons */}
                        <button
                            onClick={() => openAiModal("create")}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 mr-2"
                        >
                            <Sparkles className="h-4 w-4" /> Create AI
                        </button>
                        <button
                            onClick={() => openAiModal("revise")}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 mr-2"
                        >
                            <Sparkles className="h-4 w-4" /> Revise AI
                        </button>
                        <button onClick={() => setEditingJob(null)} className="px-4 py-2 border border-white/10 rounded hover:bg-white/10 text-slate-300">Cancel</button>
                        <Button onClick={handleSave} disabled={saving} variant="gradient" className="px-4 py-2 flex items-center gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title ... Type Inputs */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Title</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                            value={editingJob.title || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                        />
                    </div>
                    {/* ... Department, Location, Type ... */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Department</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                            value={editingJob.department || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Location</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                            value={editingJob.location || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Type</label>
                        <select
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-white focus:border-blue-500 transition-colors"
                            value={editingJob.type || "Full-time"}
                            onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Apply Link / Email</label>
                        <input
                            className="w-full p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                            value={editingJob.applyLink || ""}
                            onChange={(e) => setEditingJob({ ...editingJob, applyLink: e.target.value })}
                        />
                    </div>

                    {/* Image Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Cover Image</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                                value={editingJob.coverImage || ""}
                                readOnly // Make read-only to encourage using the selector
                                placeholder="Select an image..."
                            />
                            <button
                                onClick={() => openMediaSelector()}
                                className="px-3 py-2 bg-blue-500/10 border border-blue-500/50 text-blue-500 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                                title="Select from Media Library or Upload"
                            >
                                <Upload className="h-4 w-4" /> Select
                            </button>
                            <button
                                onClick={() => openNanoBanana((editingJob.title || "Career opportunity") + " abstract modern office")}
                                className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 rounded hover:bg-yellow-500/20 transition-colors flex items-center gap-2"
                                title="Generate with Nano Banana"
                            >
                                <Sparkles className="h-4 w-4" /> Gen
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 flex items-center gap-2 pt-6">
                        <input
                            type="checkbox"
                            id="active"
                            checked={editingJob.active ?? true}
                            onChange={(e) => setEditingJob({ ...editingJob, active: e.target.checked })}
                            className="rounded border-white/10 bg-white/5 text-blue-600"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-slate-300">Active</label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Summary</label>
                    <textarea
                        className="w-full p-2 border rounded bg-black/50 border-white/10 text-white placeholder:text-slate-500 h-24 focus:border-blue-500 transition-colors"
                        value={editingJob.summary || ""}
                        onChange={(e) => setEditingJob({ ...editingJob, summary: e.target.value })}
                    />
                </div>

                {/* Editors */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Content (Markdown)</label>
                    <MarkdownEditor
                        value={editingJob.content || ""}
                        onChange={(val) => setEditingJob({ ...editingJob, content: val })}
                        className="min-h-[200px]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Requirements (Markdown)</label>
                    <MarkdownEditor
                        value={editingJob.requirements || ""}
                        onChange={(val) => setEditingJob({ ...editingJob, requirements: val })}
                        className="min-h-[200px]"
                    />
                </div>
            </div >
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <NanoBananaImageModal
                isOpen={showNanoBanana}
                onClose={() => setShowNanoBanana(false)}
                initialPrompt={nanoBananaPrompt}
                onImageSelect={handleImageSelect}
            />

            <MediaSelectorModal
                isOpen={showMediaSelector}
                onClose={() => setShowMediaSelector(false)}
                onSelect={handleImageSelect}
            />

            <DeleteConfirmationModal
                isOpen={!!jobToDelete}
                onClose={() => setJobToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Job Posting"
                description="Are you sure you want to delete this job posting? This action cannot be undone."
            />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Careers Management</h1>
                    <p className="text-slate-400 mt-1">Manage job listings and applications.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>

                <Button
                    onClick={() => setEditingJob({ active: true })}
                    variant="gradient"
                    className="px-4 py-2 rounded-md flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> New Job
                </Button>
            </div>

            {
                viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-5 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-900/10 group flex flex-col">

                                {/* Image Preview - Fixed Aspect Ratio but Object Contain to prevent crop */}
                                <div
                                    className="aspect-video w-full bg-black rounded-lg overflow-hidden relative cursor-pointer border border-white/5 group-hover:border-blue-500/30 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openMediaSelector(job.id);
                                    }}
                                    title="Click to Change Image"
                                >
                                    {job.coverImage ? (
                                        <>
                                            <NextImage
                                                src={job.coverImage}
                                                alt={job.title}
                                                fill
                                                className="object-contain bg-black/40"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <Upload className="h-4 w-4" />
                                                    <span>Change Image</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 hover:text-slate-300 transition-colors bg-white/5">
                                            <ImageIcon className="h-8 w-8 opacity-20" />
                                            <span className="text-xs font-medium">Add Cover Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingJob(job)} className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(job.id)} className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors">
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400">{job.department} • {job.location}</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className={cn("text-xs px-2.5 py-1 rounded-full border",
                                        job.active
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-white/5 text-slate-400 border-white/5"
                                    )}>
                                        {job.active ? "Active" : "Inactive"}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">{job.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0A0A0B] text-slate-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4 border-b border-white/5 w-[40%]">Position</th>
                                    <th className="px-6 py-4 border-b border-white/5">Department</th>
                                    <th className="px-6 py-4 border-b border-white/5">Location</th>
                                    <th className="px-6 py-4 border-b border-white/5">Type</th>
                                    <th className="px-6 py-4 border-b border-white/5">Status</th>
                                    <th className="px-6 py-4 border-b border-white/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-white/5 flex-shrink-0 overflow-hidden border border-white/10">
                                                    {job.coverImage ? (
                                                        <div className="relative h-full w-full">
                                                            <NextImage src={job.coverImage} alt={job.title} fill className="object-cover" unoptimized />
                                                        </div>
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <ImageIcon className="h-4 w-4 text-slate-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{job.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{job.department}</td>
                                        <td className="px-6 py-4 text-slate-400">{job.location}</td>
                                        <td className="px-6 py-4 text-slate-400">{job.type}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1.5",
                                                job.active
                                                    ? "text-emerald-400"
                                                    : "text-slate-500"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", job.active ? "bg-emerald-400" : "bg-slate-500")} />
                                                {job.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingJob(job)} className="p-1.5 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 rounded transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(job.id)} className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition-colors">
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div >
    );
}
