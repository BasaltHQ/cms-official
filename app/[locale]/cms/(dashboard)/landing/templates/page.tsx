"use client";

import { templates as TEMPLATES } from "@/lib/templates";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { createLandingPage } from "@/actions/cms/create-landing-page";

export default function TemplatesPage({ params }: { params: { locale: string } }) {
    const router = useRouter();

    const getTemplateImage = (template: typeof TEMPLATES[0]) => {
        if (template.thumbnail) return template.thumbnail;
        
        // Try to find a HeroBlock or similar with an image
        const heroBlock = template.data.content.find((b: any) => b.type === "HeroBlock" && b.props?.bgImage);
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

                                <Button size="sm" onClick={() => {
                                    // Logic to use template would go here. 
                                    // For now, let's just show a toast as this is primarily to fix the route crash.
                                    toast.info("Template selection coming soon");
                                }}>
                                    Preview
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => {
                                      toast.info("Use Template coming soon");
                                }}>
                                    Use Template
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
        </div>
    );
}
