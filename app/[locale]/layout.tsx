import "./globals.css";

import { Metadata } from "next";
import { Inter } from "next/font/google";
import { unstable_cache } from "next/cache";

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { ToastProvider } from "@/app/providers/ToastProvider";
import NextTopLoader from "nextjs-toploader";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import SuspensionCheck from "@/components/SuspensionCheck";
import { SessionProvider } from "@/app/providers/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SubscriptionOverlay from "@/app/[locale]/components/SubscriptionOverlay";

// Optimized font loading with display swap for faster text rendering
const inter = Inter({ subsets: ["latin"], display: "swap" });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

async function getLocales(locale: string) {
  try {
    return (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

function getSafeBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const PRODUCTION_FALLBACK = "https://crm.ledger1.ai";

  if (!envUrl || envUrl.trim() === "") {
    return PRODUCTION_FALLBACK;
  }

  const trimmed = envUrl.trim();

  // Skip localhost URLs in production
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(trimmed)) {
    return PRODUCTION_FALLBACK;
  }

  // Ensure URL has protocol
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

// Cache SEO config for 1 hour to avoid database calls on every page load
const getCachedSeoConfig = unstable_cache(
  async () => {
    try {
      const { getSeoConfig } = await import("@/actions/cms/seo-actions");
      return await getSeoConfig();
    } catch (e) {
      console.warn("Failed to load SEO config:", e);
      return null;
    }
  },
  ["seo-config"],
  { revalidate: 3600 } // 1 hour cache
);

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const messages = await getLocales(locale);
  const t = createTranslator({ locale, messages });

  // Fetch cached SEO Config (avoids DB call on every page load)
  const seoConfig = await getCachedSeoConfig();

  const siteUrl = getSafeBaseUrl();

  const title = seoConfig?.globalTitle || "Ledger1 CMS | The Intelligent Visual Builder";
  const description = seoConfig?.globalDescription || "";
  const ogImage = seoConfig?.ogImage || "/images/opengraph-image.png";
  const ogTitle = seoConfig?.ogTitle || title;
  const ogDescription = seoConfig?.ogDescription || description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | Ledger1 CMS`,
    },
    description: description,
    keywords: seoConfig?.globalKeywords?.length ? seoConfig.globalKeywords : ["CMS", "AI CMS", "Headless CMS", "Visual Builder", "Next.js CMS", "Enterprise Content", "AI Agents"],
    authors: [{ name: "Ledger1 CMS Team" }],
    creator: "Ledger1 CMS",
    publisher: "Ledger1 CMS",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: siteUrl,
      siteName: "Ledger1 CMS",
      locale: locale,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: (seoConfig?.twitterCard as "summary_large_image" | "summary") || "summary_large_image",
      title: seoConfig?.twitterTitle || ogTitle,
      description: seoConfig?.twitterDescription || ogDescription,
      creator: "@Ledger1AI",
      images: [seoConfig?.twitterImage || ogImage],
    },
    icons: {
      icon: seoConfig?.faviconUrl?.startsWith("data:")
        ? seoConfig.faviconUrl
        : (seoConfig?.faviconUrl || "/ledger1-cms-logo.png") + "?v=3",
      shortcut: seoConfig?.faviconUrl?.startsWith("data:")
        ? seoConfig.faviconUrl
        : (seoConfig?.faviconUrl || "/ledger1-cms-logo.png") + "?v=3",
      apple: seoConfig?.faviconUrl?.startsWith("data:")
        ? seoConfig.faviconUrl
        : (seoConfig?.faviconUrl || "/apple-touch-icon.png") + "?v=3",
    },
    manifest: "/site.webmanifest",
    alternates: {
      // Canonical should be the current page URL
      canonical: locale === "en" ? siteUrl : `${siteUrl}/${locale}`,
      languages: {
        // Using proper ISO 639-1 language codes
        "x-default": siteUrl, // Default for unspecified languages
        "en": siteUrl,
        "de": `${siteUrl}/de`,
        "cs": `${siteUrl}/cs`, // Czech uses "cs" not "cz"
        "uk": `${siteUrl}/uk`,
      },
    },
  };
}

// ... existing imports

export function generateStaticParams() {
  return ["en", "de", "cs", "uk"].map((locale) => ({ locale }));
}

export default async function RootLayout(props: Props) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;

  // Enable static rendering
  setRequestLocale(locale);

  // RESTORING: Data Fetching and Components
  const messages = await getLocales(locale);
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1, maximum-scale=5, user-scalable=1"
        />
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://uxwing.com" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
      </head>
      <body className={inter.className + " min-h-screen"} suppressHydrationWarning>
        <NextTopLoader color="#2563EB" showSpinner={false} />
        <AnalyticsTracker />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
              {children}
              {/* Team Suspension Check */}
              <SuspensionCheck />
              <ToastProvider />
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
        <Toaster />
        <SonnerToaster />
        <SubscriptionOverlay />

      </body>
    </html >
  );
}
