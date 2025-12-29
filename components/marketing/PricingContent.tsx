
"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Building2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingComparisonTable from "@/components/marketing/PricingComparisonTable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tiers = [
    {
        name: "Starter",
        price: "Free",
        description: "Perfect for hobbyists and personal portfolios.",
        features: [
            "1 User Seat",
            "50 Content Records",
            "500MB Media Storage",
            "Community Support",
            "No API Access"
        ],
        icon: Sparkles,
        color: "bg-blue-500",
        gradient: "from-blue-500 to-cyan-400",
        cta: "Start Free",
        popular: false,
    },
    {
        name: "Growth",
        price: "$29",
        period: "/mo",
        description: "Scale your content operations with AI.",
        features: [
            "5 User Seats",
            "500 AI Text Enhancements/mo",
            "100 AI Image Generations/mo",
            "1,000 Content Records",
            "10GB Media Storage",
            "Priority Support",
        ],
        icon: Zap,
        color: "bg-purple-500",
        gradient: "from-purple-500 to-pink-500",
        cta: "Get Started",
        popular: true,
    },
    {
        name: "Scale",
        price: "Custom",
        description: "For organizations requiring maximum power.",
        features: [
            "Unlimited Users",
            "Echo AI Agent Access",
            "Unlimited Generations",
            "Dedicated Infrastructure",
            "SSO & Advanced Security",
            "Source Code License Option",
        ],
        icon: Building2,
        color: "bg-amber-500",
        gradient: "from-amber-500 to-orange-500",
        cta: "Contact Sales",
        popular: false,
    },
];

export default function PricingContent() {
    return (
        <main className="relative z-10 pt-32 pb-20">
            {/* HERO */}
            <div className="text-center mb-20 px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent"
                >
                    Simple, Transparent Pricing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto"
                >
                    Start free and scale as you grow. Pay only for the power you need.
                </motion.p>
            </div>

            {/* PRICING CARDS */}
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className={`relative group rounded-3xl p-1 ${tier.popular ? 'bg-gradient-to-b from-purple-500/50 to-purple-900/10' : 'bg-white/5'} hover:scale-105 transition-transform duration-300`}
                        >
                            {/* Card Content Wrapper */}
                            <div className="h-full bg-slate-950/90 backdrop-blur-xl rounded-[22px] p-8 flex flex-col border border-white/5 relative overflow-hidden">
                                {tier.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                {/* Header */}
                                <div className="mb-6">
                                    <div className={`w-12 h-12 rounded-xl ${tier.color} bg-opacity-20 flex items-center justify-center mb-4 text-white`}>
                                        <tier.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                                    <p className="text-slate-400 text-sm mt-2">{tier.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-8 items-baseline flex">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.period && <span className="text-slate-500 ml-1">{tier.period}</span>}
                                </div>

                                {/* Features */}
                                <ul className="flex-1 space-y-4 mb-8">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <div className={`w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    className={`w-full rounded-full h-12 font-medium transition-all ${tier.popular
                                        ? `bg-gradient-to-r ${tier.gradient} hover:opacity-90 text-white shadow-lg shadow-purple-500/25`
                                        : 'bg-white text-slate-950 hover:bg-slate-200'
                                        }`}
                                >
                                    {tier.cta}
                                </Button>

                                {/* Overage Note for Growth */}
                                {tier.name === "Growth" && (
                                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500 flex items-center gap-2 justify-center">
                                        <Info className="w-3 h-3" />
                                        <span>Additional overages billed per usage</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* COMPARISON TABLE */}
            <PricingComparisonTable />

        </main>
    );
}
