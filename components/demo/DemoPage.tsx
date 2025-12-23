
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// Only import what's needed for initial render
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import MarketingHeader from "@/app/[locale]/components/MarketingHeader";

import {
    ArrowRight,
    Sparkles,
    Globe as GlobeIcon,
    MousePointer2 as CursorArrowIcon
} from "lucide-react";
// Defer below-fold components
const GlassCard = dynamic(() => import("./GlassCard"), { ssr: true });
import { DEMO_FEATURES } from "./demo-data";
import { VISUAL_MAP } from "./FeatureVisuals";
import { Button } from "@/components/ui/button";
import { DesktopOnlyModal } from "@/components/modals/DesktopOnlyModal";

// Dynamic imports for heavy components - saves ~300KB+ on initial load
const DemoPuckEditor = dynamic(() => import("./DemoPuckEditor"), {
    loading: () => (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
            <div className="animate-pulse text-white text-lg">Loading Editor...</div>
        </div>
    ),
    ssr: false
});

// Defer InteractiveBackground to after first paint
const InteractiveBackground = dynamic(() => import("./InteractiveBackground"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-0 bg-[#020617]" />
});

interface DemoPageProps {
    footer: React.ReactNode;
}

export default function DemoPage({ footer }: DemoPageProps) {
    const [mode, setMode] = useState<"landing" | "builder">("landing");
    const [isMobile, setIsMobile] = useState(false);
    const [showDesktopModal, setShowDesktopModal] = useState(false);


    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleStartDemo = () => {
        if (isMobile) {
            setShowDesktopModal(true);
        } else {
            setMode("builder");
        }
    };

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
                <InteractiveBackground />

                <DesktopOnlyModal open={showDesktopModal} onOpenChange={setShowDesktopModal} />

                <AnimatePresence mode="wait">
                    {mode === "landing" ? (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Header */}
                            <MarketingHeader />

                            <div className="relative z-10 lg:pt-10">

                                <main className="container mx-auto px-6 pt-12 pb-20">
                                    {/* Hero */}
                                    <section className="text-center max-w-5xl mx-auto mb-32 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

                                        {/* Hero content - renders immediately, CSS handles fade-in */}
                                        <div className="animate-[fadeIn_0.8s_ease-out_forwards]">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-medium text-purple-200">The Future of Content is Headless</span>
                                            </div>

                                            {/* LCP Element - H1 renders immediately */}
                                            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
                                                    The World&apos;s Most Powerful
                                                </span>
                                                <br />
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-purple-500">
                                                    AI-Assisted CMS
                                                </span>
                                            </h1>

                                            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                                                Build, Optimize, and Publish with Zero Friction. <br className="hidden md:block" />
                                                Experience the first CMS that writes its own code and designs its own pages.
                                            </p>

                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                                <Button
                                                    onClick={handleStartDemo}
                                                    variant="glow"
                                                    className="h-16 px-12 text-lg"
                                                >
                                                    Start Demo
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-16 px-12 text-lg rounded-full border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-300"
                                                >
                                                    View Documentation
                                                </Button>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Feature 1: Visual Builder */}
                                    <section id="visual-builder" className="mb-32 scroll-mt-32">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                            <div className="order-2 lg:order-1">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono mb-6">
                                                    <CursorArrowIcon className="w-3 h-3" />
                                                    VISUAL BUILDER
                                                </div>
                                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                                    Design Without <br />
                                                    <span className="text-blue-400">Dependencies</span>
                                                </h2>
                                                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                                                    Drag, drop, and customize every pixel. Our visual editor gives marketers the power to build beautiful pages while maintaining code-perfect output.
                                                </p>
                                                <Button
                                                    onClick={handleStartDemo}
                                                    variant="outline"
                                                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
                                                >
                                                    Try the Editor
                                                </Button>
                                            </div>
                                            <div className="order-1 lg:order-2 h-[400px] lg:h-[500px] bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative group">
                                                {VISUAL_MAP["VisualBuilderVisual"] && (
                                                    <div className="absolute inset-0">
                                                        {(() => {
                                                            const Visual = VISUAL_MAP["VisualBuilderVisual"];
                                                            return <Visual />;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Feature 2: Genius Mode */}
                                    <section id="genius-mode" className="mb-32 scroll-mt-32">
                                        <div className="bg-slate-900/40 border border-purple-500/20 rounded-3xl overflow-hidden backdrop-blur-sm p-8 lg:p-12">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                                <div className="order-2">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-6">
                                                        <Sparkles className="w-3 h-3" />
                                                        GENIUS MODE
                                                    </div>
                                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                                        From Prompt to <br />
                                                        <span className="text-purple-400">Publish in Seconds</span>
                                                    </h2>
                                                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                                                        {DEMO_FEATURES[0].description} Just describe what you want, and watch Genius Mode architect your entire page structure, copy, and layout instantly.
                                                    </p>
                                                    <Button
                                                        onClick={handleStartDemo}
                                                        className="bg-purple-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-purple-500/25 transition-all duration-300 hover:bg-purple-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(168,85,247,0.6)]"
                                                    >
                                                        Start Genius Mode
                                                    </Button>
                                                </div>
                                                <div className="order-1 h-[400px] bg-slate-950/50 rounded-2xl border border-purple-500/10 overflow-hidden relative">
                                                    {VISUAL_MAP["GeniusVisual"] && (
                                                        <div className="absolute inset-0">
                                                            {(() => {
                                                                const Visual = VISUAL_MAP["GeniusVisual"];
                                                                return <Visual />;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Feature 3: Ecosystem & Integrations */}
                                    <section id="integrations" className="mb-32 scroll-mt-32">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                            <div className="order-2 lg:order-1">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-mono mb-6">
                                                    <GlobeIcon className="w-3 h-3" />
                                                    APPS & PLUGINS
                                                </div>
                                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                                    Your Keys, <br />
                                                    <span className="text-green-400">Apps & Plugins</span>
                                                </h2>
                                                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                                                    Bring Your Own Keys (BYOK) for OpenAI and Anthropic. Seamlessly connect with Twitter, LinkedIn, and your favorite tools. You own your data and your connections.
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    {[
                                                        { name: "Shopify", url: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.png", href: "#" },
                                                        { name: "WooCommerce", url: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/woocommerce-icon.png", href: "#" },
                                                        { name: "WordPress", url: "https://s.w.org/style/images/about/WordPress-logotype-wmark.png", href: "#" },
                                                        { name: "Zapier", url: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/zapier-icon.png", href: "#" },
                                                        { name: "OpenAI", url: "https://avatars.githubusercontent.com/u/14957082?s=200&v=4", href: "#" },
                                                        { name: "Anthropic", url: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/claude-ai-icon.png", href: "#" }
                                                    ].map((social) => (
                                                        <a
                                                            key={social.name}
                                                            href={social.href}
                                                            className="group relative w-12 h-12 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-slate-800 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                                        >
                                                            <div className="w-6 h-6 relative grayscale group-hover:grayscale-0 transition-all duration-300">
                                                                {/* Next.js Image for optimization */}
                                                                <Image
                                                                    src={social.url}
                                                                    alt={social.name}
                                                                    width={24}
                                                                    height={24}
                                                                    className={`w-full h-full object-contain ${social.name === "WordPress" ? "brightness-0 invert" : ""}`}
                                                                    unoptimized
                                                                />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="order-1 lg:order-2 h-[400px] bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                                                {VISUAL_MAP["IntegrationsVisual"] && (
                                                    <div className="absolute inset-0">
                                                        {(() => {
                                                            const Visual = VISUAL_MAP["IntegrationsVisual"];
                                                            return <Visual />;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Sign Up CTA */}
                                    <section className="mb-32 relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl -z-10" />
                                        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-md relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Build the Future?</h2>
                                            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                                                Join thousands of developers and marketers building faster, smarter, and better with Ledger1CMS.
                                            </p>
                                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                <Button
                                                    size="lg"
                                                    asChild
                                                    variant="glow"
                                                    className="h-14 px-8 text-lg"
                                                >
                                                    <Link href="/create-account">
                                                        Sign Up for Free
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="h-14 px-8 text-lg border-white/10 bg-white/5 text-white rounded-full backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-[0_0_30px_rgba(77,191,217,0.3)]"
                                                >
                                                    Book a Demo
                                                </Button>
                                            </div>
                                        </div>
                                    </section>



                                </main>
                            </div>
                            <div className="relative z-50">
                                {footer}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="builder"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 bg-slate-950"
                        >
                            <DemoPuckEditor onExit={() => setMode("landing")} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LazyMotion>
    );
}
