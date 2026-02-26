"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFaq, updateFaq, deleteFaq } from "@/actions/cms/faq";
import Link from "next/link";

interface FaqEditorProps {
    initialData?: {
        id: string;
        question: string;
        answer: string;
        category: string;
        order: number;
        isVisible: boolean;
    } | null;
    locale: string;
}

export function FaqEditor({ initialData, locale }: FaqEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        question: initialData?.question || "",
        answer: initialData?.answer || "",
        category: initialData?.category || "General",
        order: initialData?.order || 0,
        isVisible: initialData?.isVisible ?? true,
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (initialData) {
                await updateFaq(initialData.id, formData);
                toast.success("FAQ updated successfully");
            } else {
                await createFaq(formData);
                toast.success("FAQ created successfully");
                router.push(`/${locale}/cms/faq`);
            }
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async () => {
        if (!initialData) return;
        setIsDeleting(true);
        try {
            await deleteFaq(initialData.id);
            toast.success("FAQ deleted");
            router.push(`/${locale}/cms/faq`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete FAQ");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/${locale}/cms/faq`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {initialData ? "Edit FAQ" : "Create New FAQ"}
                        </h1>
                        <p className="text-slate-400">
                            {initialData ? "Manage existing question" : "Add a new question to your knowledge base"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {initialData && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={onDelete}
                            disabled={isDeleting || isLoading}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                        </Button>
                    )}
                    <Button onClick={onSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-[#0A0A0B] border-white/10">
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white">Question</Label>
                                <Input
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="e.g., How do I reset my password?"
                                    className="bg-white/5 border-white/10 text-white focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Answer (Markdown Supported)</Label>
                                <Textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Provide a detailed answer..."
                                    className="min-h-[200px] bg-white/5 border-white/10 text-white focus:ring-blue-500/50 font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500">
                                    Tips: Use **bold** for emphasis, available variables depend on implementation.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-[#0A0A0B] border-white/10">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-white">Category</Label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="General"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Sort Order</Label>
                                <Input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Label className="text-white">Visible?</Label>
                                <Switch
                                    checked={formData.isVisible}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
