import { LucideIcon } from "lucide-react";

export interface CMSModule {
    slug: string;
    href: (l: string, t: string) => string;
    icon: string;
    label: string;
    section: string | null;
    options?: {
        label: string;
        href: (l: string, t: string) => string;
        icon: string;
    }[];
    color?: string;
    hidden?: boolean;
}

export const CMS_MODULES: CMSModule[] = [
    { slug: "dashboard", href: (l: string, t: string) => `/${l}/cms/${t}`, icon: "LayoutDashboard", label: "Dashboard", section: null, color: "sky" },
    { slug: "analytics", href: (l: string, t: string) => `/${l}/cms/${t}/analytics`, icon: "Activity", label: "Analytics", section: "Content", color: "purple" },
    {
        slug: "blog",
        href: (l: string, t: string) => `/${l}/cms/${t}/blog`,
        icon: "FileText",
        label: "Blog",
        section: "Content",
        color: "pink",
        options: [
            { label: "All Posts", href: (l: string, t: string) => `/${l}/cms/${t}/blog`, icon: "List" },
            { label: "Categories", href: (l: string, t: string) => `/${l}/cms/${t}/blog/categories`, icon: "Tags" }
        ]
    },
    {
        slug: "broadcast",
        href: (l: string, t: string) => `/${l}/cms/${t}/apps?tab=broadcast`,
        icon: "Radio",
        label: "Broadcast Studio",
        section: "Content",
        color: "indigo",
        options: [
            { label: "Compose", href: (l: string, t: string) => `/${l}/cms/${t}/apps?tab=broadcast&view=compose`, icon: "PenTool" },
            { label: "Scheduled Posts", href: (l: string, t: string) => `/${l}/cms/${t}/apps?tab=broadcast&view=scheduled`, icon: "Calendar" }
        ]
    },
    {
        slug: "careers",
        href: (l: string, t: string) => `/${l}/cms/${t}/careers`,
        icon: "Briefcase",
        label: "Careers",
        section: "Content",
        color: "orange",
        options: [
            { label: "All Positions", href: (l: string, t: string) => `/${l}/cms/${t}/careers`, icon: "List" },
            { label: "Applications", href: (l: string, t: string) => `/${l}/cms/${t}/careers?tab=applications`, icon: "Users" },
            { label: "Create New", href: (l: string, t: string) => `/${l}/cms/${t}/careers`, icon: "PlusCircle" },
        ]
    },
    {
        slug: "coupons",
        href: (l: string, t: string) => `/${l}/cms/${t}/coupons`,
        icon: "Ticket",
        label: "Coupons",
        section: "Content",
        color: "amber",
        options: [
            { label: "All Coupons", href: (l: string, t: string) => `/${l}/cms/${t}/coupons`, icon: "List" },
            { label: "Create New", href: (l: string, t: string) => `/${l}/cms/${t}/coupons?action=new`, icon: "PlusCircle" }
        ]
    },
    { slug: "docs", href: (l: string, t: string) => `/${l}/cms/${t}/docs`, icon: "BookOpen", label: "Documentation", section: "Content", color: "blue" },
    {
        slug: "faq",
        href: (l: string, t: string) => `/${l}/cms/${t}/faq`,
        icon: "HelpCircle",
        label: "FAQ Manager",
        section: "Content",
        color: "teal",
        options: [
            { label: "All FAQs", href: (l: string, t: string) => `/${l}/cms/${t}/faq`, icon: "List" },
            { label: "Create New", href: (l: string, t: string) => `/${l}/cms/${t}/faq/new`, icon: "PlusCircle" }
        ]
    },
    {
        slug: "forms",
        href: (l: string, t: string) => `/${l}/cms/${t}/forms`,
        icon: "FileInput",
        label: "Form Builder",
        section: "Content",
        color: "teal",
        options: [
            { label: "All Forms", href: (l: string, t: string) => `/${l}/cms/${t}/forms`, icon: "List" },
            { label: "Create New", href: (l: string, t: string) => `/${l}/cms/${t}/forms?action=create`, icon: "PlusCircle" }
        ]
    },
    {
        slug: "media",
        href: (l: string, t: string) => `/${l}/cms/${t}/media`,
        icon: "ImageIcon",
        label: "Media Library",
        section: "Content",
        color: "rose",
        options: [
            { label: "My Files", href: (l: string, t: string) => `/${l}/cms/${t}/media?tab=mine`, icon: "Folder" },
            { label: "Public Assets", href: (l: string, t: string) => `/${l}/cms/${t}/media?tab=public`, icon: "Globe" },
            { label: "Page Assets", href: (l: string, t: string) => `/${l}/cms/${t}/media?tab=landing_pages`, icon: "Layout" },
            { label: "WordPress", href: (l: string, t: string) => `/${l}/cms/${t}/media?tab=wordpress`, icon: "FileImage" }
        ]
    },
    {
        slug: "wordpress",
        href: (l: string, t: string) => `/${l}/cms/${t}/apps/wordpress`,
        icon: "Layout",
        label: "My WP Site",
        section: "Content",
        color: "emerald",
        hidden: true
    },
    {
        slug: "site-layout",
        href: (l: string, t: string) => `/${l}/cms/${t}/site-layout`,
        icon: "Globe",
        label: "Site Layout",
        section: "Content",
        color: "lime",
        options: [
            { label: "Header", href: (l: string, t: string) => `/${l}/cms/${t}/site-layout?tab=header`, icon: "PanelTop" },
            { label: "Footer Content", href: (l: string, t: string) => `/${l}/cms/${t}/site-layout?tab=content`, icon: "Layout" },
            { label: "Social Profiles", href: (l: string, t: string) => `/${l}/cms/${t}/site-layout?tab=profiles`, icon: "Share2" },
            { label: "SEO Settings", href: (l: string, t: string) => `/${l}/cms/${t}/site-layout?tab=seo`, icon: "Search" }
        ]
    },
    {
        slug: "subscriptions",
        href: (l: string, t: string) => `/${l}/cms/${t}/subscriptions`,
        icon: "DollarSign",
        label: "Subscriptions",
        section: "Content",
        color: "cyan",
        options: [
            { label: "Clients", href: (l: string, t: string) => `/${l}/cms/${t}/subscriptions/clients`, icon: "Users" },
            { label: "Newsletter", href: (l: string, t: string) => `/${l}/cms/${t}/subscriptions/newsletter`, icon: "Mail" }
        ]
    },
    { slug: "manage", href: (l: string, t: string) => `/${l}/cms/${t}/manage`, icon: "Users2", label: "Team Members", section: "Content", color: "yellow" },
    {
        slug: "landing",
        href: (l: string, t: string) => `/${l}/cms/${t}/landing`,
        icon: "LayoutTemplate",
        label: "Websites",
        section: "Content",
        color: "indigo",
        options: [
            { label: "All Pages", href: (l: string, t: string) => `/${l}/cms/${t}/landing`, icon: "File" },
            { label: "AI Builder", href: (l: string, t: string) => `/${l}/cms/${t}/ai-builder`, icon: "Sparkles" },
            { label: "Create Page", href: (l: string, t: string) => `/${l}/cms/${t}/landing/new`, icon: "PlusCircle" },
            { label: "Templates", href: (l: string, t: string) => `/${l}/cms/${t}/landing/templates`, icon: "LayoutTemplate" },
            { label: "My WP Site", href: (l: string, t: string) => `/${l}/cms/${t}/apps/wordpress`, icon: "Globe" }
        ]
    },
    {
        slug: "platform",
        href: (l: string, t: string) => `/${l}/cms/${t}/platform`,
        icon: "ServerIcon",
        label: "Platform Admin",
        section: "System",
        color: "red",
        options: [
            { label: "Overview", href: (l: string, t: string) => `/${l}/cms/${t}/platform`, icon: "LayoutDashboard" },
            { label: "Workspaces", href: (l: string, t: string) => `/${l}/cms/${t}/platform/teams`, icon: "Globe" },
            { label: "Users", href: (l: string, t: string) => `/${l}/cms/${t}/platform/users`, icon: "Users" }
        ]
    },
    { slug: "activity", href: (l: string, t: string) => `/${l}/cms/${t}/activity`, icon: "Activity", label: "Activity Log", section: "System", color: "gray" },
    {
        slug: "integrations",
        href: (l: string, t: string) => `/${l}/cms/${t}/oauth`,
        icon: "Shield",
        label: "AI Integrations",
        section: "System",
        color: "red",
        options: [
            { label: "AI Models BYOK", href: (l: string, t: string) => `/${l}/cms/${t}/oauth?tab=ai`, icon: "Brain" },
            { label: "System Config", href: (l: string, t: string) => `/${l}/cms/${t}/oauth?tab=system`, icon: "Settings" }
        ]
    },
    {
        slug: "apps",
        href: (l: string, t: string) => `/${l}/cms/${t}/apps`,
        icon: "Grid",
        label: "Apps & Plugins",
        section: "System",
        color: "emerald"
    },
    {
        slug: "security",
        href: (l: string, t: string) => `/${l}/cms/${t}/apps?category=security`,
        icon: "ShieldCheck",
        label: "Security & Firewall",
        section: "System",
        color: "slate",
        options: [
            { label: "Cloudflare", href: (l: string, t: string) => `/${l}/cms/${t}/apps/cloudflare`, icon: "Cloud" },
            { label: "Wordfence", href: (l: string, t: string) => `/${l}/cms/${t}/apps/wordfence`, icon: "Shield" }
        ]
    },
    {
        slug: "settings",
        href: (l: string, t: string) => `/${l}/cms/${t}/settings`,
        icon: "Settings",
        label: "Settings",
        section: "System",
        color: "slate",
        options: [
            { label: "General", href: (l: string, t: string) => `/${l}/cms/${t}/settings`, icon: "Settings" },
            { label: "Profile", href: (l: string, t: string) => `/${l}/cms/${t}/settings/profile`, icon: "User" },
            { label: "Security", href: (l: string, t: string) => `/${l}/cms/${t}/settings/security`, icon: "Shield" }
        ]
    },
    { slug: "university", href: (l: string, t: string) => `/${l}/cms/${t}/university`, icon: "GraduationCap", label: "University", section: "System", color: "violet" },
    { slug: "voice", href: (l: string, t: string) => `/${l}/cms/${t}/voice`, icon: "Mic", label: "Universal Voice", section: "System", color: "violet", hidden: true },
];

