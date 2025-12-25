"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteLandingPage } from "@/actions/cms/delete-landing-page";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

interface DeletePageModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string;
    pageTitle: string;
}

export function DeletePageModal({ isOpen, onClose, pageId, pageTitle }: DeletePageModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteLandingPage(pageId);
            if (result.success) {
                toast.success("Page deleted successfully");

                // Extract locale from pathname
                const parts = pathname.split('/');
                const locale = parts[1] || 'en';

                // Redirect to next available page if it exists, otherwise to dashboard
                if (result.nextPageId) {
                    router.push(`/${locale}/cms/landing/${result.nextPageId}`);
                } else {
                    router.push(`/${locale}/cms/landing`);
                }

                router.refresh();
                onClose();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Trash2 className="h-8 w-8" />
                    </div>
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-xl font-bold">Delete Page?</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-center">
                            Are you sure you want to delete <span className="text-white font-medium">&quot;{pageTitle}&quot;</span>?
                            <br />This action cannot be undone.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-center w-full mt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
                    >
                        {isLoading ? "Deleting..." : "Delete Page"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
