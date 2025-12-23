"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface InteractiveBackgroundProps {
    variant?: "default" | "blue" | "gold" | "emerald";
}

export default function InteractiveBackground({
    variant = "default"
}: InteractiveBackgroundProps) {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

    // Smoother scroll spring
    const smoothScrollY = useSpring(scrollY, {
        stiffness: 50,
        damping: 20,
        mass: 0.5
    });

    // Parallax transforms - different speeds for different layers
    // Negative values move up as you scroll down (standard parallax)
    const y1 = useTransform(smoothScrollY, [0, 1000], [0, -200]);   // Slowest
    const y2 = useTransform(smoothScrollY, [0, 1000], [0, -400]);   // Medium
    const y3 = useTransform(smoothScrollY, [0, 1000], [0, -100]);   // Slow

    const themes = {
        default: "from-purple-500/10 via-blue-500/10 to-transparent",
        blue: "from-cyan-500/10 via-blue-500/10 to-transparent",
        gold: "from-amber-500/10 via-orange-500/10 to-transparent",
        emerald: "from-emerald-500/10 via-green-500/10 to-transparent",
    };

    const gradientClass = themes[variant] || themes.default;

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-full h-full bg-[#020617]">
            {/* Base static gradient for depth */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50`} />

            {/* Parallax Layers - "Blurred Dots" - DISTINCT SHAPES */}
            
            {/* Layer 1: Purple (Top Left) - Moved CLEAR of header */}
            <motion.div 
                style={{ y: y1 }}
                className="absolute top-[120px] left-[5%] w-[400px] h-[400px] rounded-full bg-purple-600/40 blur-[60px]"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Layer 2: Blue (Center/Right) - Distinct Orb */}
            <motion.div 
                style={{ y: y2 }}
                className="absolute top-[180px] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-600/40 blur-[60px]" 
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Layer 3: Indigo (Bottom Left) */}
            <motion.div 
                style={{ y: y3 }}
                className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/30 blur-[80px]"
                animate={{
                    scale: [1, 1.15, 1],
                    x: [0, -30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Optional SVG overlay for subtle texture */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </div>
    );
}
