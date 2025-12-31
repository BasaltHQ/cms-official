import type { Config } from "@measured/puck";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { AI_FIELD_RENDER, IconPickerField } from "./puck.fields";
import { ICON_MAP } from "@/lib/puck.icons";
import {
    getCommonStyleClasses,
    CommonStyleProps,
    spacingOptions,
    maxWidthOptions,
    minHeightOptions,
    lineHeightOptions,
    letterSpacingOptions,
    textColorOptions,
    layoutFields,
    spacingFields,
    backgroundFields,
    borderFields,
    animationFields,
    visibilityFields,
    typographyFields,
    getCommonInlineStyles,
    alignItemsOptions,
    justifyContentOptions,
} from "./puck.styling";

// Extended icon mapping


// Define the shape of our data
export type Props = {
    HeaderBlock: {
        logoText: string;
        logoImage?: string; // NEW
        links: { label: string; href: string }[];
        ctaText: string;
        ctaLink: string;
        fixed: "true" | "false";
        id?: string;
    };
    HeadingBlock: {
        title: string;
        align: "left" | "center" | "right";
        size: "sm" | "md" | "lg" | "xl";
        textColor?: string;
        lineHeight?: string;
        letterSpacing?: string;
        fontWeight?: string; // New
        textTransform?: string; // New
        textDecoration?: string; // New
        fontSize?: string; // New
    } & CommonStyleProps;
    TextBlock: {
        content: string;
        align: "left" | "center" | "right";
        textColor?: string;
        lineHeight?: string;
        maxWidth?: string;
        fontWeight?: string; // New
        textTransform?: string; // New
        textDecoration?: string; // New
        fontSize?: string; // New
    } & CommonStyleProps;
    ButtonBlock: {
        text: string;
        variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
        url?: string;
        size: "default" | "sm" | "lg";
        align: "left" | "center" | "right";
        borderRadius: "none" | "sm" | "md" | "lg" | "full";
        shadow: "none" | "sm" | "md" | "lg";
        fullWidth: boolean;
        hoverEffect?: "none" | "glow" | "scale" | "lift";
        className?: string;
        fontWeight?: string; // New
        textTransform?: string; // New
        textDecoration?: string; // New
        fontSize?: string; // New
    } & CommonStyleProps;
    TestimonialBlock: { quote: string; author: string; role: string; avatar: string } & CommonStyleProps;
    PricingBlock: {
        cards: {
            plan: string;
            price: string;
            frequency: string;
            description: string;
            features: string;
            buttonText: string;
            highlightColor: string;
            recommended: string;
            badgeText: string;
        }[];
        columns?: "1" | "2" | "3" | "4";
    } & CommonStyleProps;
    HeroBlock: {
        title: string;
        subtitle: string;
        bgImage?: string;
        primaryAction?: string;
        primaryActionUrl?: string; // NEW
        secondaryAction?: string;
        secondaryActionUrl?: string; // NEW
        overlayOpacity?: string;
        align?: string;
        minHeight?: string;
        overlayGradient?: string;
    } & CommonStyleProps;
    CardBlock: { title: string; content: string; icon?: string; hoverEffect?: "none" | "lift" | "glow" } & CommonStyleProps;
    FeaturesGridBlock: { title: string; features: { title: string; description: string; icon: string }[]; columns?: "2" | "3" | "4" } & CommonStyleProps;
    FaqBlock: { items: { question: string; answer: string }[] } & CommonStyleProps;
    ColumnsBlock: { leftContent: string; rightContent: string } & CommonStyleProps;
    DividerBlock: { padding: "sm" | "md" | "lg"; style?: "solid" | "dashed" | "gradient"; id?: string };
    ImageBlock: { src: string; alt: string; height?: string; objectFit?: "cover" | "contain"; hoverZoom?: boolean } & CommonStyleProps;
    StatsBlock: { stats: { value: string; label: string }[] } & CommonStyleProps;
    ContainerBlock: {
        className: string;
        style: string;
        id: string;
        layout: "stack" | "row" | "grid-2" | "grid-3" | "grid-4";
        gap: "none" | "sm" | "md" | "lg";
        alignItems?: "start" | "center" | "end" | "stretch";
        justifyContent?: "start" | "center" | "end" | "between";
        maxWidth?: string;
    } & CommonStyleProps;
    CodeBlock: { code: string; id?: string };
    SpacerBlock: { height: string; id?: string };
    VideoBlock: { url: string; aspectRatio: "16:9" | "4:3" | "1:1"; autoplay: boolean } & CommonStyleProps;
    IconBlock: { icon: string; size: "sm" | "md" | "lg" | "xl"; color?: string } & CommonStyleProps;
    AnimationBlock: {
        svgCode: string;
        animationType: "none" | "animate-pulse" | "animate-spin" | "animate-bounce" | "animate-float" | "animate-wiggle" | "animate-ping";
        speed: string;
    } & CommonStyleProps;
    RichTextBlock: {
        content: string;
        className?: string;
    } & CommonStyleProps;
    // FLATSOME SUPPORT
    Section: {
        padding: string;
        backgroundColor?: string;
        content: React.ReactNode;
    } & CommonStyleProps;
    Button: {
        label: string;
        href: string;
        variant?: "default" | "outline" | "ghost" | "link";
    } & CommonStyleProps;
};

