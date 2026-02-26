"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { AppItem } from "@/components/cms/apps/AppMarketplaceItem";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Settings } from "lucide-react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";

// Dashboards
import { StripeDashboard } from "./components/StripeDashboard";
import { SurgeDashboard } from "./components/SurgeDashboard";
import { GoogleAnalyticsDashboard } from "./components/GoogleAnalyticsDashboard";
import { ShopifyDashboard } from "./components/ShopifyDashboard";
import { AlgoliaDashboard } from "./components/AlgoliaDashboard";
import { SocialDashboard } from "./components/SocialDashboard";
import { MailchimpDashboard } from "./components/MailchimpDashboard";
import { IntercomDashboard } from "./components/IntercomDashboard";
import { SlackDashboard } from "./components/SlackDashboard";
import { HubSpotDashboard } from "./components/HubSpotDashboard";
import { SecurityDashboard } from "./components/SecurityDashboard";
import { UtilityDashboard } from "./components/UtilityDashboard";

// Temporary text for MOCK_APPS sharing (Simulating shared data layer)
const FIND_APP = (id: string) => {
    // This duplicates logic but ensures safety if imports fail.
    // In a real app this comes from a database or context
    const allApps = [
        ...MOCK_APPS_DATA,
        // Add others if MOCK_APPS_DATA isn't available here without export
    ];
    return allApps.find(a => a.id === id);
};

