"use client";

import { useEditor } from "@/components/landing/EditorContext";
import { LandingPageSidebar } from "@/components/landing/LandingPageSidebar";

export function LandingLayoutClient({
    sidebarProps,
    children
}: {
    sidebarProps: { pages: any[], locale: string, tenant: string },
    children: React.ReactNode
}) {
    const { isAdvancedMode } = useEditor();

    return (
        <div className="landing-layout-client flex-1 flex w-full h-full overflow-hidden bg-[#09090b]">
            {!isAdvancedMode && (
                <div id="landing-inner-sidebar-wrapper" className="h-full flex flex-col">
                    <LandingPageSidebar pages={sidebarProps.pages} locale={sidebarProps.locale} tenant={sidebarProps.tenant} />
                </div>
            )}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}
