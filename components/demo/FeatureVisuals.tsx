"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import { useState, useEffect, useRef, Suspense, lazy, ComponentType } from "react";
import { Sparkles } from "lucide-react";

// Lazy loading wrapper - only renders content when in viewport
function LazyVisual({ children }: { children: React.ReactNode }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "100px" });

    return (
        <div ref={ref} className="w-full h-full">
            {isInView ? children : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}


export function AiLandingVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden bg-slate-950/50">
            <motion.div
                className="relative w-full max-w-sm aspect-[4/5] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
            >
                {/* Browser Header */}
                <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 space-x-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <div className="ml-4 h-4 rounded-full bg-slate-700 w-1/2 flex items-center px-2 overflow-hidden">
                        {/* Typing URL effect */}
                        <motion.div
                            className="h-1.5 bg-purple-500/50 rounded-full"
                            animate={{ width: ["0%", "80%", "80%", "0%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>

                {/* Dynamic Content Construction */}
                <div className="p-4 space-y-4 relative flex-1">
                    {/* Header Text Generation */}
                    <div className="space-y-2 mb-6">
                        <motion.div
                            className="h-6 bg-slate-800 rounded w-3/4"
                            initial={{ width: "0%" }}
                            animate={{ width: ["0%", "80%", "80%", "0%"] }}
                            transition={{ duration: 4, times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                        />
                        <motion.div
                            className="h-3 bg-slate-800/50 rounded w-1/2"
                            initial={{ width: "0%" }}
                            animate={{ width: ["0%", "50%", "50%", "0%"] }}
                            transition={{ duration: 4, delay: 0.2, times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                        />
                    </div>

                    {/* Main Image Block */}
                    <motion.div
                        className="h-32 w-full rounded-lg border border-slate-800 bg-slate-900 relative overflow-hidden flex items-center justify-center"
                    >
                        {/* Scanline Effect */}
                        <motion.div
                            className="absolute inset-x-0 h-1 bg-purple-500/50 blur-sm z-10"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Image appearing */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-slate-800"
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ duration: 4, times: [0, 0.3, 0.8, 1], repeat: Infinity }}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <SparklesIcon className="w-8 h-8 text-purple-500/50" />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Grid Layout Assembly - Content Filling Boxes */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {[0, 1].map((i) => (
                            <div key={i} className="h-24 bg-slate-800/20 rounded-lg p-2 flex flex-col gap-2 border border-slate-800/50">
                                {/* Simulating text lines appearing inside the box */}
                                <motion.div
                                    className="h-2 bg-slate-700/50 rounded w-full"
                                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                                    transition={{ duration: 4, delay: 0.5 + (i * 0.2), times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                                />
                                <motion.div
                                    className="h-2 bg-slate-700/30 rounded w-2/3"
                                    animate={{ width: ["0%", "70%", "70%", "0%"] }}
                                    transition={{ duration: 4, delay: 0.6 + (i * 0.2), times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                                />
                                <motion.div
                                    className="mt-auto h-8 w-full bg-slate-800 rounded bg-gradient-to-r from-purple-500/10 to-transparent"
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, delay: 0.8 + (i * 0.2), times: [0, 0.2, 0.8, 1], repeat: Infinity }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cursor AI Architect */}
                <motion.div
                    className="absolute z-20 pointer-events-none"
                    animate={{
                        x: ["10%", "80%", "40%", "20%", "10%"],
                        y: ["20%", "40%", "70%", "30%", "20%"]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                        <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="white" strokeWidth="1.5" />
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    )
}

export function AiBlogVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-8 bg-slate-950/50">
            {/* Central Intelligence Core */}
            <motion.div
                className="absolute"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/50 blur-sm absolute inset-0" />
                <div className="w-20 h-20 rounded-full border border-cyan-400/30 flex items-center justify-center relative z-10 bg-slate-950/80 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
            </motion.div>

            {/* Orbiting Document Streams */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, delay: i * -5, repeat: Infinity, ease: "linear" }}
                >
                    <motion.div
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-12 h-16 bg-slate-900 border border-cyan-500/30 rounded shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col p-2 space-y-1.5 backdrop-blur-md"
                        // Counter-rotate to keep upright if desired, or let them spin
                        style={{ transformOrigin: "center 80px" }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, delay: i * -5, repeat: Infinity, ease: "linear" }}
                    >
                        <motion.div
                            className="h-1.5 w-full bg-cyan-800/50 rounded-full"
                            animate={{ width: ["0%", "100%"], opacity: [0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: (i * 0.2) % 1 }}
                        />
                        <motion.div
                            className="h-1.5 w-3/4 bg-cyan-800/30 rounded-full"
                            animate={{ width: ["0%", "75%"], opacity: [0.3, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: (i * 0.3 + 0.5) % 1 }}
                        />
                        <motion.div
                            className="h-1.5 w-full bg-cyan-800/30 rounded-full"
                            animate={{ width: ["0%", "90%"], opacity: [0.3, 0.8] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: (i * 0.4 + 0.2) % 1 }}
                        />

                        {/* Status Dot */}
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    </motion.div>
                </motion.div>
            ))}

            {/* Data Particles Input */}
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <motion.div
                        key={`p-${i}`}
                        className="absolute w-1 h-1 bg-cyan-300 rounded-full"
                        initial={{ x: Math.cos(angle) * 120, y: Math.sin(angle) * 120, opacity: 0 }}
                        animate={{
                            x: [Math.cos(angle) * 120, 0],
                            y: [Math.sin(angle) * 120, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 2, delay: (i * 0.25), repeat: Infinity, ease: "easeIn" }}
                    />
                )
            })}
        </div>
    )
}

export function HeadlessVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950/50">
            {/* Global Network Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500" />
                </pattern>
                <rect width="100" height="100" fill="url(#grid)" />
            </svg>

            {/* Central Node */}
            <div className="relative z-10">
                <motion.div
                    className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                    animate={{ boxShadow: ["0 0 30px rgba(168,85,247,0.4)", "0 0 50px rgba(168,85,247,0.7)", "0 0 30px rgba(168,85,247,0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-8 h-8 rounded bg-purple-500/80 rotate-45" />
                </motion.div>

                {/* Ping Rings */}
                {[0, 1].map(i => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-purple-400"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 2, delay: i, repeat: Infinity, ease: "easeOut" }}
                    />
                ))}
            </div>

            {/* Satellite Nodes being fed */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i / 6) * Math.PI * 2;
                const r = 80;
                // Round to avoid hydration mismatch with floating point math
                const x = Math.round(Math.cos(angle) * r * 100) / 100;
                const y = Math.round(Math.sin(angle) * r * 100) / 100;

                return (
                    <motion.div
                        key={i}
                        className="absolute z-10 flex items-center justify-center"
                        style={{ x, y }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        {/* Connection Line */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none" style={{ left: -x, top: -y }}>
                            <motion.line
                                x1="100" y1="100"
                                x2={100 + x} y2={100 + y}
                                stroke="rgba(168, 85, 247, 0.2)"
                                strokeWidth="1"
                            />
                            {/* Data Packet */}
                            <circle r="2" fill="#fff">
                                <animateMotion
                                    dur={`${1 + (i % 3) * 0.5}s`}
                                    repeatCount="indefinite"
                                    path={`M100,100 L${100 + x},${100 + y}`}
                                    keyPoints="0;1"
                                    keyTimes="0;1"
                                />
                            </circle>
                        </svg>

                        <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                    </motion.div>
                )
            })}
        </div>
    )
}

// Lazy-wrapped versions of visuals - only render when in viewport
function LazyAiLandingVisual() { return <LazyVisual><AiLandingVisual /></LazyVisual>; }
function LazyAiBlogVisual() { return <LazyVisual><AiBlogVisual /></LazyVisual>; }
function LazyHeadlessVisual() { return <LazyVisual><HeadlessVisual /></LazyVisual>; }
function LazyVisualBuilderVisual() { return <LazyVisual><VisualBuilderVisual /></LazyVisual>; }
function LazyIntegrationsVisual() { return <LazyVisual><IntegrationsVisual /></LazyVisual>; }
function LazyGeniusVisual() { return <LazyVisual><GeniusVisual /></LazyVisual>; }

export const VISUAL_MAP: Record<string, React.ComponentType> = {
    "AiLandingVisual": LazyAiLandingVisual,
    "AiBlogVisual": LazyAiBlogVisual,
    "HeadlessVisual": LazyHeadlessVisual,
    "VisualBuilderVisual": LazyVisualBuilderVisual,
    "IntegrationsVisual": LazyIntegrationsVisual,
    "GeniusVisual": LazyGeniusVisual,
};

export function VisualBuilderVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8 bg-slate-950/50">
            {/* Mock Editor Window */}
            <div className="relative w-full h-full bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="h-10 bg-slate-950 border-b border-white/5 flex items-center justify-between px-3 shrink-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        <span className="text-xs text-slate-400 font-mono">/home</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-5 px-2 bg-slate-800 rounded text-[10px] text-slate-400 flex items-center">Draft</div>
                        <div className="h-5 px-2 bg-purple-600 rounded text-[10px] text-white flex items-center">Publish</div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden relative">
                    {/* Left Sidebar (Components) */}
                    <div className="w-16 lg:w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-3 gap-3 shrink-0 z-10">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>

                        {/* Draggable Component Icons */}
                        {["Hero", "Text", "Image", "Grid"].map((item, i) => (
                            <div key={item} className="w-12 h-10 lg:w-14 lg:h-12 rounded bg-slate-900 border border-white/5 flex flex-col items-center justify-center gap-1 hover:border-purple-500/30 transition-colors group cursor-grab">
                                <div className={`w-6 h-1 rounded-full ${i === 0 ? 'bg-slate-600' : i === 1 ? 'bg-slate-700 w-4' : 'bg-slate-700'}`} />
                                <span className="text-[8px] text-slate-400 group-hover:text-slate-300">{item}</span>
                            </div>
                        ))}
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-slate-900 p-4 relative overflow-hidden flex flex-col gap-4">
                        {/* Dot Grid Background */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

                        {/* Real Header Image - Full Width */}
                        <motion.div
                            className="w-full relative group rounded-lg overflow-hidden border border-transparent hover:border-purple-500/30 transition-colors shrink-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="relative h-24 w-full">
                                <Image
                                    src="/visuals/nano-header-flat.jpg"
                                    alt="Header"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg font-medium transition-all">Header</div>
                        </motion.div>

                        {/* Feature Cards Grid - Two Separate Images */}
                        <div className="grid grid-cols-2 gap-4 w-full h-28 shrink-0">
                            <motion.div
                                className="w-full h-full relative group rounded-lg overflow-hidden border border-transparent hover:border-slate-500/30 transition-colors bg-slate-900/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Image
                                    src="/visuals/nano-feature-card-1.jpg"
                                    alt="Feature 1"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 200px"
                                    className="object-cover"
                                />
                                <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-slate-700 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg font-medium transition-all">Card</div>
                            </motion.div>

                            <motion.div
                                className="w-full h-full relative group rounded-lg overflow-hidden border border-transparent hover:border-slate-500/30 transition-colors bg-slate-900/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Image
                                    src="/visuals/nano-feature-card-2.jpg"
                                    alt="Feature 2"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 200px"
                                    className="object-cover"
                                />
                                <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-slate-700 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg font-medium transition-all">Card</div>
                            </motion.div>
                        </div>


                        {/* Simulated Dragged Block - "Pricing Table" - True Drag & Drop */}
                        <motion.div
                            className="absolute z-50 w-32 h-10 bg-slate-800 rounded border-2 border-purple-500 shadow-2xl flex items-center justify-center gap-2 pointer-events-none"
                            animate={{
                                x: [20, 60, 100, 120, 120],
                                y: [170, 175, 185, 195, 195],
                                opacity: [1, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.3, 0.6, 0.9, 1],
                                ease: "easeOut"
                            }}
                        >
                            <span className="text-[10px] text-white font-medium">Pricing Table</span>
                            <svg className="absolute -bottom-3 -right-3 w-4 h-4 fill-white drop-shadow-md" viewBox="0 0 24 24">
                                <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" stroke="black" strokeWidth="1" />
                            </svg>
                        </motion.div>

                        {/* Pricing Table - Appears Instantly on Drop */}
                        <motion.div
                            className="w-full bg-slate-900 border border-purple-500/40 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-purple-500/20"
                            animate={{
                                height: ["0px", "0px", "0px", "80px", "80px", "0px"],
                                opacity: [0, 0, 0, 1, 1, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                times: [0, 0.25, 0.33, 0.34, 0.85, 1],
                                ease: "linear"
                            }}
                        >
                            {/* Pricing Content - Shows Immediately */}
                            <div className="grid grid-cols-3 gap-2 w-full p-2">
                                {/* Free */}
                                <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-white/5">
                                    <span className="text-[7px] text-slate-400 uppercase font-semibold tracking-wider">Free</span>
                                    <span className="text-sm font-bold text-white mt-0.5">$0</span>
                                    <div className="w-full space-y-0.5 mt-1">
                                        <div className="h-0.5 bg-slate-700 rounded-full w-full" />
                                        <div className="h-0.5 bg-slate-700 rounded-full w-3/4" />
                                    </div>
                                </div>

                                {/* Basic */}
                                <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-white/5 relative">
                                    <span className="text-[7px] text-slate-400 uppercase font-semibold tracking-wider">Basic</span>
                                    <span className="text-sm font-bold text-white mt-0.5">$50</span>
                                    <div className="w-full space-y-0.5 mt-1">
                                        <div className="h-0.5 bg-slate-700 rounded-full w-full" />
                                        <div className="h-0.5 bg-slate-700 rounded-full w-3/4" />
                                    </div>
                                </div>

                                {/* Pro */}
                                <div className="bg-purple-500/10 rounded-lg p-2 flex flex-col items-center border border-purple-500/30 relative">
                                    <div className="absolute -top-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-[5px] text-white font-bold px-1.5 py-0 rounded-full">POPULAR</div>
                                    <span className="text-[7px] text-purple-200 uppercase font-semibold tracking-wider mt-0.5">Pro</span>
                                    <span className="text-sm font-bold text-white mt-0.5">$800</span>
                                    <div className="w-full space-y-0.5 mt-1">
                                        <div className="h-0.5 bg-purple-400/20 rounded-full w-full" />
                                        <div className="h-0.5 bg-purple-400/20 rounded-full w-3/4" />
                                        <div className="h-0.5 bg-purple-400/20 rounded-full w-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}



export function GeniusVisual() {
    const [stage, setStage] = useState<"typing" | "generating" | "preview">("typing");
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        if (stage === "generating") {
            const timeout = setTimeout(() => {
                setStage("preview");
            }, 800);
            return () => clearTimeout(timeout);
        }
        if (stage === "preview") {
            const timeout = setTimeout(() => {
                setStage("typing");
                setCycle(c => c + 1);
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [stage]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-slate-950/50 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />

            <div className="relative z-10 w-full max-w-md h-64 flex items-center justify-center">
                {/* Prompt Interface */}
                <motion.div
                    key={`prompt-${cycle}`}
                    className="bg-slate-900 border border-white/10 rounded-xl p-4 shadow-2xl w-full absolute"
                    initial={{ opacity: 1, scale: 1, y: 0 }}
                    animate={stage === "preview" ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Genius Architect</span>
                    </div>

                    <div className="h-10 bg-slate-950 rounded-lg border border-white/5 flex items-center px-3 overflow-hidden relative">
                        <motion.span
                            className="text-slate-200 text-sm whitespace-nowrap font-mono"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "linear", delay: 0.5, onComplete: () => setStage("generating") }}
                            style={{ overflow: "hidden", display: "block" }}
                        >
                            Build a magnificent SaaS landing page...
                        </motion.span>
                        <motion.div
                            className="absolute right-3 top-2.5 w-1.5 h-5 bg-purple-500/50"
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            style={{ display: stage === "typing" ? "block" : "none" }}
                        />
                    </div>
                </motion.div>

                {/* Website Preview Window */}
                <motion.div
                    key={`preview-${cycle}`}
                    className="w-full aspect-[4/3] bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden flex flex-col absolute"
                    initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                    animate={stage === "preview" ? { scale: 1, opacity: 1, rotateX: 0 } : { scale: 0.8, opacity: 0, rotateX: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                >
                    {/* Simulated Browser Header */}
                    <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-3 gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>

                    {/* Simulated Content Building Up */}
                    <div className="flex-1 p-4 space-y-3 bg-slate-950 relative">
                        {/* Header */}
                        <motion.div
                            className="h-6 w-full bg-white/5 rounded flex items-center justify-between px-3"
                            initial={{ opacity: 0, y: -10 }}
                            animate={stage === "preview" ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="w-6 h-3 bg-white/10 rounded" />
                            <div className="flex gap-2">
                                <div className="w-8 h-3 bg-white/10 rounded" />
                                <div className="w-8 h-3 bg-white/10 rounded" />
                            </div>
                        </motion.div>

                        {/* Hero */}
                        <motion.div
                            className="h-28 w-full bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/10 flex flex-col items-center justify-center gap-2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={stage === "preview" ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="w-3/4 h-3 bg-white/10 rounded" />
                            <div className="w-1/2 h-2 bg-white/5 rounded" />
                            <div className="mt-2 w-20 h-5 bg-purple-500/20 rounded-md border border-purple-500/30" />
                        </motion.div>

                        {/* Cards */}
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="h-16 bg-white/5 rounded border border-white/5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={stage === "preview" ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export function IntegrationsVisual() {
    const INNER_ICONS = [
        { name: "Twitter", url: "/icons/x-twitter.png" },
        { name: "LinkedIn", url: "/icons/linkedin.svg" },
        { name: "Slack", url: "/icons/slack.svg" },
        { name: "Zapier", url: "/icons/zapier.png" },
        { name: "Meta", url: "/icons/meta.png" },
    ];

    const OUTER_ICONS = [
        { name: "OpenAI", url: "https://avatars.githubusercontent.com/u/14957082?s=48&v=4" },
        { name: "Shopify", url: "/icons/shopify.png" },
        { name: "Gemini", url: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" },
        { name: "WordPress", url: "/icons/wordpress.png" },
        { name: "Anthropic", url: "/icons/claude.png" },
        { name: "WooCommerce", url: "/icons/woocommerce.png" },
        { name: "Bedrock", url: "https://avatars.githubusercontent.com/u/2232217?s=48&v=4" },
        { name: "DeepSeek", url: "https://avatars.githubusercontent.com/u/148330874?s=48&v=4" },
    ];

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950/50">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_60%)]" />

            {/* Central Hub - Ledger1CMS Logo */}
            <motion.div
                className="w-24 h-24 bg-slate-900 rounded-3xl border-2 border-white/10 flex items-center justify-center relative z-20 shadow-[0_0_30px_rgba(168,85,247,0.2)] p-4"
                animate={{
                    boxShadow: ["0 0 30px rgba(168,85,247,0.2)", "0 0 60px rgba(168,85,247,0.4)", "0 0 30px rgba(168,85,247,0.2)"],
                    border: ["1px solid rgba(255,255,255,0.1)", "1px solid rgba(168,85,247,0.5)", "1px solid rgba(255,255,255,0.1)"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                <div className="relative w-full h-full">
                    <Image
                        src="/ledger1-cms-logo.png"
                        alt="Ledger1CMS"
                        fill
                        className="object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    />
                </div>
            </motion.div>

            {/* Inner Ring */}
            <div className="absolute w-[190px] h-[190px]">
                <motion.div
                    className="w-full h-full rounded-full border border-white/5 absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                    {INNER_ICONS.map((icon, i) => {
                        const angle = (i / INNER_ICONS.length) * 360;
                        return (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 flex items-center justify-center pointer-events-none"
                                style={{
                                    transform: `rotate(${angle}deg) translate(95px)`
                                }}
                            >
                                <motion.div
                                    className="w-full h-full bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1.5 pointer-events-auto"
                                    animate={{ rotate: [-angle, -angle - 360] }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={icon.url}
                                            alt={icon.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Outer Ring */}
            <div className="absolute w-[300px] h-[300px]">
                <motion.div
                    className="w-full h-full rounded-full border border-dashed border-white/5 absolute inset-0"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                    {OUTER_ICONS.map((icon, i) => {
                        const angle = (i / OUTER_ICONS.length) * 360;
                        return (
                            <motion.div
                                key={i}
                                className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center p-1.5"
                                style={{
                                    transform: `rotate(${angle}deg) translate(150px)`
                                }}
                            >
                                <motion.div
                                    className="w-full h-full bg-slate-900 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                                    animate={{ rotate: [-angle, -angle + 360] }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="w-full h-full relative">
                                        <Image
                                            src={icon.url}
                                            alt={icon.name}
                                            fill
                                            className={`object-contain rounded-lg ${icon.name === "WordPress" ? "brightness-0 invert" : ""}`}
                                            unoptimized
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Connecting Lines / Pulse Effect */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <circle cx="50%" cy="50%" r="95" fill="none" stroke="url(#gradient-inner)" strokeWidth="1" />
                <circle cx="50%" cy="50%" r="150" fill="none" stroke="url(#gradient-outer)" strokeWidth="1" strokeDasharray="4 4" />
                <defs>
                    <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(168,85,247,0)" />
                        <stop offset="50%" stopColor="rgba(168,85,247,0.5)" />
                        <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                    </linearGradient>
                    <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(56,189,248,0)" />
                        <stop offset="50%" stopColor="rgba(56,189,248,0.5)" />
                        <stop offset="100%" stopColor="rgba(56,189,248,0)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
