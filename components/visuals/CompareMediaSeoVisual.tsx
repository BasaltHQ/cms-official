"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles, Image as ImageIcon, FileVideo, Globe, CheckCircle, Search } from "lucide-react";

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

export function CompareMediaSeoVisual() {
    return (
        <div className="w-full h-full bg-[#0a0a00] relative overflow-hidden flex flex-col items-center justify-between pb-10 pt-10">

            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-900/5 to-black pointer-events-none" />

            {/* Google Core - Raised Container */}
            <div className="relative z-30 flex flex-col items-center -mt-4">
                <div className="relative flex items-center justify-center w-[800px] h-[140px]">

                    {/* GOOGLE NANO BANANA (Left Side) - Centered & Widened */}
                    <div className="absolute right-[calc(50%+75px)] top-1/2 -translate-y-1/2 w-96 text-right">
                        <motion.h2
                            className="text-2xl font-black italic tracking-tighter leading-none"
                            style={{
                                backgroundImage: "linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundSize: "200% 100%"
                            }}
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            GOOGLE <br /> NANO BANANA
                        </motion.h2>
                    </div>

                    {/* Center Core */}
                    <div className="relative z-10 mx-6">
                        {/* Ring Pulse */}
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-white/5"
                            animate={{ scale: [1, 1.25, 1], borderColor: ["rgba(66, 133, 244, 0.2)", "rgba(52, 168, 83, 0.2)", "rgba(251, 188, 5, 0.2)", "rgba(234, 67, 53, 0.2)"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="w-24 h-24 bg-white/5 rounded-full backdrop-blur-md flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(66,133,244,0.15)]"
                            animate={{ boxShadow: ["0 0 30px rgba(66,133,244,0.15)", "0 0 30px rgba(52,168,83,0.15)", "0 0 30px rgba(251,188,5,0.15)", "0 0 30px rgba(234,67,53,0.15)"] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        >
                            <GoogleIcon />
                        </motion.div>
                    </div>

                    {/* SEO EVERYTHING Text (Right Side) - Centered & Widened */}
                    <div className="absolute left-[calc(50%+75px)] top-1/2 -translate-y-1/2 w-96">
                        <motion.h2
                            className="text-2xl font-black italic tracking-tighter leading-none"
                            animate={{
                                color: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"],
                                textShadow: [
                                    "0 0 10px rgba(66,133,244,0.5)",
                                    "0 0 10px rgba(234,67,53,0.5)",
                                    "0 0 10px rgba(251,188,5,0.5)",
                                    "0 0 10px rgba(52,168,83,0.5)"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        >
                            SEO <br /> EVERYTHING!
                        </motion.h2>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <Search className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">Speed Indexer Active</span>
                </div>
            </div>

            {/* Connection Beams - Dynamic Data Flow */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <svg className="w-full h-full opacity-60">
                    <defs>
                        <linearGradient id="beamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="50%" stopColor="#4285F4" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    {[
                        "M20% 75% Q 30% 45%, 48% 30%", // Left Item -> Core
                        "M50% 75% L 50% 30%",          // Center Item -> Core
                        "M80% 75% Q 70% 45%, 52% 30%"  // Right Item -> Core
                    ].map((path, i) => (
                        <g key={i}>
                            <path d={path} stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
                            <motion.path
                                d={path}
                                stroke={`url(#beamGrad)`}
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="10 100"
                                animate={{ strokeDashoffset: [100, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                                style={{ stroke: GOOGLE_COLORS[i % 4] }}
                            />
                            <motion.circle
                                r="3"
                                fill="white"
                                style={{ offsetPath: `path('${path}')` }}
                                animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: i * 0.3 }}
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* Media Items - Full Width Spread & Larger - STRICTLY ALIGNED ROW */}
            <div className="flex justify-between w-full max-w-2xl px-4 z-30 pt-4 items-end">
                {/* Image Card */}
                <motion.div
                    className="w-40 h-52 bg-[#1a1a1e] rounded-xl border border-white/10 flex flex-col relative overflow-hidden group shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex-1 relative overflow-hidden">
                        <Image src="/visuals/seo-hero.jpg" alt="Hero" fill sizes="160px" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent" />
                    </div>
                    <div className="h-10 border-t border-white/5 bg-[#121215] flex items-center justify-between px-3 relative">
                        <span className="text-[10px] font-mono text-gray-400">Hero_Img.webp</span>
                        <div className="w-2 h-2 rounded-full bg-[#4285F4] shadow-[0_0_8px_#4285F4]" />
                        <motion.div
                            className="absolute top-0 left-0 right-0 h-[1px] bg-[#4285F4]"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* Video Card - ALIGNED */}
                <motion.div
                    className="w-40 h-52 bg-[#1a1a1e] rounded-xl border border-white/10 flex flex-col relative overflow-hidden group shadow-2xl z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex-1 relative overflow-hidden bg-black">
                        <Image src="/visuals/seo-demo.jpg" alt="Demo Video" fill sizes="160px" className="object-cover opacity-90" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center pl-1"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent" />
                            </motion.div>
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-pulse" />
                            <span className="text-[8px] text-white/80 font-bold tracking-wider">LIVE</span>
                        </div>
                    </div>
                    <div className="h-1 bg-white/10 w-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#EA4335]"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <div className="h-10 bg-[#121215] flex items-center justify-between px-3">
                        <span className="text-[10px] font-mono text-gray-400">Demo.mp4</span>
                        <FileVideo className="w-3.5 h-3.5 text-[#EA4335]" />
                    </div>
                </motion.div>

                {/* Landing Page Card */}
                <motion.div
                    className="w-40 h-52 bg-[#1a1a1e] rounded-xl border border-white/10 flex flex-col relative overflow-hidden group shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex-1 relative overflow-hidden">
                        <Image src="/visuals/seo-landing.jpg" alt="Landing" fill sizes="160px" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="h-10 border-t border-white/5 bg-[#121215] flex items-center justify-between px-3 relative">
                        <span className="text-[10px] font-mono text-gray-400">Landing</span>
                        <div className="w-2 h-2 rounded-full bg-[#34A853] shadow-[0_0_8px_#34A853]" />
                        <motion.div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#34A853] text-black text-[8px] font-bold px-2 py-0.5 rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            INDEXED
                        </motion.div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
