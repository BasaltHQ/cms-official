"use client";

import React, { useState, useEffect } from "react";
import { Globe, Languages, Search, Zap, LayoutTemplate, ShieldCheck, Target, TrendingUp, Clock, HeartHandshake } from "lucide-react";

type FeatureKey = "personalization" | "seo" | "localization" | "compliance";

interface AiFeature {
    id: FeatureKey;
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    borderColor: string;
    shadowColor: string;
    bgGradient: string;
}

const FEATURES: AiFeature[] = [
    {
        id: "personalization",
        icon: Target,
        label: "Personalization",
        description: "Instantly adapts landing pages and recommendations based on visitor behavior without manual tagging.",
        color: "text-blue-400",
        borderColor: "border-blue-500",
        shadowColor: "shadow-blue-500/50",
        bgGradient: "from-blue-500/20"
    },
    {
        id: "seo",
        icon: TrendingUp,
        label: "SEO Engine",
        description: "Automatically generates schema markup, meta tags, and internal linking structures for high ranking.",
        color: "text-emerald-400",
        borderColor: "border-emerald-500",
        shadowColor: "shadow-emerald-500/50",
        bgGradient: "from-emerald-500/20"
    },
    {
        id: "localization",
        icon: Globe,
        label: "Localization",
        description: "Translates and localizes content for global markets instantly while maintaining brand voice.",
        color: "text-amber-400",
        borderColor: "border-amber-500",
        shadowColor: "shadow-amber-500/50",
        bgGradient: "from-amber-500/20"
    },
    {
        id: "compliance",
        icon: ShieldCheck,
        label: "Compliance",
        description: "Scans all published content for industry-specific compliance issues (HIPAA, FINRA) before live.",
        color: "text-purple-400",
        borderColor: "border-purple-500",
        shadowColor: "shadow-purple-500/50",
        bgGradient: "from-purple-500/20"
    }
];

export function AiCapabilitiesVisual() {
    const [activeFeature, setActiveFeature] = useState<FeatureKey>("personalization");
    const [isHovering, setIsHovering] = useState(false);

    // Auto-cycle through features
    useEffect(() => {
        if (isHovering) return;

        const interval = setInterval(() => {
            setActiveFeature(current => {
                const currentIndex = FEATURES.findIndex(f => f.id === current);
                const nextIndex = (currentIndex + 1) % FEATURES.length;
                return FEATURES[nextIndex].id;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovering]);

    const activeIndex = FEATURES.findIndex(f => f.id === activeFeature);

    return (
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: INTERACTIVE VISUAL HUB */}
            <div
                className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center p-8 group/hub"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Background Grid & Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_100%,transparent_100%)] opacity-50" />
                <div className={`absolute inset-0 bg-gradient-to-tr transition-opacity duration-1000 opacity-20 ${FEATURES[activeIndex].bgGradient} to-transparent`} />

                {/* Orbital Paths */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[300px] h-[300px] rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />
                    <div className="absolute w-[200px] h-[200px] rounded-full border border-white/5 animate-[spin_40s_linear_infinite_reverse]" />
                </div>

                {/* CENTRAL CORE */}
                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-black/80 border border-white/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                        {/* Core Pulse */}
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${FEATURES[activeIndex].bgGradient.replace('from-', 'bg-')}`} />
                        <Zap className={`w-10 h-10 transition-colors duration-500 ${FEATURES[activeIndex].color}`} />

                        {/* Spinning Rings */}
                        <div className={`absolute inset-[-8px] rounded-full border-2 border-dashed border-transparent border-t-white/30 border-r-white/30 animate-[spin_3s_linear_infinite]`} />
                    </div>
                </div>

                {/* RELATIVE NODES (ORBITING) */}
                {FEATURES.map((feature, idx) => {
                    // Position calculations (Static layout for stability, visual flair via CSS)
                    // We'll place them at compass points
                    const positions = [
                        'top-1/2 left-8 -translate-y-1/2',    // West
                        'top-8 left-1/2 -translate-x-1/2',    // North
                        'top-1/2 right-8 -translate-y-1/2',   // East
                        'bottom-8 left-1/2 -translate-x-1/2'  // South
                    ];

                    const isActive = activeFeature === feature.id;

                    return (
                        <div
                            key={feature.id}
                            className={`absolute ${positions[idx]} transition-all duration-500 cursor-pointer z-20`}
                            onClick={() => setActiveFeature(feature.id)}
                            onMouseEnter={() => setActiveFeature(feature.id)}
                        >
                            <div className={`
                                flex flex-col items-center gap-2 transition-all duration-300
                                ${isActive ? 'scale-110' : 'scale-100 opacity-70 hover:opacity-100'}
                            `}>
                                <div className={`
                                    w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-500
                                    ${isActive
                                        ? `bg-black/80 ${feature.borderColor} ${feature.shadowColor} shadow-[0_0_30px_rgba(0,0,0,0.5)]`
                                        : 'bg-white/5 border-white/10 hover:border-white/30'}
                                `}>
                                    <feature.icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? feature.color : 'text-slate-400'}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                    {feature.label}
                                </span>
                            </div>

                            {/* Connection Beam to Core */}
                            <div className={`
                                absolute top-1/2 left-1/2 w-[120px] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 origin-left
                                transition-all duration-500 opacity-0
                                ${isActive ? 'opacity-100' : ''}
                            `}
                                style={{
                                    transform: `rotate(${idx * 90 + 180}deg) translateX(30px)`, // Rough approximation, better with SVG but this works for "Hub" feel 
                                    width: '100px'
                                }}
                            />
                        </div>
                    );
                })}
            </div>


            {/* RIGHT: FEATURE LIST (SYNCED) */}
            <div className="space-y-4">
                {FEATURES.map((feature) => {
                    const isActive = activeFeature === feature.id;
                    return (
                        <div
                            key={feature.id}
                            className={`
                                group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden
                                ${isActive
                                    ? `bg-white/5 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.2)]`
                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}
                            `}
                            onClick={() => setActiveFeature(feature.id)}
                        >
                            {/* Active Side Indicator */}
                            {isActive && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${feature.bgGradient.replace('from-', 'bg-')}`} />
                            )}

                            <div className="flex items-start gap-4 relaitve z-10">
                                <div className={`
                                    p-3 rounded-lg bg-white/5 border border-white/5 transition-colors duration-300
                                    ${isActive ? feature.color : 'text-slate-400 group-hover:text-slate-300'}
                                `}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                        {feature.label}
                                    </h3>
                                    <p className={`text-sm leading-relaxed transition-colors duration-300 ${isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