export const puckConfig: Config<Props> = {
    root: {
        fields: {
            title: { type: "custom", render: AI_FIELD_RENDER },
            font: {
                type: "select",
                label: "Primary Font",
                options: [
                    { label: "Inter (Default)", value: "Inter" },
                    { label: "Roboto", value: "Roboto" },
                    { label: "Lato", value: "Lato" },
                    { label: "Oswald", value: "Oswald" },
                    { label: "Playfair Display", value: "Playfair Display" },
                    { label: "Merriweather", value: "Merriweather" },
                    { label: "Montserrat", value: "Montserrat" },
                    { label: "Open Sans", value: "Open Sans" },
                    { label: "Raleway", value: "Raleway" },
                    { label: "Nunito", value: "Nunito" },
                ]
            }
        },
        defaultProps: {
            title: "My Landing Page",
            font: "Inter",
        },
        render: ({ children, font = "Inter" }) => {
            // Generate Google Fonts URL dynamically
            const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}:wght@300;400;600;700;800&display=swap`;

            return (
                <div
                    className="text-slate-100 antialiased selection:bg-indigo-500/30 relative overflow-x-hidden h-full bg-[#0a0a0a]"
                    style={{ fontFamily: `'${font}', sans-serif` }}
                >
                    <link rel="stylesheet" href={fontUrl} />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            );
        }
    },
    categories: {
        layout: {
            title: "Layout",
            components: ["HeroBlock", "ColumnsBlock", "ContainerBlock", "Section", "SpacerBlock", "DividerBlock", "FeaturesGridBlock"]
        },
        marketing: {
            title: "Marketing",
            components: ["PricingBlock", "StatsBlock", "FaqBlock", "TestimonialBlock"]
        },
        basic: {
            title: "Basic",
            components: ["HeadingBlock", "TextBlock", "RichTextBlock", "ButtonBlock", "Button", "ImageBlock", "VideoBlock", "IconBlock", "CardBlock", "CodeBlock"]
        },
    },
    components: {
        // ===== HEADER BLOCK =====
        HeaderBlock: {
            label: "Navigation Header",
            fields: {
                logoText: { type: "text" },
                logoImage: { type: "text", label: "Logo Image URL" }, // NEW
                links: {
                    type: "array",
                    arrayFields: {
                        label: { type: "text" },
                        href: { type: "text" },
                    },
                    getItemSummary: (item) => item.label || "Link",
                },
                ctaText: { type: "text" },
                ctaLink: { type: "text" },
                fixed: {
                    type: "radio",
                    options: [
                        { label: "Fixed", value: "true" },
                        { label: "Static", value: "false" },
                    ],
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                logoText: "MyBrand",
                links: [
                    { label: "Features", href: "#features" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Testimonials", href: "#testimonials" },
                ],
                ctaText: "Get Started",
                ctaLink: "#",
                fixed: "true",
            },
            render: ({ logoText, logoImage, links, ctaText, ctaLink, fixed, id }) => (
                <header id={id} className={cn(
                    "w-full bg-slate-950 border-b border-white/10 z-40 transition-all",
                    fixed === "true" ? "sticky top-0 left-0" : "relative"
                )}>
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                            {logoImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={logoImage} alt={logoText || "Logo"} className="h-10 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                        <span className="font-bold text-lg">{logoText?.[0] || "B"}</span>
                                    </div>
                                    {logoText}
                                </>
                            )}
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            {links?.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    onClick={(e) => {
                                        // Smooth scroll handling
                                        if (link.href.startsWith('#')) {
                                            e.preventDefault();
                                            const element = document.querySelector(link.href);
                                            element?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        {ctaText && (
                            <Button
                                variant="gradient"
                                className="rounded-full px-6 shadow-md"
                                asChild
                            >
                                <a href={ctaLink}>{ctaText}</a>
                            </Button>
                        )}
                    </div>
                </header>
            ),
        },

        // ===== HEADING BLOCK =====
        HeadingBlock: {
            label: "Heading",
            fields: {
                title: { type: "custom", render: AI_FIELD_RENDER },
                align: {
                    type: "radio",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
                size: {
                    type: "select",
                    options: [
                        { label: "Small", value: "sm" },
                        { label: "Medium", value: "md" },
                        { label: "Large", value: "lg" },
                        { label: "Extra Large", value: "xl" },
                    ]
                },
                textColor: { type: "select", label: "Text Color", options: textColorOptions },
                lineHeight: { type: "select", label: "Line Height", options: lineHeightOptions },
                letterSpacing: { type: "select", label: "Letter Spacing", options: letterSpacingOptions },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                title: "Heading",
                align: "left",
                size: "lg",
                marginBottom: "4",
            },
            render: ({ title, align, size, textColor, lineHeight, letterSpacing, id, ...styleProps }) => {
                const sizeClasses = {
                    sm: "text-xl",
                    md: "text-2xl",
                    lg: "text-4xl",
                    xl: "text-6xl",
                };
                return (
                    <h2 id={id} className={cn(
                        "font-bold tracking-tight",
                        sizeClasses[size],
                        `text-${align}`,
                        textColor && `text-${textColor}`,
                        lineHeight && `leading-${lineHeight}`,
                        letterSpacing && `tracking-${letterSpacing}`,
                        getCommonStyleClasses(styleProps)
                    )}
                        style={getCommonInlineStyles(styleProps)}
                    >
                        {title}
                    </h2>
                );
            },
        },

        // ===== TEXT BLOCK =====
        TextBlock: {
            label: "Text Paragraph",
            fields: {
                content: { type: "custom", render: AI_FIELD_RENDER },
                align: {
                    type: "radio",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
                textColor: { type: "select", label: "Text Color", options: textColorOptions },
                lineHeight: { type: "select", label: "Line Height", options: lineHeightOptions },
                maxWidth: { type: "select", label: "Max Width", options: maxWidthOptions },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                content: "Start typing here...",
                align: "left",
                marginBottom: "4",
            },
            render: ({ content, align, textColor, lineHeight, maxWidth, id, ...styleProps }) => (
                <p id={id} className={cn(
                    "text-lg",
                    `text-${align}`,
                    textColor ? `text-${textColor}` : "text-slate-400",
                    lineHeight && `leading-${lineHeight}`,
                    maxWidth && maxWidth !== "full" && `max-w-${maxWidth}`,
                    align === "center" && maxWidth && "mx-auto",
                    align === "center" && maxWidth && "mx-auto",
                    getCommonStyleClasses(styleProps)
                )}
                    style={getCommonInlineStyles(styleProps)}
                >
                    {content}
                </p>
            ),
        },



        // ===== RICH TEXT BLOCK =====
        RichTextBlock: {
            label: "Rich Text (HTML)",
            fields: {
                content: { type: "textarea" }, // Simple textarea for HTML
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...typographyFields,
            },
            defaultProps: {
                content: "<p>Enter <b>rich text</b> or HTML here...</p>",
                marginBottom: "4",
            },
            render: ({ content, id, ...styleProps }) => {
                // Sanitize teal/cyan colors from content at render time
                const sanitizedContent = content
                    .replace(/background(-color)?\s*:\s*(teal|cyan|aqua|turquoise)[^;]*;?/gi, '')
                    .replace(/background(-color)?\s*:\s*#(?:0d9488|14b8a6|2dd4bf|5eead4|99f6e4|115e59|134e4a|062a2a|0f2b31|146d7a|33b1c6|7bd3e6|0a1e21|0c2024|13323a)[^;]*;?/gi, '')
                    .replace(/background(-color)?\s*:\s*rgba?\s*\(\s*[0-9]{1,2}\s*,\s*1[2-9][0-9]\s*,\s*1[2-9][0-9][^)]*\)[^;]*;?/gi, '');

                return (
                    <div
                        id={id}
                        className={cn(
                            "prose prose-invert max-w-none", // Tailwind Typography
                            getCommonStyleClasses(styleProps)
                        )}
                        style={getCommonInlineStyles(styleProps)}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                );
            },
        },

        // ===== BUTTON BLOCK =====
        ButtonBlock: {
            label: "Button",
            fields: {
                text: { type: "custom", render: AI_FIELD_RENDER },
                url: { type: "custom", render: AI_FIELD_RENDER },
                variant: {
                    type: "select",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Secondary", value: "secondary" },
                        { label: "Outline", value: "outline" },
                        { label: "Ghost", value: "ghost" },
                        { label: "Destructive", value: "destructive" },
                        { label: "Gradient", value: "gradient" },
                    ]
                },
                size: {
                    type: "radio",
                    options: [
                        { label: "Small", value: "sm" },
                        { label: "Default", value: "default" },
                        { label: "Large", value: "lg" },
                    ]
                },
                align: {
                    type: "radio",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                    ],
                },
                borderRadius: {
                    type: "select",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Small", value: "sm" },
                        { label: "Medium", value: "md" },
                        { label: "Large", value: "lg" },
                        { label: "Full", value: "full" },
                    ]
                },
                shadow: {
                    type: "select",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Small", value: "sm" },
                        { label: "Medium", value: "md" },
                        { label: "Large", value: "lg" },
                    ]
                },
                hoverEffect: {
                    type: "select",
                    label: "Hover Effect",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Glow", value: "glow" },
                        { label: "Scale Up", value: "scale" },
                        { label: "Lift", value: "lift" },
                    ]
                },
                fullWidth: {
                    type: "radio",
                    options: [
                        { label: "Auto", value: false },
                        { label: "Full Width", value: true }
                    ]
                },
                className: { type: "text" },
                ...spacingFields,
                // Skip borderFields to avoid borderRadius duplicate
                ...backgroundFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                text: "Click Me",
                variant: "default",
                size: "default",
                align: "left",
                borderRadius: "md",
                shadow: "none",
                hoverEffect: "none",
                fullWidth: false,
                className: "",
                marginBottom: "4",
            },
            render: ({ text, variant, url, size, align, borderRadius = "md", shadow = "none", hoverEffect = "none", fullWidth = false, className = "", id, ...styleProps }) => {
                const radiusClasses = {
                    none: "rounded-none",
                    sm: "rounded-sm",
                    md: "rounded-md",
                    lg: "rounded-lg",
                    full: "rounded-full"
                };
                const shadowClasses = {
                    none: "shadow-none",
                    sm: "shadow-sm",
                    md: "shadow-md",
                    lg: "shadow-lg"
                };
                const hoverClasses = {
                    none: "",
                    glow: "hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]",
                    scale: "hover:scale-105 transition-transform",
                    lift: "hover:-translate-y-1 hover:shadow-lg transition-all"
                };

                return (
                    <div id={id} className={cn(
                        "flex",
                        align === "left" && "justify-start",
                        align === "center" && "justify-center",
                        align === "right" && "justify-end",
                        fullWidth && "w-full",
                        fullWidth && "w-full",
                        getCommonStyleClasses(styleProps)
                    )}
                        style={getCommonInlineStyles(styleProps)}
                    >
                        <Button
                            variant={variant as any}
                            size={size}
                            asChild={!!url}
                            className={cn(
                                radiusClasses[borderRadius] || "rounded-md",
                                shadowClasses[shadow] || "shadow-none",
                                hoverClasses[hoverEffect] || "",
                                fullWidth ? "w-full" : "",
                                className
                            )}
                        >
                            {url ? <a href={url}>{text}</a> : text}
                        </Button>
                    </div>
                )
            },
        },

        // ===== FLATSOME COMPATIBILITY COMPONENTS =====
        // These components match the structure emitted by the Flatsome Parser

        Section: {
            label: "FW Section",
            fields: {
                padding: { type: "text" }, // e.g. "60px"
                backgroundColor: { type: "text", label: "BG Color" },
                content: { type: "slot" },
                ...spacingFields,
            },
            defaultProps: {
                padding: "60px",
                backgroundColor: "transparent",
                content: [],
            },
            render: ({ padding, backgroundColor, content, id, ...styleProps }) => {
                return (
                    <section
                        id={id}
                        className={cn("w-full relative", getCommonStyleClasses(styleProps))}
                        style={{
                            padding: padding,
                            background: backgroundColor, // Use 'background' to support colors, gradients, and images
                            ...getCommonInlineStyles(styleProps)
                        }}
                    >
                        {typeof content === 'function' ? (content as any)() : content}
                    </section>
                )
            }
        },

        Button: {
            label: "FW Button",
            fields: {
                label: { type: "text" },
                href: { type: "text" },
                variant: {
                    type: "select",
                    options: [
                        { label: "Default", value: "default" },
                        { label: "Outline", value: "outline" },
                        { label: "Ghost", value: "ghost" }
                    ]
                },
                ...spacingFields
            },
            defaultProps: {
                label: "Click Me",
                href: "#",
                variant: "default"
            },
            render: ({ label, href, variant, id, ...styleProps }) => (
                <div id={id} className="inline-block" style={getCommonInlineStyles(styleProps)}>
                    <Button variant={variant as any} asChild>
                        <a href={href}>{label}</a>
                    </Button>
                </div>
            )
        },

        // ===== HERO BLOCK =====
        HeroBlock: {
            label: "Hero Section",
            fields: {
                title: { type: "custom", render: AI_FIELD_RENDER },
                subtitle: { type: "custom", render: AI_FIELD_RENDER },
                bgImage: { type: "custom", render: AI_FIELD_RENDER },
                primaryAction: { type: "custom", render: AI_FIELD_RENDER },
                primaryActionUrl: { type: "text", label: "Primary Action URL" }, // NEW
                secondaryAction: { type: "custom", render: AI_FIELD_RENDER },
                secondaryActionUrl: { type: "text", label: "Secondary Action URL" }, // NEW
                overlayOpacity: {
                    type: "select",
                    options: [
                        { label: "Light (20%)", value: "20" },
                        { label: "Medium (50%)", value: "50" },
                        { label: "Dark (80%)", value: "80" },
                    ]
                },
                overlayGradient: {
                    type: "select",
                    label: "Overlay Gradient",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Bottom Dark", value: "to-t" },
                        { label: "Top Dark", value: "to-b" },
                        { label: "Radial Dark", value: "radial" },
                    ]
                },
                align: {
                    type: "radio",
                    options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                    ]
                },
                minHeight: { type: "select", label: "Minimum Height", options: minHeightOptions },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
                ...layoutFields,
            },
            defaultProps: {
                title: "Build Faster",
                subtitle: "The ultimate platform for modern teams.",
                bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
                primaryAction: "Get Started",
                secondaryAction: "Learn More",
                overlayOpacity: "60",
                overlayGradient: "none",
                align: "center",
                minHeight: "[50vh]",
                paddingY: "4",
            },
            render: ({ title, subtitle, bgImage, primaryAction, primaryActionUrl, secondaryAction, secondaryActionUrl, overlayOpacity = "60", overlayGradient = "none", align = "center", minHeight, id, ...styleProps }) => {
                // REACT-LEVEL LOCK: Map minHeight option to explicit strict height
                // CRITICAL FIX: Use fixed pixels instead of vh to prevent browser viewport jumping on focus
                const heightMap: Record<string, string> = {
                    "auto": "500px",
                    "screen": "850px", // Approx desktop screen height, rigid
                    "[50vh]": "450px",
                    "[75vh]": "650px",
                    "[400px]": "400px",
                    "[500px]": "500px",
                    "[600px]": "600px"
                };
                const lockHeight = heightMap[minHeight || ""] || "500px"; // Default to 500px rigid

                return (
                    <div id={id} style={{ height: lockHeight, width: '100%', overflow: 'hidden', position: 'relative' }}>
                        <div className={cn(
                            "relative px-8 text-center text-white overflow-hidden rounded-xl mx-4",
                            "h-full", // Force fill cage
                            "flex items-center justify-center",
                            getCommonStyleClasses(styleProps)
                        )}
                            style={{ ...getCommonInlineStyles(styleProps) }}
                        >
                            {bgImage && (
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${bgImage})` }}
                                />
                            )}
                            <div className="absolute inset-0 bg-black z-10" style={{ opacity: parseInt(overlayOpacity) / 100 }} />
                            {overlayGradient !== "none" && (
                                <div className={cn(
                                    "absolute inset-0 z-10",
                                    overlayGradient === "to-t" && "bg-gradient-to-t from-black/80 to-transparent",
                                    overlayGradient === "to-b" && "bg-gradient-to-b from-black/80 to-transparent",
                                    overlayGradient === "radial" && "bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]",
                                )} />
                            )}
                            <div className={`relative z-20 max-w-4xl mx-auto flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
                                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{title}</h1>
                                <p className="text-xl md:text-2xl text-slate-200 drop-shadow-md mb-10 max-w-2xl">{subtitle}</p>
                                <div className="flex gap-4 flex-wrap justify-center">
                                    <Button size="lg" variant="gradient" className="rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(77,191,217,0.3)] transition-all hover:scale-105 active:scale-95 duration-200">{primaryAction}</Button>
                                    <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all hover:border-cyan-400/50 hover:text-cyan-300 hover:scale-105 active:scale-95 duration-200 font-semibold hover:shadow-[0_0_30px_rgba(77,191,217,0.3)]">{secondaryAction}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },

        // ===== PRICING BLOCK =====
        // ===== PRICING BLOCK =====
        PricingBlock: {
            label: "Pricing Cards",
            fields: {
                cards: {
                    type: "array",
                    getItemSummary: (item) => item.plan || "Card",
                    arrayFields: {
                        plan: { type: "custom", render: AI_FIELD_RENDER },
                        price: { type: "custom", render: AI_FIELD_RENDER },
                        frequency: { type: "text" },
                        description: { type: "text" },
                        features: { type: "custom", render: AI_FIELD_RENDER },
                        buttonText: { type: "text" },
                        highlightColor: {
                            type: "select",
                            options: [
                                { label: "Emerald", value: "emerald" },
                                { label: "Indigo", value: "indigo" },
                                { label: "Purple", value: "purple" },
                                { label: "Rose", value: "rose" },
                                { label: "Orange", value: "orange" },
                                { label: "Cyan", value: "cyan" },
                            ]
                        },
                        recommended: {
                            type: "radio",
                            options: [
                                { label: "Yes", value: "true" },
                                { label: "No", value: "false" }
                            ]
                        },
                        badgeText: { type: "text" },
                    }
                },
                columns: {
                    type: "select",
                    options: [
                        { label: "1 Column", value: "1" },
                        { label: "2 Columns", value: "2" },
                        { label: "3 Columns", value: "3" },
                        { label: "4 Columns", value: "4" },
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
                ...layoutFields,
            },
            defaultProps: {
                cards: [
                    {
                        plan: "Starter",
                        price: "$0",
                        frequency: "/mo",
                        description: "For individuals",
                        features: "1 User, Basic Analytics",
                        buttonText: "Start Free",
                        highlightColor: "slate",
                        recommended: "false",
                        badgeText: "",
                    },
                    {
                        plan: "Pro",
                        price: "$99",
                        frequency: "/mo",
                        description: "Perfect for growing teams.",
                        features: "Unlimited Users, Analytics, 24/7 Support",
                        buttonText: "Choose Pro",
                        highlightColor: "emerald",
                        recommended: "true",
                        badgeText: "Most Popular",
                    },
                    {
                        plan: "Enterprise",
                        price: "$299",
                        frequency: "/mo",
                        description: "For large organizations",
                        features: "SSO, Audit Logs, Dedicated Support",
                        buttonText: "Contact Us",
                        highlightColor: "indigo",
                        recommended: "false",
                        badgeText: "",
                    }
                ],
                columns: "3",
                marginBottom: "4",
            },
            render: ({ cards, columns = "3", id, ...styleProps }) => {
                const colors: any = {
                    emerald: { border: "border-emerald-500", bg: "bg-emerald-950/20", text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700", badge: "bg-emerald-500" },
                    indigo: { border: "border-indigo-500", bg: "bg-indigo-950/20", text: "text-indigo-400", btn: "bg-indigo-600 hover:bg-indigo-700", badge: "bg-indigo-500" },
                    purple: { border: "border-purple-500", bg: "bg-purple-950/20", text: "text-purple-400", btn: "bg-purple-600 hover:bg-purple-700", badge: "bg-purple-500" },
                    rose: { border: "border-rose-500", bg: "bg-rose-950/20", text: "text-rose-400", btn: "bg-rose-600 hover:bg-rose-700", badge: "bg-rose-500" },
                    orange: { border: "border-orange-500", bg: "bg-orange-950/20", text: "text-orange-400", btn: "bg-orange-600 hover:bg-orange-700", badge: "bg-orange-500" },
                    cyan: { border: "border-cyan-500", bg: "bg-cyan-950/20", text: "text-cyan-400", btn: "bg-cyan-600 hover:bg-cyan-700", badge: "bg-cyan-500" },
                    teal: { border: "border-teal-500", bg: "bg-teal-950/20", text: "text-teal-400", btn: "bg-teal-600 hover:bg-teal-700", badge: "bg-teal-500" },
                    blue: { border: "border-blue-500", bg: "bg-blue-950/20", text: "text-blue-400", btn: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-500" },
                    sky: { border: "border-sky-500", bg: "bg-sky-950/20", text: "text-sky-400", btn: "bg-sky-600 hover:bg-sky-700", badge: "bg-sky-500" },
                    red: { border: "border-red-500", bg: "bg-red-950/20", text: "text-red-400", btn: "bg-red-600 hover:bg-red-700", badge: "bg-red-500" },
                    amber: { border: "border-amber-500", bg: "bg-amber-950/20", text: "text-amber-400", btn: "bg-amber-600 hover:bg-amber-700", badge: "bg-amber-500" },
                    slate: { border: "border-slate-500", bg: "bg-slate-950/20", text: "text-slate-400", btn: "bg-slate-600 hover:bg-slate-700", badge: "bg-slate-500" },
                    stone: { border: "border-stone-500", bg: "bg-stone-950/20", text: "text-stone-400", btn: "bg-stone-600 hover:bg-stone-700", badge: "bg-stone-500" },
                    zinc: { border: "border-zinc-500", bg: "bg-zinc-950/20", text: "text-zinc-400", btn: "bg-zinc-600 hover:bg-zinc-700", badge: "bg-zinc-500" },
                    neutral: { border: "border-neutral-500", bg: "bg-neutral-950/20", text: "text-neutral-400", btn: "bg-neutral-600 hover:bg-neutral-700", badge: "bg-neutral-500" },
                };

                // Responsive grid configuration
                // Uses 'sm' (640px) intermediate step to ensure columns appear even on smaller screens without squishing
                let gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"; // default for 3

                const colString = String(columns);
                if (colString === "1") gridClass = "grid-cols-1";
                if (colString === "2") gridClass = "grid-cols-1 sm:grid-cols-2";
                if (colString === "3") gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
                if (colString === "4") gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

                return (
                    <div id={id} className={cn("w-full px-4", getCommonStyleClasses(styleProps))} style={getCommonInlineStyles(styleProps)}>
                        <div
                            className={cn("grid gap-8 w-full")}
                            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                            data-columns={columns}
                        >
                            {cards?.map((card: any, i: number) => {
                                const theme = colors[card.highlightColor as keyof typeof colors] || colors["emerald"];
                                const isRec = card.recommended === "true";

                                return (
                                    <div key={i} className="w-full relative group/pricing">
                                        <Card className={`relative border-2 h-full flex flex-col ${isRec ? theme.border + " " + theme.bg : "border-white/10 bg-white/5"} backdrop-blur-sm transition-all hover:scale-[1.01]`}>
                                            {isRec && (
                                                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${theme.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg`}>
                                                    {card.badgeText || "Recommended"}
                                                </div>
                                            )}
                                            <CardHeader className="text-center pb-2">
                                                <h3 className="text-lg font-medium text-slate-300 uppercase tracking-widest">{card.plan}</h3>
                                                <div className="text-4xl font-bold text-white mt-2 flex justify-center items-baseline gap-1">
                                                    {card.price}
                                                    <span className="text-sm font-normal text-slate-400">{card.frequency}</span>
                                                </div>
                                                {card.description && <p className="text-sm text-slate-500 mt-2">{card.description}</p>}
                                            </CardHeader>
                                            <CardContent className="pt-6 flex-1">
                                                <ul className="space-y-3">
                                                    {card.features?.split(',').map((f: string, idx: number) => (
                                                        <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                                            <ICON_MAP.Check className={`h-4 w-4 ${theme.text} shrink-0`} />
                                                            {f.trim()}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className={`w-full ${isRec ? theme.btn : ""}`} variant={isRec ? "default" : "outline"}>
                                                    {card.buttonText || `Choose ${card.plan}`}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }
        },

        // ===== TESTIMONIAL BLOCK =====
        TestimonialBlock: {
            label: "Testimonial",
            fields: {
                quote: { type: "custom", render: AI_FIELD_RENDER },
                author: { type: "text" },
                role: { type: "text" },
                avatar: { type: "text" },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                quote: "This product changed our entire workflow. Highly recommended!",
                author: "Sarah Connor",
                role: "CTO, Skynet",
                avatar: "https://i.pravatar.cc/150?u=sarah",
                marginBottom: "8",
            },
            render: ({ quote, author, role, avatar, id, ...styleProps }) => (
                <div id={id} className={cn(getCommonStyleClasses(styleProps))} style={getCommonInlineStyles(styleProps)}>
                    <Card className="bg-white/5 border-white/10 p-8 backdrop-blur-md relative overflow-hidden group/testimonial hover:bg-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="text-8xl font-serif text-white">&quot;</span>
                        </div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <p className="text-xl md:text-2xl text-slate-200 font-light leading-relaxed">&quot;{quote}&quot;</p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/10">
                                    <img src={avatar} alt={author} className="h-full w-full object-cover" /> {/* eslint-disable-line @next/next/no-img-element */}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{author}</div>
                                    <div className="text-sm text-slate-500">{role}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },

        // ===== FAQ BLOCK =====
        FaqBlock: {
            label: "FAQ Section",
            fields: {
                items: {
                    type: "array",
                    arrayFields: {
                        question: { type: "custom", render: AI_FIELD_RENDER },
                        answer: { type: "custom", render: AI_FIELD_RENDER }
                    }
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                items: [
                    { question: "How does it work?", answer: "It works like magic." },
                    { question: "Is it free?", answer: "Yes, for now." }
                ],
                marginBottom: "12",
            },
            render: ({ items, id, ...styleProps }) => (
                <div id={id} className={cn("max-w-3xl mx-auto", getCommonStyleClasses(styleProps))}>
                    <Accordion type="single" collapsible className="w-full">
                        {items.map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                                <AccordionTrigger className="text-slate-200 hover:text-white px-4">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-slate-400 px-4">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )
        },

        // ===== STATS BLOCK =====
        StatsBlock: {
            label: "Stats Row",
            fields: {
                stats: {
                    type: "array",
                    arrayFields: {
                        value: { type: "custom", render: AI_FIELD_RENDER },
                        label: { type: "custom", render: AI_FIELD_RENDER }
                    }
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                stats: [
                    { value: "10k+", label: "Users" },
                    { value: "99.9%", label: "Uptime" },
                    { value: "24/7", label: "Support" }
                ],
                marginBottom: "8",
            },
            render: ({ stats, ...styleProps }) => (
                <div className={cn(
                    "grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm",
                    getCommonStyleClasses(styleProps)
                )}>
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )
        },

        // ===== FEATURES GRID BLOCK =====
        FeaturesGridBlock: {
            label: "Features Grid",
            fields: {
                title: { type: "custom", render: AI_FIELD_RENDER },
                columns: {
                    type: "select",
                    label: "Columns",
                    options: [
                        { label: "2 Columns", value: "2" },
                        { label: "3 Columns", value: "3" },
                        { label: "4 Columns", value: "4" },
                    ]
                },
                features: {
                    type: "array",
                    arrayFields: {
                        title: { type: "custom", render: AI_FIELD_RENDER },
                        description: { type: "custom", render: AI_FIELD_RENDER },
                        icon: { type: "custom", render: IconPickerField }
                    }
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
                ...layoutFields,
            },
            defaultProps: {
                title: "Why Choose Us?",
                columns: "3",
                features: [
                    { title: "Fast", description: "Lightning fast performance.", icon: "Zap" },
                    { title: "Secure", description: "Bank-grade security.", icon: "Shield" },
                    { title: "Global", description: "Deploy anywhere.", icon: "Globe" }
                ],
                marginBottom: "8",
                paddingY: "12",
            },
            render: ({ title, features, columns = "3", id, ...styleProps }) => {
                const colClasses = {
                    "2": "md:grid-cols-2",
                    "3": "md:grid-cols-3",
                    "4": "md:grid-cols-4",
                };
                return (
                    <section id={id} className={cn(
                        "px-4 relative group/features hover:ring-1 hover:ring-indigo-500/50 transition-all rounded-xl",
                        getCommonStyleClasses(styleProps)
                    )}>
                        <h2 className="text-3xl font-bold text-center text-white mb-12">{title}</h2>
                        <div className={cn("grid grid-cols-1 gap-8", colClasses[columns])}>
                            {features.map((f, i) => {
                                const Icon = ICON_MAP[f.icon] || ICON_MAP.Monitor;
                                return (
                                    <Card key={i} className="bg-transparent border-none shadow-none text-center">
                                        <div className="mx-auto bg-emerald-500/10 h-16 w-16 rounded-2xl flex items-center justify-center mb-6">
                                            <Icon className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{f.description}</p>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                )
            }
        },

        // ===== CARD BLOCK =====
        CardBlock: {
            label: "Basic Card",
            fields: {
                title: { type: "custom", render: AI_FIELD_RENDER },
                content: { type: "custom", render: AI_FIELD_RENDER },
                icon: { type: "custom", render: IconPickerField },
                hoverEffect: {
                    type: "select",
                    label: "Hover Effect",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Lift", value: "lift" },
                        { label: "Glow", value: "glow" },
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                title: "Card Title",
                content: "Content goes here...",
                hoverEffect: "none",
                marginBottom: "4",
            },
            render: ({ title, content, icon, hoverEffect = "none", id, ...styleProps }) => {
                const Icon = icon ? ICON_MAP[icon] : null;
                const hoverClasses = {
                    none: "",
                    lift: "hover:-translate-y-1 hover:shadow-xl transition-all",
                    glow: "hover:ring-2 hover:ring-indigo-500/50 transition-all",
                };
                return (
                    <div id={id} className={cn(getCommonStyleClasses(styleProps))}>
                        <Card className={cn("bg-white/5 border-white/10 backdrop-blur-sm", hoverClasses[hoverEffect])}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon className="h-5 w-5 text-indigo-400" />}
                                    <CardTitle className="text-slate-100">{title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-400">{content}</p>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        },

        // ===== COLUMNS BLOCK =====
        ColumnsBlock: {
            label: "Columns (2)",
            fields: {
                leftContent: { type: "custom", render: AI_FIELD_RENDER },
                rightContent: { type: "custom", render: AI_FIELD_RENDER },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                leftContent: "Left column...",
                rightContent: "Right column...",
                marginBottom: "8",
            },
            render: ({ leftContent, rightContent, ...styleProps }) => (
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-8 relative group/columns hover:ring-1 hover:ring-indigo-500/50 transition-all rounded-xl p-2",
                    getCommonStyleClasses(styleProps)
                )}>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-slate-300">{leftContent}</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-slate-300">{rightContent}</p>
                    </div>
                </div>
            )
        },

        // ===== IMAGE BLOCK =====
        ImageBlock: {
            label: "Image",
            fields: {
                src: { type: "custom", render: AI_FIELD_RENDER },
                alt: { type: "custom", render: AI_FIELD_RENDER },
                height: { type: "custom", render: AI_FIELD_RENDER },
                objectFit: { type: "select", options: [{ label: "Cover", value: "cover" }, { label: "Contain", value: "contain" }] },
                hoverZoom: {
                    type: "radio",
                    label: "Hover Zoom",
                    options: [
                        { label: "No", value: false },
                        { label: "Yes", value: true },
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
                alt: "Image",
                height: "h-64",
                objectFit: "cover",
                hoverZoom: false,
                marginBottom: "8",
            },
            render: ({ src, alt, height, objectFit, hoverZoom, ...styleProps }) => (
                <div className={cn(getCommonStyleClasses(styleProps))}>
                    <div className={`relative w-full ${height} rounded-xl overflow-hidden group/image border border-white/5`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt}
                            className={cn(
                                "w-full h-full",
                                `object-${objectFit}`,
                                hoverZoom && "transition-transform duration-500 group-hover/image:scale-110"
                            )}
                        /> {/* eslint-disable-line @next/next/no-img-element */}
                    </div>
                </div>
            )
        },

        // ===== DIVIDER BLOCK =====
        DividerBlock: {
            label: "Divider",
            fields: {
                padding: {
                    type: "radio",
                    options: [
                        { label: "Small", value: "sm" },
                        { label: "Medium", value: "md" },
                        { label: "Large", value: "lg" }
                    ]
                },
                style: {
                    type: "select",
                    label: "Style",
                    options: [
                        { label: "Solid", value: "solid" },
                        { label: "Dashed", value: "dashed" },
                        { label: "Gradient", value: "gradient" },
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields, // Divider might use border fields?
                ...visibilityFields,
            },
            defaultProps: {
                padding: "md",
                style: "solid",
            },
            render: ({ padding, style = "solid", id }) => {
                const py = { sm: "py-4", md: "py-12", lg: "py-24" };
                const styleClasses = {
                    solid: "border-t border-white/10",
                    dashed: "border-t border-dashed border-white/10",
                    gradient: "h-px bg-gradient-to-r from-transparent via-white/20 to-transparent border-0",
                };
                return (
                    <div id={id} className={`px-4 ${py[padding]}`}>
                        <hr className={styleClasses[style]} />
                    </div>
                );
            }
        },

        // ===== CONTAINER BLOCK =====
        ContainerBlock: {
            label: "Container",
            fields: {
                layout: {
                    type: "select",
                    options: [
                        { label: "Vertical Stack", value: "stack" },
                        { label: "Horizontal Row", value: "row" },
                        { label: "Grid (2 Cols)", value: "grid-2" },
                        { label: "Grid (3 Cols)", value: "grid-3" },
                        { label: "Grid (4 Cols)", value: "grid-4" },
                    ]
                },
                gap: {
                    type: "select",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Small (16px)", value: "sm" },
                        { label: "Medium (32px)", value: "md" },
                        { label: "Large (48px)", value: "lg" },
                    ]
                },
                maxWidth: { type: "select", label: "Max Width", options: maxWidthOptions },
                className: { type: "custom", render: AI_FIELD_RENDER },
                style: { type: "custom", render: AI_FIELD_RENDER },
                id: { type: "custom", render: AI_FIELD_RENDER },
                justifyContent: { type: "select", options: justifyContentOptions, label: "Justify Content" },
                alignItems: { type: "select", options: alignItemsOptions, label: "Align Items" },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
                ...typographyFields,
            },
            defaultProps: {
                layout: "stack",
                gap: "md",
                alignItems: "stretch",
                justifyContent: "start",
                className: "min-h-[100px]",
                style: "{}",
                id: "",
                paddingY: "4",
                paddingX: "4",
            },
            render: ({ layout, gap, alignItems, justifyContent, maxWidth, className, style, id, puck, ...styleProps }) => {
                const { renderDropZone } = puck;
                let customStyle = {};
                try {
                    customStyle = JSON.parse(style || "{}");
                } catch (e) { }

                const layoutClasses = {
                    stack: "[&>div]:flex [&>div]:flex-col",
                    row: "[&>div]:flex [&>div]:flex-row [&>div]:flex-wrap",
                    "grid-2": "[&>div]:grid [&>div]:grid-cols-1 [&>div]:md:grid-cols-2",
                    "grid-3": "[&>div]:grid [&>div]:grid-cols-1 [&>div]:md:grid-cols-3",
                    "grid-4": "[&>div]:grid [&>div]:grid-cols-1 [&>div]:md:grid-cols-4",
                };

                const gapClasses = {
                    none: "[&>div]:gap-0",
                    sm: "[&>div]:gap-4",
                    md: "[&>div]:gap-8",
                    lg: "[&>div]:gap-12",
                };



                const alignClasses: any = {
                    start: "[&>div]:items-start",
                    center: "[&>div]:items-center",
                    end: "[&>div]:items-end",
                    stretch: "[&>div]:items-stretch",
                    baseline: "[&>div]:items-baseline",
                };

                const justifyClasses: any = {
                    start: "[&>div]:justify-start",
                    center: "[&>div]:justify-center",
                    end: "[&>div]:justify-end",
                    between: "[&>div]:justify-between",
                    around: "[&>div]:justify-around",
                    evenly: "[&>div]:justify-evenly",
                };

                return (
                    <div
                        className={cn(
                            className,
                            "relative group/container transition-all",
                            layoutClasses[layout || "stack"],
                            gapClasses[gap || "md"],
                            alignItems && alignClasses[alignItems],
                            justifyContent && justifyClasses[justifyContent],
                            maxWidth && maxWidth !== "full" && `max-w-${maxWidth} mx-auto`,
                            getCommonStyleClasses(styleProps)
                        )}
                        style={customStyle}
                        id={id}
                    >
                        {renderDropZone({ zone: "content" }) as unknown as React.ReactNode}
                    </div>
                );
            }
        },

        // ===== CODE BLOCK =====
        CodeBlock: {
            label: "Code",
            fields: {
                code: { type: "custom", render: AI_FIELD_RENDER }
            },
            defaultProps: {
                code: "<div class='text-white'>Hello World</div>"
            },
            render: ({ code, id }) => (
                <div id={id} dangerouslySetInnerHTML={{ __html: code }} />
            )
        },

        // ===== SPACER BLOCK =====
        SpacerBlock: {
            label: "Spacer",
            fields: {
                height: {
                    type: "select",
                    label: "Height",
                    options: [
                        { label: "Extra Small (8px)", value: "2" },
                        { label: "Small (16px)", value: "4" },
                        { label: "Medium (32px)", value: "8" },
                        { label: "Large (48px)", value: "12" },
                        { label: "XL (64px)", value: "16" },
                        { label: "2XL (96px)", value: "24" },
                        { label: "3XL (128px)", value: "32" },
                    ]
                },
                ...backgroundFields,
                ...visibilityFields,
            },
            defaultProps: {
                height: "8"
            },
            render: ({ height, id }) => (
                <div id={id} className={`h-${height}`} aria-hidden="true" />
            )
        },

        // ===== VIDEO BLOCK =====
        VideoBlock: {
            label: "Video",
            fields: {
                url: { type: "custom", render: AI_FIELD_RENDER },
                aspectRatio: {
                    type: "select",
                    label: "Aspect Ratio",
                    options: [
                        { label: "16:9", value: "16:9" },
                        { label: "4:3", value: "4:3" },
                        { label: "1:1", value: "1:1" },
                    ]
                },
                autoplay: {
                    type: "radio",
                    label: "Autoplay",
                    options: [
                        { label: "No", value: false },
                        { label: "Yes", value: true },
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
            },
            defaultProps: {
                url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                aspectRatio: "16:9",
                autoplay: false,
                marginBottom: "8",
            },
            render: ({ url, aspectRatio = "16:9", autoplay, id, ...styleProps }) => {
                const aspectClasses = {
                    "16:9": "aspect-video",
                    "4:3": "aspect-[4/3]",
                    "1:1": "aspect-square",
                };
                const embedUrl = autoplay && url.includes("youtube")
                    ? `${url}${url.includes("?") ? "&" : "?"}autoplay=1&mute=1`
                    : url;

                return (
                    <div id={id} className={cn(getCommonStyleClasses(styleProps))}>
                        <div className={cn("w-full rounded-xl overflow-hidden border border-white/10", aspectClasses[aspectRatio])}>
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )
            }
        },

        // ===== ICON BLOCK =====
        IconBlock: {
            label: "Icon",
            fields: {
                icon: { type: "custom", render: IconPickerField },
                size: {
                    type: "select",
                    label: "Size",
                    options: [
                        { label: "Small", value: "sm" },
                        { label: "Medium", value: "md" },
                        { label: "Large", value: "lg" },
                        { label: "XL", value: "xl" },
                    ]
                },
                color: { type: "select", label: "Color", options: textColorOptions },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...animationFields,
                ...visibilityFields,
            },
            defaultProps: {
                icon: "Star",
                size: "md",
                marginBottom: "4",
            },
            render: ({ icon, size, color, id, ...styleProps }) => {
                const Icon = ICON_MAP[icon] || ICON_MAP.Star;
                const sizeClasses = {
                    sm: "h-6 w-6",
                    md: "h-10 w-10",
                    lg: "h-16 w-16",
                    xl: "h-24 w-24",
                };
                return (
                    <div id={id} className={cn("flex justify-center", getCommonStyleClasses(styleProps))}>
                        <Icon className={cn(sizeClasses[size], color ? `text-${color}` : "text-indigo-400")} />
                    </div>
                )
            }
        },

        // ===== ANIMATION BLOCK =====
        AnimationBlock: {
            label: "SVG Animation",
            fields: {
                svgCode: { type: "custom", render: AI_FIELD_RENDER },
                animationType: {
                    type: "select",
                    label: "Animation",
                    options: [
                        { label: "None", value: "none" },
                        { label: "Pulse", value: "animate-pulse" },
                        { label: "Spin", value: "animate-spin" },
                        { label: "Bounce", value: "animate-bounce" },
                        { label: "Ping", value: "animate-ping" },
                    ]
                },
                speed: {
                    type: "radio",
                    label: "Speed",
                    options: [
                        { label: "Slow", value: "duration-1000" },
                        { label: "Normal", value: "duration-500" },
                        { label: "Fast", value: "duration-300" }
                    ]
                },
                ...spacingFields,
                ...backgroundFields,
                ...borderFields,
                ...visibilityFields,
            },
            defaultProps: {
                svgCode: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="4" fill="indigo" />
</svg>`,
                animationType: "none",
                speed: "duration-500",
                paddingY: "0",
                marginBottom: "0"
            },
            render: ({ svgCode, animationType, speed, id, ...styleProps }) => {
                const styleClasses = getCommonStyleClasses(styleProps);
                return (
                    <div id={id} className={cn("flex justify-center items-center overflow-hidden", styleClasses)}>
                        <div
                            className={cn("w-full h-full text-indigo-500", animationType !== "none" && `${animationType} ${speed}`)}
                            dangerouslySetInnerHTML={{ __html: svgCode }}
                        />
                    </div>
                );
            }
        },
    },
};
