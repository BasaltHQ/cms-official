"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useRecentVisits() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname || !pathname.includes("/cms/")) return;

        // Skip non-content pages
        if (pathname.endsWith("/cms") || pathname.includes("/cms/media") || pathname.includes("/cms/settings")) return;

        const visited = JSON.parse(localStorage.getItem("cms_recent_visits") || "[]");

        // Construct full path with significant query params
        const currentParams = searchParams.toString();
        // Only track specific params that indicate "content" (like ?edit=...) to avoid noise
        const hasEditParam = searchParams.has("edit") || searchParams.has("id");

        // Use full path if it has relevant params, otherwise just pathname
        const fullPath = (hasEditParam && currentParams) ? `${pathname}?${currentParams}` : pathname;

        const newItem = {
            path: fullPath,
            timestamp: new Date().toISOString(),
            title: document.title.split("|")[0].trim() || "Untitled Page"
        };

        // Filter out duplicates of the same path
        const unique = [newItem, ...visited.filter((v: any) => v.path !== fullPath)].slice(0, 10);

        localStorage.setItem("cms_recent_visits", JSON.stringify(unique));
    }, [pathname, searchParams]);
}
