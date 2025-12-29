
"use client";

import { Check, Minus } from "lucide-react";

export default function PricingComparisonTable() {
    const features = [
        { name: "Content Records (Pages/Posts)", starter: "50", growth: "1,000", scale: "Unlimited" },
        { name: "Locales (Languages)", starter: "1 (Default)", growth: "3", scale: "Unlimited" },
        { name: "Media Storage", starter: "500 MB", growth: "10 GB", scale: "Unlimited" },

        { name: "AI Text Enrichment", starter: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, growth: "500 / mo", scale: "Unlimited" },
        { name: "AI Image Generation", starter: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, growth: "100 / mo", scale: "Unlimited" },

        { name: "Echo AI Agent", starter: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, growth: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, scale: "✓ Custom Access" },
        { name: "Content API Limit", starter: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, growth: "10k calls / mo", scale: "Unlimited" },

        { name: "Workflow Automation", starter: <Minus className="text-slate-600 w-5 h-5 mx-auto" />, growth: <Check className="text-green-400 w-5 h-5 mx-auto" />, scale: <Check className="text-green-400 w-5 h-5 mx-auto" /> },
        { name: "Users", starter: "1", growth: "5", scale: "Unlimited" },
        { name: "Support", starter: "Community", growth: "Standard", scale: "Priority & SLA" },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-20 p-6 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-4 px-6 text-slate-400 font-medium">Feature</th>
                            <th className="py-4 px-6 text-center font-bold text-white">Starter</th>
                            <th className="py-4 px-6 text-center font-bold text-purple-400">Growth</th>
                            <th className="py-4 px-6 text-center font-bold text-amber-400">Scale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 text-slate-300 font-medium">{feature.name}</td>
                                <td className="py-4 px-6 text-center text-slate-400">{feature.starter}</td>
                                <td className="py-4 px-6 text-center text-white font-medium bg-purple-500/5">{feature.growth}</td>
                                <td className="py-4 px-6 text-center text-white font-medium bg-amber-500/5">{feature.scale}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
