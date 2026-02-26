import { prismadb } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption/api-keys";

export interface WPPost {
    id: number;
    date: string;
    slug: string;
    status: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    featured_media: number;
    _embedded?: any;
}

export interface WPMedia {
    id: number;
    date: string;
    source_url: string;
    mime_type: string;
    title: { rendered: string };
    alt_text: string;
}

export class WordPressService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    private async getCredentials() {
        const connection = await prismadb.appConnection.findFirst({
            where: {
                userId: this.userId,
                providerId: "wordpress",
                isActive: true
            }
        });

        if (!connection || !connection.credentials) {
            throw new Error("WordPress connection not found");
        }

        const creds = connection.credentials as any;
        let password = creds.application_password;
        try {
            password = decryptApiKey(creds.application_password);
        } catch (e) {
            // Legacy: use as is if decryption fails
        }

        let url = creds.url.replace(/\/$/, ""); // Remove trailing slash
        // Auto-fix common URL mistakes
        url = url.replace(/\/wp-admin$/, "").replace(/\/wp-login\.php$/, "");

        return {
            url: url,
            username: creds.username,
            password: password
        };
    }

    private async _fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const creds = await this.getCredentials();
        const auth = Buffer.from(`${creds.username}:${creds.password}`).toString("base64");

        // Log who we are attempting to auth as (anonymized)
        console.log(`[WP_FETCH] ${options.method || 'GET'} ${endpoint} | User: ${creds.username} | Host: ${new URL(creds.url).hostname}`);

        const headers: Record<string, string> = {
            ...(options.headers as any),
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json",
            "User-Agent": "Basalt-CMS/1.0 (Agentic-Sync)"
        };

        // Method tunneling: if it's a PUT/PATCH/DELETE, we use POST + header + param
        // This is the most compatible way for restrictive firewalls
        const originalMethod = options.method || 'GET';
        const isUpdate = ['PUT', 'PATCH', 'DELETE'].includes(originalMethod);
        const fetchMethod = isUpdate ? 'POST' : originalMethod;

        if (isUpdate) {
            headers["X-HTTP-Method-Override"] = originalMethod;
        }

        let url = `${creds.url}/wp-json/wp/v2${endpoint}`;

        // Apply tunneling param if updating
        if (isUpdate) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}_method=${originalMethod}`;
        }

        let res = await fetch(url, { ...options, method: fetchMethod, headers });

        if (res.status === 404) {
            console.log(`[WP_RETRY] Standard path failed (404). Retrying with ?rest_route=...`);
            const [path, query] = endpoint.split('?');
            const cleanPath = path || '';
            const cleanQuery = query ? `&${query}` : '';
            url = `${creds.url}/index.php?rest_route=/wp/v2${cleanPath}${cleanQuery}`;

            if (isUpdate) {
                url += `&_method=${originalMethod}`;
            }

            res = await fetch(url, { ...options, method: fetchMethod, headers });
        }

        if (!res.ok) {
            let errorMessage = res.statusText;
            try {
                const error = await res.json();
                errorMessage = error.message || error.code || res.statusText;
            } catch (e) {
                // Not JSON
            }

            console.error(`[WP_API_ERROR] URL: ${url} | Status: ${res.status} | Message: ${errorMessage}`);

            if (res.status === 401 || res.status === 403 || errorMessage.includes('not allowed')) {
                throw new Error(`WordPress Permissions Error: ${errorMessage}. (HTTP ${res.status}). \n\nCRITICAL: On Plesk/Pannel, this is usually because the "Authorization" header is being stripped. \n\nFIX: Add this line to the TOP of your WordPress .htaccess file:\nSetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1`);
            }

            throw new Error(`WordPress API Error: ${errorMessage} (Status ${res.status})`);
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            console.error(`[WP_API_ERROR] Endpoint returned HTML (likely 404/Home). URL: ${url}`);
            throw new Error("WordPress API endpoint returned HTML. Please check your WordPress Site URL in Settings.");
        }

        return res;
    }

    private async fetchAPI(endpoint: string, options: RequestInit = {}) {
        const res = await this._fetch(endpoint, options);
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error(`[WP_API_ERROR] Invalid JSON from ${endpoint}. Status: ${res.status}. Content-Type: ${res.headers.get('content-type')}`);
            // If we get here, it might be some other non-JSON text.
            throw new Error(`Invalid JSON response from WordPress. Status: ${res.status}`);
        }
    }

    async getPages(page = 1, perPage = 10): Promise<WPPost[]> {
        return this.fetchAPI(`/pages?page=${page}&per_page=${perPage}&_embed`);
    }

    async getPosts(page = 1, perPage = 10): Promise<WPPost[]> {
        return this.fetchAPI(`/posts?page=${page}&per_page=${perPage}&_embed`);
    }

    async getPageById(id: number): Promise<WPPost> {
        return this.fetchAPI(`/pages/${id}?_embed`);
    }

    async getPostById(id: number): Promise<WPPost> {
        return this.fetchAPI(`/posts/${id}?_embed`);
    }

    async getPageBySlug(slug: string): Promise<WPPost | null> {
        const res = await this.fetchAPI(`/pages?slug=${slug}&_embed`);
        return res && res.length > 0 ? res[0] : null;
    }

    async getPostBySlug(slug: string): Promise<WPPost | null> {
        const res = await this.fetchAPI(`/posts?slug=${slug}&_embed`);
        return res && res.length > 0 ? res[0] : null;
    }

    async getMedia(page = 1, perPage = 20): Promise<WPMedia[]> {
        return this.fetchAPI(`/media?page=${page}&per_page=${perPage}`);
    }

    async getMediaById(id: number): Promise<WPMedia> {
        return this.fetchAPI(`/media/${id}`);
    }

    // Write Methods
    async createPage(data: Partial<WPPost>): Promise<WPPost> {
        return this.fetchAPI('/pages', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updatePage(id: number, data: Partial<WPPost>): Promise<WPPost> {
        try {
            console.log(`[WP_SYNC] Attempting REST API update for Page ${id}...`);
            return await this.fetchAPI(`/pages/${id}`, {
                method: 'PUT', // Use PUT for updates as it's more standard and sometimes bypasses POST firewalls
                body: JSON.stringify(data)
            });
        } catch (error: any) {
            console.warn(`[WP_SYNC] REST API update failed: ${error.message}`);

            // For almost any error (Auth, Bad Request, Server Error), try XML-RPC as a robust fallback
            console.log(`[WP_SYNC] Falling back to XML-RPC for Page ${id}...`);
            try {
                const result = await this.updatePageXmlRpc(id, data);
                return result;
            } catch (xmlError: any) {
                console.error(`[WP_SYNC] XML-RPC fallback also failed: ${xmlError.message}`);
                throw new Error(`Sync failed. REST: ${error.message} | XML-RPC: ${xmlError.message}`);
            }
        }
    }

    async createPost(data: Partial<WPPost>): Promise<WPPost> {
        return this.fetchAPI('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updatePost(id: number, data: Partial<WPPost>): Promise<WPPost> {
        try {
            console.log(`[WP_SYNC] Attempting REST API update for Post ${id}...`);
            return await this.fetchAPI(`/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (error: any) {
            console.warn(`[WP_SYNC] REST API update failed: ${error.message}`);

            console.log(`[WP_SYNC] Falling back to XML-RPC for Post ${id}...`);
            try {
                const result = await this.updatePostXmlRpc(id, data);
                return result;
            } catch (xmlError: any) {
                console.error(`[WP_SYNC] XML-RPC fallback also failed: ${xmlError.message}`);
                throw new Error(`Sync failed. REST: ${error.message} | XML-RPC: ${xmlError.message}`);
            }
        }
    }


    // XML-RPC Fallback Implementation
    // XML-RPC bypasses header-stripping because it sends credentials in the BODY.
    public async xmlRpcCall(methodName: string, params: any[]): Promise<any> {
        const creds = await this.getCredentials();
        const url = `${creds.url}/xmlrpc.php`;

        const buildParams = (p: any[]): string => {
            return p.map(val => {
                if (typeof val === 'string') return `<value><string>${val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string></value>`;
                if (typeof val === 'number') return `<value><int>${val}</int></value>`;
                if (typeof val === 'boolean') return `<value><boolean>${val ? 1 : 0}</boolean></value>`;
                if (typeof val === 'object' && val !== null) {
                    let struct = '<value><struct>';
                    for (const key in val) {
                        struct += `<member><name>${key}</name>${buildParams([val[key]])}</member>`;
                    }
                    struct += '</struct></value>';
                    return struct;
                }
                return `<value><nil/></value>`;
            }).join('');
        };

        const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>
    <param><value><int>0</int></value></param> <!-- blog_id -->
    <param>${buildParams([creds.username])}</param>
    <param>${buildParams([creds.password])}</param>
    ${params.map(p => `<param>${buildParams([p])}</param>`).join('')}
  </params>
</methodCall>`;

        console.log(`[XML-RPC] Calling ${methodName} to ${url}`);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'User-Agent': 'Basalt-CMS/1.0 (XML-RPC-Fallback)'
            },
            body: body
        });

        if (!res.ok) {
            console.error(`[XML-RPC] HTTP Error: ${res.status} ${res.statusText}`);
            throw new Error(`XML-RPC HTTP Error: ${res.status} ${res.statusText}`);
        }

        const xml = await res.text();
        console.log(`[XML-RPC] Response (first 500 chars): ${xml.substring(0, 500)}`);

        // Basic parser for XML-RPC responses
        if (xml.includes('<fault>')) {
            const faultStringMatch = xml.match(/<name>faultString<\/name><value><string>([\s\S]*?)<\/string><\/value>/);
            const faultString = faultStringMatch ? faultStringMatch[1] : 'Unknown XML-RPC Fault';
            console.error(`[XML-RPC] Fault: ${faultString}`);
            throw new Error(`WordPress XML-RPC Error: ${faultString}`);
        }

        // Check for success (wp.editPost returns boolean true on success)
        const successMatch = xml.includes('<boolean>1</boolean>') || xml.includes('<boolean>true</boolean>');
        console.log(`[XML-RPC] Success detected: ${successMatch}`);

        return { success: successMatch, raw: xml };
    }

    async updatePageXmlRpc(id: number, data: Partial<WPPost>): Promise<any> {
        // XML-RPC wp.editPost works for both posts and pages
        const xmlRpcData: any = {};
        if (data.title) xmlRpcData.post_title = typeof data.title === 'object' ? data.title.rendered : data.title;
        if (data.content) xmlRpcData.post_content = typeof data.content === 'object' ? data.content.rendered : data.content;

        console.log(`[XML-RPC] updatePageXmlRpc called for ID ${id} with data:`, JSON.stringify(xmlRpcData).substring(0, 300));

        return this.xmlRpcCall('wp.editPost', [id, xmlRpcData]);
    }

    async updatePostXmlRpc(id: number, data: Partial<WPPost>): Promise<any> {
        return this.updatePageXmlRpc(id, data);
    }

    async getCurrentUser(): Promise<any> {
        try {
            return await this.fetchAPI('/users/me');
        } catch (e) {
            console.error("[WP_DIAGNOSTIC] Failed to fetch current user info:", e);
            throw e;
        }
    }

    async getCounts(): Promise<{ pages: number; posts: number; media: number }> {
        try {
            const [pagesRes, postsRes, mediaRes] = await Promise.all([
                this._fetch('/pages?per_page=1', { method: 'HEAD' }),
                this._fetch('/posts?per_page=1', { method: 'HEAD' }),
                this._fetch('/media?per_page=1', { method: 'HEAD' })
            ]);

            return {
                pages: parseInt(pagesRes.headers.get('x-wp-total') || '0', 10),
                posts: parseInt(postsRes.headers.get('x-wp-total') || '0', 10),
                media: parseInt(mediaRes.headers.get('x-wp-total') || '0', 10)
            };
        } catch (error) {
            console.error("Failed to fetch WP counts:", error);
            return { pages: 0, posts: 0, media: 0 };
        }
    }

    // Get raw page content with shortcodes (requires auth)
    async getPageWithRawContent(id: number): Promise<any> {
        return this.fetchAPI(`/pages/${id}?context=edit&_embed`);
    }

    async getPostWithRawContent(id: number): Promise<any> {
        return this.fetchAPI(`/posts/${id}?context=edit&_embed`);
    }

    // Scrape the full rendered HTML from a WordPress page URL
    // Returns both HTML content and extracted CSS for background parsing
    async scrapePageHtml(pageUrl: string): Promise<string> {
        try {
            // Simple fetch - complex headers trigger Plesk WAF 428 error
            const res = await fetch(pageUrl);

            if (!res.ok) {
                throw new Error(`Failed to fetch page: ${res.status}`);
            }

            const html = await res.text();

            // Get base URL for fixing relative paths
            const baseUrl = new URL(pageUrl).origin;

            // Extract inline styles from <head> for background analysis
            let inlineStyles = '';
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let styleMatch;
            while ((styleMatch = styleRegex.exec(html)) !== null) {
                if (!styleMatch[1].includes('@charset') && styleMatch[1].length < 50000) {
                    inlineStyles += styleMatch[1];
                }
            }

            // Store CSS for later use in background extraction
            this.lastScrapedCSS = inlineStyles;
            console.log(`[WP_SCRAPE] Extracted ${inlineStyles.length} chars of CSS`);

            // Try to get the main content area ONLY (not header, footer, sidebar)
            let contentHtml = '';

            // Look for main content container - try multiple patterns
            const contentPatterns = [
                // Main content wrapper (Flatsome uses #main)
                /<div[^>]*id=["']main["'][^>]*>([\s\S]*?)<\/div>\s*<(?:footer|div[^>]*class=["'][^"']*footer)/i,
                // Try class="main-content"
                /<div[^>]*class=["'][^"']*main-content[^"']*["'][^>]*>([\s\S]*)<\/div>/i,
                // Try id="content"  
                /<div[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/div>\s*<(?:footer|aside)/i,
                // Try main tag
                /<main[^>]*>([\s\S]*)<\/main>/i,
                // Try class="page-content"
                /<div[^>]*class=["'][^"']*page-content[^"']*["'][^>]*>([\s\S]*)<\/div>/i,
            ];

            for (const pattern of contentPatterns) {
                const match = html.match(pattern);
                if (match && match[1] && match[1].trim().length > 500) {
                    contentHtml = match[1];
                    console.log(`[WP_SCRAPE] Found main content: ${contentHtml.length} chars`);
                    break;
                }
            }

            // If no main content found, try body but warn
            if (!contentHtml || contentHtml.length < 500) {
                console.log(`[WP_SCRAPE] No main content found, using full body`);
                const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                contentHtml = bodyMatch ? bodyMatch[1] : '';
            }

            // Clean and fix the HTML
            contentHtml = this.cleanScrapedHtml(contentHtml, baseUrl);

            // INJECT embedded styles from section-bg elements for background extraction
            // This allows the parser to see background colors applied via CSS
            contentHtml = this.injectInlineBackgroundStyles(contentHtml, inlineStyles);

            return contentHtml;

        } catch (error) {
            console.error('[WP_SCRAPE_ERROR]', error);
            throw error;
        }
    }

    // Store last scraped CSS for reference
    private lastScrapedCSS: string = '';

    // Get last scraped CSS (for external tools)
    getLastScrapedCSS(): string {
        return this.lastScrapedCSS;
    }

    // Inject inline background styles from CSS into HTML elements
    private injectInlineBackgroundStyles(html: string, css: string): string {
        if (!css) return html;

        // Parse CSS rules for section backgrounds
        const bgRules: Map<string, string> = new Map();

        // Match CSS rules like: .section-xyz { background: #color }
        const ruleRegex = /\.([a-zA-Z0-9_-]+section[a-zA-Z0-9_-]*)\s*\{[^}]*background(?:-color)?\s*:\s*([^;}\s]+)/gi;
        let match;
        while ((match = ruleRegex.exec(css)) !== null) {
            const className = match[1];
            const bgColor = match[2].trim();
            if (bgColor && !bgColor.includes('teal') && !bgColor.includes('cyan')) {
                bgRules.set(className, bgColor);
            }
        }

        // Also match ID-based rules: #section-xyz { background: #color }
        const idRuleRegex = /#([a-zA-Z0-9_-]*section[a-zA-Z0-9_-]*)\s*\{[^}]*background(?:-color)?\s*:\s*([^;}\s]+)/gi;
        while ((match = idRuleRegex.exec(css)) !== null) {
            const id = match[1];
            const bgColor = match[2].trim();
            if (bgColor && !bgColor.includes('teal') && !bgColor.includes('cyan')) {
                bgRules.set(`#${id}`, bgColor);
            }
        }

        console.log(`[WP_SCRAPE] Found ${bgRules.size} background rules in CSS`);

        // Inject found backgrounds into matching HTML elements
        Array.from(bgRules.entries()).forEach(([selector, bgColor]) => {
            if (selector.startsWith('#')) {
                // ID selector
                const id = selector.substring(1);
                const pattern = new RegExp(`(<[^>]*id=["']${id}["'][^>]*)>`, 'gi');
                html = html.replace(pattern, (match, p1) => {
                    if (match.includes('style=')) {
                        return match.replace(/style=["']/, `style="background-color: ${bgColor}; `);
                    }
                    return `${p1} style="background-color: ${bgColor};">`;
                });
            } else {
                // Class selector
                const pattern = new RegExp(`(<[^>]*class=["'][^"']*${selector}[^"']*["'][^>]*)>`, 'gi');
                html = html.replace(pattern, (match, p1) => {
                    if (match.includes('style=')) {
                        return match.replace(/style=["']/, `style="background-color: ${bgColor}; `);
                    }
                    return `${p1} style="background-color: ${bgColor};">`;
                });
            }
        });

        return html;
    }

    private cleanScrapedHtml(html: string, baseUrl: string): string {
        let cleaned = html
            // Remove scripts
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            // Remove noscript
            .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
            // Remove WordPress admin bar
            .replace(/<div[^>]*id=["']wpadminbar["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove header elements
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            // Remove footer elements
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            // Remove nav elements
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            // Remove top bar / announcement bar
            .replace(/<div[^>]*id=["']top-bar["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove masthead (header area)
            .replace(/<div[^>]*id=["']masthead["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove mobile menu/sidebar
            .replace(/<div[^>]*id=["']main-menu["'][^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class=["'][^"']*mobile-sidebar[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class=["'][^"']*off-canvas[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove cart popup
            .replace(/<div[^>]*id=["']cart-popup["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove login popups/forms
            .replace(/<div[^>]*id=["']login-form-popup["'][^>]*>[\s\S]*?<\/div>/gi, '')
            .replace(/<div[^>]*class=["'][^"']*woocommerce-form-login[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove search forms
            .replace(/<form[^>]*class=["'][^"']*searchform[^"']*["'][^>]*>[\s\S]*?<\/form>/gi, '')
            .replace(/<div[^>]*class=["'][^"']*search-form[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove hidden/mfp-hide elements (Magnific Popup hidden content)
            .replace(/<div[^>]*class=["'][^"']*mfp-hide[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
            // Remove contact forms shortcodes
            .replace(/\[contact-form-7[^\]]*\]/gi, '')
            // Remove form tags entirely
            .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
            // Remove input fields
            .replace(/<input[^>]*>/gi, '')
            .replace(/<label[^>]*>[\s\S]*?<\/label>/gi, '')
            // Remove comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Fix relative image URLs
            .replace(/src=["']\/([^"']+)["']/gi, `src="${baseUrl}/$1"`)
            .replace(/src=["'](?!https?:\/\/)(?!data:)([^"']+)["']/gi, `src="${baseUrl}/$1"`)
            // Fix relative background images in inline styles
            .replace(/url\(['"]?\/([^'")\s]+)['"]?\)/gi, `url('${baseUrl}/$1')`)
            // Fix srcset relative URLs
            .replace(/srcset=["']([^"']+)["']/gi, (match, srcset) => {
                const fixed = srcset.replace(/(^|\s)\/([^\s,]+)/g, `$1${baseUrl}/$2`);
                return `srcset="${fixed}"`;
            })
            // Fix href links to absolute
            .replace(/href=["']\/([^"']+)["']/gi, `href="${baseUrl}/$1"`)
            // Normalize whitespace (but preserve newlines for readability)
            .replace(/\s{2,}/g, ' ')
            .trim();

        return cleaned;
    }
}
