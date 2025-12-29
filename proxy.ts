import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// Czech uses ISO code "cs" not "cz"
const locales = ["en", "de", "cs", "uk"];
const publicPages = ["/", "/sign-in", "/pricing", "/about", "/contact", "/terms", "/privacy", "/features", "/roadmap", "/blog", "/docs"];

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: "en",
    // Avoid 302 redirect from / to /en - keeps English at root URL
    localePrefix: "as-needed",
});

const authMiddleware = withAuth(
    // Note: The middleware function will only be invoked if the authorized callback returns true.
    function onSuccess(req) {
        // If it's an API route, do NOT run intlMiddleware, just pass through
        if (req.nextUrl.pathname.startsWith("/api")) {
            return NextResponse.next();
        }
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Public API routes
                if (
                    path.startsWith("/api/webhooks") ||
                    path.startsWith("/api/public") ||
                    path.startsWith("/api/auth")
                ) {
                    return true;
                }

                // API Routes: Let the API route handler itself check for session.
                // This prevents the middleware from redirecting API calls to the login page (HTML)
                // when the session is invalid or missing, which breaks the frontend JSON parsing.
                if (path.startsWith("/api")) {
                    return true;
                }

                const isCmsRoute = false; // Disabled as per previous config

                if (isCmsRoute) {
                    return !!token;
                }

                return true;
            },
        },
        pages: {
            signIn: "/en/cms/login",
        },
    }
);

export function proxy(req: NextRequest) {
    // Regex to check if the path is a public file or next internals
    // We exclude API from this check because we WANT to run auth middleware on API
    const excludePattern = /^(\/_next|\/echo|.*\\..*)/;

    if (excludePattern.test(req.nextUrl.pathname)) {
        return;
    }

    return (authMiddleware as any)(req);
}

export const config = {
    // Match all paths except internal next stuff and static files
    matcher: ["/((?!_next|echo|.*\\..*).*)"],
};
