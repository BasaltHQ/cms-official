"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

import SecondaryNavbar from "./SecondaryNavbar";

/**
 * Public marketing navbar used across marketing pages.
 * Universal sticky header with mobile menu overlay.
 */
// Social link config
interface SocialSettings {
    xTwitterUrl?: string | null;
    discordUrl?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    youtubeUrl?: string | null;
    // Add others if needed for header, but these are the ones used
    [key: string]: any;
}

interface MarketingHeaderProps {
    socialSettings?: SocialSettings | null;
}

export default function MarketingHeader({ socialSettings }: MarketingHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // ... (rest of state logic) ...

    // Defined inside component to access props, or could be passed down
    const socialLinks = [
        { url: socialSettings?.xTwitterUrl, label: "X (Twitter)", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg> },
        { url: socialSettings?.discordUrl, label: "Discord", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /><path d="M7.5 7.5c3.5-1 5.5-1 9 0" /><path d="M7 16.5c3.5 1 5.5 1 9 0" /><path d="M15.5 17c0-1.5.5-2 1.5-2s1.5.5 1.5 2" /><path d="M8.5 17c0-1.5-.5-2-1.5-2s-1.5.5-1.5 2" /></svg> },
        { url: socialSettings?.linkedinUrl, label: "LinkedIn", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> },
        { url: socialSettings?.githubUrl, label: "GitHub", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg> },
        { url: socialSettings?.youtubeUrl, label: "YouTube", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg> },
    ].filter(link => link.url); // Only show links that exist

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },

        { label: "FAQ", href: "/faq" },
        { label: "Blog", href: "/blog" },
        { label: "Support", href: "/support" },
    ];

    return (
        <>
            <div
                suppressHydrationWarning
                className={cn(
                    "fixed top-0 left-0 right-0 z-[999] flex flex-col w-full transition-all duration-300",
                    isScrolled ? "bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/10 shadow-lg pb-2" : "bg-transparent pb-0"
                )}>
                {/* Secondary Navbar - Transitions height/opacity on scroll if desired, or stays. 
                    Let's keep it visible but maybe smaller padding? 
                    Actually standard pattern: Secondary often hides or integrates. 
                    For now, let's keep it simply stacked.
                */}
                <div suppressHydrationWarning className={cn("transition-all duration-300", isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto")}>
                    <SecondaryNavbar />
                </div>

                <header className={cn(
                    "flex items-center w-full transition-all duration-300",
                    isScrolled ? "h-16" : "h-20"
                )}>
                    <div className="w-full flex items-center justify-between h-full px-4 lg:container lg:mx-auto lg:px-6">
                        {/* Logo */}
                        <Link className="flex items-center justify-center z-50 relative" href="/" aria-label="BasaltCMS Home">
                            <Image
                                src="/basalt-cms-wide-white.png"
                                alt="BasaltCMS Logo"
                                width={225}
                                height={63}
                                className={cn("object-contain transition-all duration-300", isScrolled ? "h-10 w-auto" : "h-12 w-auto", "brightness-200 contrast-125")}
                                priority
                                sizes="(max-width: 768px) 140px, 180px"
                                quality={85}
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    href={link.href}
                                    prefetch={false}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            <Link href="/cms/login" prefetch={false}>
                                <Button variant="ghost" size={isScrolled ? "sm" : "default"} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/create-account" prefetch={false}>
                                <Button variant="glow" size={isScrolled ? "sm" : "default"} className="px-6">
                                    Get Started
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden z-50 relative text-white p-2 flex-shrink-0"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </header>


            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-[#0F0F1A] z-[998] flex flex-col pt-24 px-6 pb-8 lg:hidden overflow-y-auto">
                    <nav className="flex flex-col gap-6 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                prefetch={false}
                                className="text-2xl font-medium text-gray-300 hover:text-white transition-colors w-full text-center py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="w-full h-px bg-white/10 my-4" />
                        <Link href="/cms/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)} prefetch={false}>
                            <Button variant="ghost" className="w-full text-lg h-12 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/50 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                                Login
                            </Button>
                        </Link>
                        <Link href="/create-account" className="w-full" onClick={() => setIsMobileMenuOpen(false)} prefetch={false}>
                            <Button variant="glow" className="w-full text-lg h-12">
                                Get Started
                            </Button>
                        </Link>
                    </nav>

                    {/* Mobile Social Icons */}
                    <div className="mt-auto pt-12 flex justify-center gap-8">
                        {/* X (Twitter) */}
                        {socialSettings?.xTwitterUrl && (
                            <a href={socialSettings.xTwitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow Basalt on X" className="text-white hover:text-white/90 hover:scale-110 transition-transform duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                            </a>
                        )}
                        {/* Discord */}
                        {socialSettings?.discordUrl && (
                            <a href={socialSettings.discordUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow Basalt on Discord" className="text-white hover:text-[#5865F2] hover:scale-110 transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 127.14 96.36" fill="currentColor">
                                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c2.36-24.44-2-47.27-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                </svg>
                            </a>
                        )}
                        {/* GitHub */}
                        {socialSettings?.githubUrl && (
                            <a href={socialSettings.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow Basalt on GitHub" className="text-white hover:text-[#8B5CF6] hover:scale-110 transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Spacer to prevent content overlap - Reduced padding */}
            <div className={cn("w-full transition-all duration-300", isScrolled ? "h-16" : "h-20")} />
        </>
    );
}
