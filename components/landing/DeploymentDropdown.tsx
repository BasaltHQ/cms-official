"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe, Github, RefreshCw, Loader2, Cloud, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { publishLandingPage } from "@/actions/cms/publish-landing-page";
import { syncToWordPress } from "@/actions/cms/sync-to-wordpress";
import { Data } from "@measured/puck";

interface DeploymentDropdownProps {
    pageId: string;
    pageSlug: string;
    lastPublishedAt?: Date | null;
    data: Data;
    wordPressPostId?: number | null;
    onSyncSuccess?: () => void;
}

export function DeploymentDropdown({ 
    pageId, 
    pageSlug, 
    lastPublishedAt, 
    data, 
    wordPressPostId,
    onSyncSuccess 
}: DeploymentDropdownProps) {
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployTarget, setDeployTarget] = useState<"vercel" | "wordpress" | "github" | null>(null);

    const handleVercelDeploy = async () => {
        setIsDeploying(true);
        setDeployTarget("vercel");
        try {
            const result = await publishLandingPage(pageId);
            if (result.success) {
                toast.success("Deployed to Vercel", {
                    description: `Live at /landing/${pageSlug}`
                });
            } else {
                toast.error("Vercel Deployment Failed", { description: result.error });
            }
        } catch (e) {
            toast.error("Deployment Error");
        } finally {
            setIsDeploying(false);
            setDeployTarget(null);
        }
    };

    const handleWordPressSync = async () => {
        setIsDeploying(true);
        setDeployTarget("wordpress");
        try {
            // Need to handle manual URL if not linked, but for now assuming linked or existing logic
            // In PuckEditor this logic was complex (modal etc). 
            // For MVP of this dropdown, we'll call the action directly. 
            // Ideally we lift the complex logic or pass a handler. 
            // But let's try direct action for now, assuming user will link in settings if needed.
            // Actually, PuckEditor had logic to open a modal. 
            // We might need to pass a callback from parent to handle "Open Modal" logic.
             const result = await syncToWordPress(pageId, data, ""); 
             if (result.success) {
                 toast.success("Synced to WordPress");
                 onSyncSuccess?.();
             } else {
                 toast.error("WordPress Sync Failed", { description: result.error });
             }
        } catch (e) {
             toast.error("Sync Error");
        } finally {
            setIsDeploying(false);
            setDeployTarget(null);
        }
    };

    const handleGithubCommit = async () => {
        // Placeholder for GitHub logic
        toast.info("GitHub Commit", { description: "Coming soon: Commit changes directly to repo." });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    size="sm" 
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/20 shadow-lg shadow-emerald-900/20 h-7 px-3 text-xs gap-1.5 transition-all"
                    disabled={isDeploying}
                >
                    {isDeploying ? (
                       <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                       <Cloud className="h-3.5 w-3.5" />
                    )}
                    Deploy
                    <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0f1012] border-white/10 text-slate-200">
                <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">Deployment Targets</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem onClick={handleVercelDeploy} disabled={isDeploying} className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">
                    <Globe className="mr-2 h-4 w-4 text-emerald-500" />
                    <div className="flex flex-col">
                        <span>Vercel (Live)</span>
                        <span className="text-[10px] text-slate-500">Deploy to production</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleWordPressSync} disabled={isDeploying} className="focus:bg-blue-500/10 focus:text-blue-400 cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                        <span>WordPress</span>
                        <span className="text-[10px] text-slate-500">Sync content to WP</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleGithubCommit} disabled={isDeploying} className="focus:bg-purple-500/10 focus:text-purple-400 cursor-pointer">
                    <Github className="mr-2 h-4 w-4 text-purple-500" />
                    <div className="flex flex-col">
                        <span>GitHub</span>
                        <span className="text-[10px] text-slate-500">Commit & Push</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
