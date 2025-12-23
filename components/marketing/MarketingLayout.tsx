import { ReactNode } from "react";
import MarketingHeader from "@/app/[locale]/components/MarketingHeader";
import MarketingFooter from "@/app/[locale]/components/MarketingFooter";
import InteractiveBackground from "@/components/demo/InteractiveBackground";
import { cn } from "@/lib/utils";

interface MarketingLayoutProps {
    children: ReactNode;
    variant?: "default" | "blue" | "gold" | "emerald";
    className?: string;
}

export default function MarketingLayout({
    children,
    variant = "default",
    className
}: MarketingLayoutProps) {
    return (
        <div className={cn(
            "min-h-screen text-white selection:bg-purple-500/30 font-sans overflow-x-hidden relative",
            className
        )}>
            <InteractiveBackground variant={variant} />

            <div className="relative z-10 flex flex-col min-h-screen">
                <MarketingHeader />

                <main className="flex-grow">
                    {children}
                </main>

                <MarketingFooter />
            </div>
        </div>
    );
}
