"use client";

import { useState } from "react";
import { templates as TEMPLATES, Template } from "@/lib/templates";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { LayoutTemplate, Loader2, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { createLandingPage } from "@/actions/cms/create-landing-page";
import { Render } from "@measured/puck";
import { puckConfig } from "@/lib/puck.config";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TemplatesPage() {
    const params = useParams();
    const locale = params.locale as string;
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const handleUseTemplate = async (templateId: string) => {
        setLoadingId(templateId);
        setPreviewTemplate(null); // Close preview if open
        try {
            toast.loading("Creating page...");
            await createLandingPage(locale, templateId);
            // Action redirects
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Failed to create page");
            setLoadingId(null);
        }
    };

    const getTemplateImage = (template: typeof TEMPLATES[0]) => {
        if (template.thumbnail) return template.thumbnail;
        const heroBlock = template.data.content.find((b: any) => b.type === "HeroBlock" && b.props?.bgImage) as any;
        if (heroBlock) return heroBlock.props.bgImage;
        return null;
    };

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Templates</h1>
                    <p className="text-slate-400">Choose a starting point for your new landing page.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {TEMPLATES.map((template) => {
                    const imageUrl = getTemplateImage(template);

                    return (
                        <Card key={template.id} className="bg-zinc-900 border-white/10 hover:border-indigo-500/50 transition-all group overflow-hidden flex flex-col">
                            <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={template.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 bg-white/5">
                                        <LayoutTemplate className="w-12 h-12 opacity-20" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewTemplate(template);
                                        }}
                                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUseTemplate(template.id);
                                        }}
                                        disabled={loadingId !== null}
                                    >
                                        {loadingId === template.id ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                                        ) : (
                                            "Use Template"
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-200">{template.name}</CardTitle>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 text-xs text-slate-500">
                                {template.category}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Preview Modal */}
            <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
                <DialogContent className="max-w-6xl h-[90vh] p-0 bg-zinc-950 border-white/10 overflow-hidden flex flex-col">
                    <DialogHeader className="p-4 border-b border-white/10 flex-shrink-0 flex flex-row items-center justify-between">
                        <DialogTitle className="text-white">
                            {previewTemplate?.name} Preview
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => previewTemplate && handleUseTemplate(previewTemplate.id)}
                                disabled={loadingId !== null}
                            >
                                {loadingId === previewTemplate?.id ? (
                                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                                ) : (
                                    "Use This Template"
                                )}
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-[#0a0a0a]">
                        {previewTemplate && (
                            <Render config={puckConfig} data={previewTemplate.data as any} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
