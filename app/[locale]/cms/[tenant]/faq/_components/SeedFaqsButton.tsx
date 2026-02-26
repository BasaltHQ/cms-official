"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedDefaultFaqs } from "@/actions/cms/faq";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SeedFaqsButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSeed = async () => {
        setIsLoading(true);
        try {
            const result = await seedDefaultFaqs();
            if (result.success) {
                toast.success("FAQs seeded successfully!");
                router.refresh();
            } else {
                toast.info(result.message);
            }
        } catch (error) {
            toast.error("Failed to seed FAQs");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSeed}
            disabled={isLoading}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="h-4 w-4" />
            )}
            Auto-Generate Defaults
        </Button>
    );
}
