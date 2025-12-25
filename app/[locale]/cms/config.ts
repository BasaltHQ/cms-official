import { LucideIcon } from "lucide-react";

export interface CMSModule {
    slug: string;
    href: (l: string) => string;
    icon: string;
    label: string;
    section: string | null;
    options?: {
        label: string;
        href: (l: string) => string;
        icon: string; // Made required for consistency or keep optional? User said "make sure each of those have symbols".
    }[];
    color?: string;
    hidden?: boolean;
}

export const CMS_MODULES: CMSModule[] = [
    { slug: "dashboard", href: (l: string) => `/${l}/cms`, icon: "LayoutDashboard", label: "Dashboard", section: null, color: "sky" },
    { slug: "analytics", href: (l: string) => `/${l}/cms/analytics`, icon: "Activity", label: "Analytics", section: "Content", color: "purple" },
    {
        slug: "blog",
        href: (l: string) => `/${l}/cms/blog`,
        icon: "FileText",
        label: "Blog",
        section: "Content",
        color: "pink",
        options: [
            { label: "All Posts", href: (l: string) => `/${l}/cms/blog`, icon: "List" },
            { label: "Categories", href: (l: string) => `/${l}/cms/blog/categories`, icon: "Tags" }
        ]
    },
    {
        slug: "careers",
        href: (l: string) => `/${l}/cms/careers`,
        icon: "Briefcase",
        label: "Careers",
        section: "Content",
        color: "orange",
        options: [
            { label: "All Positions", href: (l: string) => `/${l}/cms/careers`, icon: "List" },
            { label: "Applications", href: (l: string) => `/${l}/cms/careers?tab=applications`, icon: "Users" },
            { label: "Create New", href: (l: string) => `/${l}/cms/careers`, icon: "PlusCircle" },
        ]
    },
    {
        slug: "faq",
        href: (l: string) => `/${l}/cms/faq`,
        icon: "HelpCircle",
        label: "FAQ Manager",
        section: "Content",
        color: "teal",
        options: [
            { label: "All FAQs", href: (l: string) => `/${l}/cms/faq`, icon: "List" },
            { label: "Create New", href: (l: string) => `/${l}/cms/faq/new`, icon: "PlusCircle" }
        ]
    },
    { slug: "docs", href: (l: string) => `/${l}/cms/docs`, icon: "BookOpen", label: "Documentation", section: "Content", color: "blue" },
    {
        slug: "media",
        href: (l: string) => `/${l}/cms/media`,
        icon: "ImageIcon",
        label: "Media Library",
        section: "Content",
        color: "rose",
        options: [
            { label: "My Files", href: (l: string) => `/${l}/cms/media?tab=mine`, icon: "Folder" },
            { label: "Public Assets", href: (l: string) => `/${l}/cms/media?tab=public`, icon: "Globe" },
            { label: "Page Assets", href: (l: string) => `/${l}/cms/media?tab=landing_pages`, icon: "Layout" },
            { label: "WordPress", href: (l: string) => `/${l}/cms/media?tab=wordpress`, icon: "FileImage" }
        ]
    },
    {
        slug: "forms",
        href: (l: string) => `/${l}/cms/forms`,
        icon: "FileInput",
        label: "Form Builder",
        section: "Content",
        color: "teal",
        options: [
            { label: "All Forms", href: (l: string) => `/${l}/cms/forms`, icon: "List" },
            { label: "Create New", href: (l: string) => `/${l}/cms/forms?action=create`, icon: "PlusCircle" }
        ]
    },
    {
        slug: "landing",
        href: (l: string) => `/${l}/cms/landing`,
        icon: "LayoutTemplate",
        label: "Landing Pages",
        section: "Content",
        color: "indigo",
        options: [
            { label: "All Pages", href: (l: string) => `/${l}/cms/landing`, icon: "File" },
            { label: "Create Page", href: (l: string) => `/${l}/cms/landing/new`, icon: "PlusCircle" },
            { label: "Templates", href: (l: string) => `/${l}/cms/landing/templates`, icon: "LayoutTemplate" },
            { label: "My WP Site", href: (l: string) => `/${l}/cms/apps/wordpress`, icon: "Globe" }
        ]
    },
    {
        slug: "subscriptions",
        href: (l: string) => `/${l}/cms/subscriptions`,
        icon: "DollarSign",
        label: "Subscriptions",
        section: "Content",
        color: "cyan",
        options: [
            { label: "Clients", href: (l: string) => `/${l}/cms/subscriptions/clients`, icon: "Users" },
            { label: "Newsletter", href: (l: string) => `/${l}/cms/subscriptions/newsletter`, icon: "Mail" }
        ]
    },
    {
        slug: "footer",
        href: (l: string) => `/${l}/cms/footer`,
        icon: "Globe",
        label: "Footer & SEO",
        section: "Content",
        color: "lime",
        options: [
            { label: "Footer Content", href: (l: string) => `/${l}/cms/footer?tab=content`, icon: "Layout" },
            { label: "Social Profiles", href: (l: string) => `/${l}/cms/footer?tab=profiles`, icon: "Share2" },
            { label: "SEO Settings", href: (l: string) => `/${l}/cms/footer?tab=seo`, icon: "Search" }
        ]
    },
    { slug: "manage", href: (l: string) => `/${l}/cms/manage`, icon: "Users2", label: "Team Members", section: "Content", color: "yellow" },
    { slug: "university", href: (l: string) => `/${l}/cms/university`, icon: "GraduationCap", label: "University", section: "System", color: "violet" },
    {
        slug: "wordpress",
        href: (l: string) => `/${l}/cms/apps/wordpress`,
        icon: "Layout",
        label: "My WP Site",
        section: "Content",
        color: "emerald",
        hidden: true
    },
    {
        slug: "apps",
        href: (l: string) => `/${l}/cms/apps`,
        icon: "Grid",
        label: "Apps & Plugins",
        section: "System",
        color: "emerald",
        options: [
            { label: "E-Commerce", href: (l: string) => `/${l}/cms/apps?tab=ecommerce`, icon: "ShoppingCart" },
            { label: "Base Broadcast", href: (l: string) => `/${l}/cms/apps?tab=broadcast`, icon: "Radio" },
            { label: "Publishing", href: (l: string) => `/${l}/cms/apps?tab=publishing`, icon: "PenTool" },
            { label: "Utility", href: (l: string) => `/${l}/cms/apps?tab=utility`, icon: "Wrench" }
        ]
    },
    {
        slug: "integrations",
        href: (l: string) => `/${l}/cms/oauth`,
        icon: "Shield",
        label: "Integrations",
        section: "System",
        color: "red",
        options: [
            { label: "AI Models", href: (l: string) => `/${l}/cms/oauth?tab=ai`, icon: "Brain" },
            { label: "Social", href: (l: string) => `/${l}/cms/oauth?tab=social`, icon: "Share2" },
            { label: "System Config", href: (l: string) => `/${l}/cms/oauth?tab=system`, icon: "Settings" }
        ]
    },
    {
        slug: "settings",
        href: (l: string) => `/${l}/cms/settings`,
        icon: "Settings",
        label: "Settings",
        section: "System",
        color: "slate",
        options: [
            { label: "General", href: (l: string) => `/${l}/cms/settings`, icon: "Settings" },
            { label: "Profile", href: (l: string) => `/${l}/cms/settings/profile`, icon: "User" },
            { label: "Security", href: (l: string) => `/${l}/cms/settings/security`, icon: "Shield" }
        ]
    },
    { slug: "activity", href: (l: string) => `/${l}/cms/activity`, icon: "Activity", label: "Activity Log", section: "System", color: "gray" },
    { slug: "voice", href: (l: string) => `/${l}/cms/voice`, icon: "Mic", label: "Universal Voice", section: "System", color: "violet", hidden: true },
];