// Re-defining data locally for robust isolation in this "Beat WordPress" demo
const MOCK_APPS_DATA: AppItem[] = [
    // Phase 1 - Commerce
    { id: "stripe", name: "Stripe", description: "Payment processing.", icon: "https://cdn.simpleicons.org/stripe/635BFF", category: "Commerce", author: "Stripe", rating: 4.8, installs: "1M+", status: "active", connected: false, updatedAt: "1 day ago", docsUrl: "https://docs.stripe.com/" },
    { id: "surge", name: "Surge", description: "Crypto payments.", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/ethereum-eth-icon.png", category: "Commerce", author: "Surge", rating: 5.0, installs: "10k+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://surge.basalthq.com/developers" },
    // Phase 2 - Analytics
    { id: "google-analytics", name: "Google Analytics 4", description: "Traffic analytics.", icon: "https://cdn.simpleicons.org/googleanalytics/E37400", category: "Analytics", author: "Google", rating: 4.5, installs: "10M+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://developers.google.com/analytics" },
    { id: "shopify", name: "Shopify", description: "E-commerce sync.", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/shopify-icon.png", category: "Commerce", author: "Shopify Inc", rating: 4.8, installs: "2M+", status: "active", connected: false, updatedAt: "2 days ago", docsUrl: "https://shopify.dev/docs" },
    { id: "algolia", name: "Algolia", description: "Search analytics.", icon: "https://cdn.simpleicons.org/algolia/003DFF", category: "Analytics", author: "Algolia", rating: 4.7, installs: "500k+", status: "active", connected: false, updatedAt: "1 month ago", docsUrl: "https://www.algolia.com/doc/" },
    // Phase 3 Additions - Social
    { id: "x_social", name: "X (Twitter)", description: "Social broadcasting.", icon: "https://cdn.simpleicons.org/x/white", category: "Social", author: "X Corp", rating: 4.2, installs: "8M+", status: "active", connected: false, updatedAt: "3 days ago", docsUrl: "https://developer.twitter.com/en/docs" },
    { id: "linkedin", name: "LinkedIn", description: "Professional networking.", icon: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg", category: "Social", author: "Microsoft", rating: 4.5, installs: "6M+", status: "active", connected: false, updatedAt: "1 week ago", docsUrl: "https://learn.microsoft.com/en-us/linkedin/" },
    { id: "reddit", name: "Reddit", description: "Community engagement.", icon: "https://cdn.simpleicons.org/reddit/FF4500", category: "Social", author: "Reddit", rating: 4.0, installs: "3M+", status: "active", connected: false, updatedAt: "1 day ago", docsUrl: "https://www.reddit.com/dev/api/" },
    { id: "discord", name: "Discord", description: "Community chat server.", icon: "https://cdn.simpleicons.org/discord/5865F2", category: "Social", author: "Discord", rating: 4.8, installs: "12M+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://discord.com/developers/docs/intro" },
    { id: "youtube", name: "YouTube", description: "Video sharing.", icon: "https://cdn.simpleicons.org/youtube/white", category: "Social", author: "Google", rating: 4.9, installs: "50M+", status: "active", connected: false, updatedAt: "1 day ago", docsUrl: "https://developers.google.com/youtube/v3" },
    { id: "twitch", name: "Twitch", description: "Live streaming.", icon: "https://cdn.simpleicons.org/twitch/9146FF", category: "Social", author: "Twitch", rating: 4.6, installs: "4M+", status: "active", connected: false, updatedAt: "5 days ago", docsUrl: "https://dev.twitch.tv/docs" },
    { id: "pinterest", name: "Pinterest", description: "Visual discovery.", icon: "https://cdn.simpleicons.org/pinterest/E60023", category: "Social", author: "Pinterest", rating: 4.3, installs: "3M+", status: "active", connected: false, updatedAt: "2 weeks ago", docsUrl: "https://developers.pinterest.com/docs/api/v5/" },
    { id: "tiktok", name: "TikTok", description: "Short-form video.", icon: "https://cdn.simpleicons.org/tiktok/white", category: "Social", author: "TikTok", rating: 4.7, installs: "20M+", status: "active", connected: false, updatedAt: "1 day ago", docsUrl: "https://developers.tiktok.com/" },
    { id: "snapchat", name: "Snapchat", description: "Multimedia messaging.", icon: "https://cdn.simpleicons.org/snapchat/FFFC00", category: "Social", author: "Snap Inc", rating: 4.1, installs: "6M+", status: "active", connected: false, updatedAt: "3 weeks ago", docsUrl: "https://developers.snap.com/" },
    { id: "meta_suite", name: "Meta Business", description: "Facebook & Instagram management.", icon: "https://cdn.simpleicons.org/meta/0081FB", category: "Social", author: "Meta", rating: 4.4, installs: "15M+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://developers.facebook.com/docs/" },

    // Phase 3 Additions - Marketing
    { id: "mailchimp", name: "Mailchimp", description: "Email marketing.", icon: "https://cdn.simpleicons.org/mailchimp/FFE01B", category: "Marketing", author: "Intuit", rating: 4.6, installs: "5M+", status: "active", connected: false, updatedAt: "3 days ago", docsUrl: "https://mailchimp.com/developer/" },
    { id: "intercom", name: "Intercom", description: "Customer messaging.", icon: "https://cdn.simpleicons.org/intercom/000000", category: "Marketing", author: "Intercom", rating: 4.7, installs: "200k+", status: "active", connected: false, updatedAt: "1 week ago", docsUrl: "https://developers.intercom.com/" },
    { id: "slack", name: "Slack", description: "Team communication.", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/slack-icon.png", category: "Marketing", author: "Salesforce", rating: 4.9, installs: "10M+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://api.slack.com/" },
    { id: "hubspot", name: "HubSpot", description: "CRM & Marketing.", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/hubspot-icon.png", category: "Marketing", author: "HubSpot", rating: 4.7, installs: "4M+", status: "active", connected: false, updatedAt: "2 days ago", docsUrl: "https://developers.hubspot.com/docs/api/" },
    // Phase 4 - CMS & Utilities
    { id: "yoast", name: "Yoast SEO", description: "SEO optimization.", icon: "https://avatars.githubusercontent.com/u/4690436?v=4", category: "Utility", author: "Yoast", rating: 4.8, installs: "5M+", status: "active", connected: false, updatedAt: "1 week ago", docsUrl: "https://developer.yoast.com/" },
    { id: "wordpress", name: "WordPress", description: "Content management.", icon: "https://s.w.org/style/images/about/WordPress-logotype-wmark.png", category: "Utility", author: "WordPress", rating: 4.9, installs: "100M+", status: "active", connected: true, updatedAt: "Just now", docsUrl: "https://developer.wordpress.org/" },
    { id: "woocommerce", name: "WooCommerce", description: "Open source commerce.", icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/woocommerce-icon.png", category: "Commerce", author: "Automattic", rating: 4.6, installs: "10M+", status: "active", connected: false, updatedAt: "2 days ago", docsUrl: "https://woocommerce.com/document/woocommerce-rest-api/" },
    // Phase 5 - Security & Automation
    { id: "cloudflare", name: "Cloudflare", description: "DDoS Protection & CDN.", icon: "https://cdn.simpleicons.org/cloudflare/F38020", category: "Security", author: "Cloudflare", rating: 4.9, installs: "8M+", status: "active", connected: false, updatedAt: "Just now", docsUrl: "https://developers.cloudflare.com/api/" },
    { id: "wordfence", name: "Wordfence", description: "Firewall & Malware Scan.", icon: "https://cdn.simpleicons.org/wordpress/21759B", category: "Security", author: "Defiant", rating: 4.7, installs: "4M+", status: "active", connected: false, updatedAt: "1 week ago", docsUrl: "https://www.wordfence.com/help/advanced/wordfence-api/" },
    { id: "zapier", name: "Zapier", description: "Automate workflows.", icon: "https://cdn.simpleicons.org/zapier/FF4A00", category: "Utility", author: "Zapier", rating: 4.8, installs: "6M+", status: "active", connected: false, updatedAt: "3 days ago", docsUrl: "https://docs.zapier.com/" }
];

export default function AppDashboardPage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    const router = useRouter();
    const [app, setApp] = useState<AppItem | undefined>(undefined);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    useEffect(() => {
        // In reality, fetch from API or Context
        // For demo, we try to use the passed ID to find in our static list,
        // or just construct a basic object if not found in the mini-list above.
        const found = MOCK_APPS_DATA.find(a => a.id === appId) || {
            id: appId,
            name: appId.charAt(0).toUpperCase() + appId.slice(1),
            category: "Unknown",
            description: "App Dashboard",
            icon: `https://cdn.simpleicons.org/${appId}`, // Intelligent fallback
            author: "Unknown",
            rating: 0,
            installs: "0",
            status: "active",
            connected: false,
            updatedAt: "Unknown",
            docsUrl: `https://duckduckgo.com/?q=${appId}+api+docs` // Better than nothing
        };
        setApp(found);
    }, [appId]);

    if (!app) return <div className="p-10 text-slate-400">Loading App...</div>;

    const renderDashboard = () => {
        switch (appId) {
            case "stripe":
                return <StripeDashboard />;
            case "surge":
                return <SurgeDashboard />;
            case "google-analytics":
                return <GoogleAnalyticsDashboard />;
            case "shopify":
                return <ShopifyDashboard />;
            case "algolia":
                return <AlgoliaDashboard />;
            case "x_social":
                return <SocialDashboard appId="x_social" appName="X (Twitter)" accentColor="#000000" iconUrl="https://cdn.simpleicons.org/x/white" />;
            case "linkedin":
                return <SocialDashboard appId="linkedin" appName="LinkedIn" accentColor="#0A66C2" iconUrl="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" />;
            case "reddit":
                return <SocialDashboard appId="reddit" appName="Reddit" accentColor="#FF4500" iconUrl="https://cdn.simpleicons.org/reddit/FF4500" />;
            case "discord":
                return <SocialDashboard appId="discord" appName="Discord" accentColor="#5865F2" iconUrl="https://cdn.simpleicons.org/discord/5865F2" />;
            case "youtube":
                return <SocialDashboard appId="youtube" appName="YouTube" accentColor="#FF0000" iconUrl="https://cdn.simpleicons.org/youtube/white" />;
            case "twitch":
                return <SocialDashboard appId="twitch" appName="Twitch" accentColor="#9146FF" iconUrl="https://cdn.simpleicons.org/twitch/9146FF" />;
            case "pinterest":
                return <SocialDashboard appId="pinterest" appName="Pinterest" accentColor="#BD081C" iconUrl="https://cdn.simpleicons.org/pinterest/E60023" />;
            case "tiktok":
                return <SocialDashboard appId="tiktok" appName="TikTok" accentColor="#000000" iconUrl="https://cdn.simpleicons.org/tiktok/white" />;
            case "snapchat":
                return <SocialDashboard appId="snapchat" appName="Snapchat" accentColor="#FFFC00" iconUrl="https://cdn.simpleicons.org/snapchat/FFFC00" />;
            case "meta_suite":
                return <SocialDashboard appId="meta_suite" appName="Meta Business" accentColor="#046A38" iconUrl="https://cdn.simpleicons.org/meta/0081FB" />;
            case "mailchimp":
                return <MailchimpDashboard />;
            case "intercom":
                return <IntercomDashboard />;
            case "slack":
                return <SlackDashboard />;
            case "hubspot":
                return <HubSpotDashboard />;
            // Security
            case "wordfence":
                return <SecurityDashboard appId="wordfence" appName="Wordfence" description="Firewall & Malware Scan." />;
            case "cloudflare":
                return <SecurityDashboard appId="cloudflare" appName="Cloudflare" description="DDoS Protection & CDN." />;
            // Utility
            case "zapier":
                return <UtilityDashboard appId="zapier" appName="Zapier" description="Automate workflows." />;
            case "yoast":
                return <UtilityDashboard appId="yoast" appName="Yoast SEO" description="SEO Analysis & Optimization." />;
            case "wordpress":
                return <UtilityDashboard appId="wordpress" appName="WordPress" description="CMS Synchronization." />;
            case "woocommerce":
                return <ShopifyDashboard />; // Reuse Commerce Dashboard (it's generic enough visually)
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            <Settings className="w-8 h-8 opacity-50" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-2">Dashboard Coming Soon</h2>
                        <p>The specialized dashboard for {app.name} is under construction.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setIsConfigOpen(true)}>
                            Configure Settings
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B]">
            {/* Native App Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090B]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        {app.icon && <img src={app.icon} className="w-8 h-8 rounded-lg" />}
                        <div>
                            <h1 className="font-semibold text-lg text-white leading-none">{app.name}</h1>
                            <span className="text-xs text-slate-500">Dashboard</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setIsConfigOpen(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => app.docsUrl && window.open(app.docsUrl, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open documentation
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderDashboard()}
            </div>

            <AppConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                app={app}
            />
        </div>
    );
}
