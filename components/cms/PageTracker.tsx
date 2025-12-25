"use client";

import { useRecentVisits } from "@/hooks/use-recent-visits";
import { Suspense } from "react";

function TrackerContent() {
    useRecentVisits();
    return null;
}

export function PageTracker() {
    return (
        <Suspense fallback={null}>
            <TrackerContent />
        </Suspense>
    );
}
