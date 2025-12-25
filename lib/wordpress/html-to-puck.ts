/**
 * HTML to Puck Converter
 * Parses HTML content and converts it to individual Puck blocks
 * Preserves HTML structure while creating editable blocks
 */

interface PuckBlock {
    type: string;
    props: Record<string, any>;
}

/**
 * Generate unique ID for blocks
 */
function generateId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fix relative URLs in HTML
 */
function fixUrls(html: string, baseUrl: string): string {
    if (!baseUrl) return html;

    return html
        // Fix relative image URLs
        .replace(/src=["']\/([^"']+)["']/gi, `src="${baseUrl}/$1"`)
        .replace(/src=["'](?!https?:\/\/)(?!data:)([^"']+)["']/gi, `src="${baseUrl}/$1"`)
        // Fix relative background images
        .replace(/url\(['"]?\/([^'")\s]+)['"]?\)/gi, `url('${baseUrl}/$1')`)
        // Fix href links
        .replace(/href=["']\/([^"']+)["']/gi, `href="${baseUrl}/$1"`);
}

/**
 * Unwrap outer containers if they wrap the entire content
 * (e.g. <main>, <div id="wrapper">, etc.)
 */
function unwrapContainers(html: string): string {
    let current = html.trim();
    let changed = true;

    // Patterns for generic page containers
    const containerPatterns = [
        /^<main[^>]*>([\s\S]*)<\/main>$/i,
        /^<div[^>]*(?:id|class)=["'][^"']*(?:wrapper|main-content|page-content|site-content|content-area|post-content)[^"']*["'][^>]*>([\s\S]*)<\/div>$/i,
        /^<article[^>]*>([\s\S]*)<\/article>$/i,
        /^<div[^>]*class=["']container[^"']*["'][^>]*>([\s\S]*)<\/div>$/i
    ];

    while (changed) {
        changed = false;
        for (const pattern of containerPatterns) {
            const match = current.match(pattern);
            if (match) {
                // Only unwrap if it's the ONLY top-level element
                // (Simple check: does it have a matching closer at the very end)
                current = match[1].trim();
                changed = true;
                break;
            }
        }
    }

    return current;
}

/**
 * Clean trailing trash like empty divs, scripts, styles that might cause blank space
 */
function cleanContent(html: string): string {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        // Remove trailing empty tags
        .replace(/(?:<p[^>]*>\s*<\/p>|<div[^>]*>\s*<\/div>|<br\s*\/?>)+$/gi, '')
        .trim();
}

/**
 * Extract top-level elements from HTML without breaking nested structures
 */
function splitTopLevelElements(html: string): string[] {
    const elements: string[] = [];
    let currentPos = 0;

    // Pre-split: if we find major row separators (like <div class="row">), 
    // we might want to split by those specifically if they are top-level.

    while (currentPos < html.length) {
        // Find next tag
        const startTagMatch = html.slice(currentPos).match(/<([a-z1-6]+)[^>]*>/i);

        if (!startTagMatch) {
            // remaining is text content
            const textContent = html.slice(currentPos).trim();
            if (textContent) elements.push(textContent);
            break;
        }

        const tagStartIndexInSlice = startTagMatch.index!;
        const tagStartIndex = currentPos + tagStartIndexInSlice;

        // Capture text BEFORE the tag if it's substantial
        if (tagStartIndexInSlice > 0) {
            const textBefore = html.slice(currentPos, tagStartIndex).trim();
            if (textBefore) {
                elements.push(textBefore);
            }
        }

        const tagName = startTagMatch[1].toLowerCase();
        const tagOpenString = startTagMatch[0];

        // Self-closing tags
        const selfClosingTags = ["img", "br", "hr", "input", "meta", "link"];
        if (selfClosingTags.includes(tagName) || tagOpenString.endsWith("/>")) {
            elements.push(html.slice(tagStartIndex, tagStartIndex + tagOpenString.length));
            currentPos = tagStartIndex + tagOpenString.length;
            continue;
        }

        // Find the matching closing tag by tracking depth
        let depth = 1;
        let searchPos = tagStartIndex + tagOpenString.length;
        const tagPatterns = new RegExp(`<(/?${tagName})(?:\\s|/|>)`, "gi");
        tagPatterns.lastIndex = searchPos;

        let foundMatch = false;
        let match;
        while ((match = tagPatterns.exec(html)) !== null) {
            if (match[1].toLowerCase() === tagName) {
                depth++;
            } else if (match[1].toLowerCase() === `/${tagName}`) {
                depth--;
            }

            if (depth === 0) {
                const tagEndIndex = match.index + match[0].length;
                elements.push(html.slice(tagStartIndex, tagEndIndex).trim());
                currentPos = tagEndIndex;
                foundMatch = true;
                break;
            }
        }

        if (!foundMatch) {
            // Fallback: take the rest if not closed properly
            elements.push(html.slice(tagStartIndex).trim());
            break;
        }
    }

    return elements.filter(el => el && el.trim().length > 0);
}

/**
 * Clean HTML for heading titles
 */
function cleanHeadingTitle(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Main converter function
 */
export function htmlToPuckBlocks(html: string, baseUrl: string = ''): PuckBlock[] {
    const blocks: PuckBlock[] = [];

    if (!html || html.trim().length === 0) {
        return blocks;
    }

    console.log(`[HTML_TO_PUCK] Starting conversion of ${html.length} chars`);

    // 1. Initial cleaning and URL fixing
    let cleanedHtml = cleanContent(html);
    const fixedHtml = fixUrls(cleanedHtml, baseUrl);

    // 2. Unwrap outer page containers to reach the meat (rows, sections, banners)
    const unwrappedHtml = unwrapContainers(fixedHtml);

    // 3. Split into blocks
    const elements = splitTopLevelElements(unwrappedHtml);

    console.log(`[HTML_TO_PUCK] Found ${elements.length} top-level elements after unwrapping`);

    for (const element of elements) {
        const trimmed = element.trim();

        // Skip tiny things that are likely remnants
        if (trimmed.length < 5 && !trimmed.includes('<img')) continue;

        // Check for Heading
        const headingMatch = trimmed.match(/^<(h[1-6])[^>]*>([\s\S]*?)<\/\1>$/i);
        if (headingMatch) {
            const tag = headingMatch[1].toLowerCase();
            const sizeMap: Record<string, string> = {
                'h1': '4xl', 'h2': '3xl', 'h3': '2xl', 'h4': 'xl', 'h5': 'lg', 'h6': 'md'
            };
            blocks.push({
                type: 'HeadingBlock',
                props: {
                    id: generateId(),
                    title: cleanHeadingTitle(headingMatch[2]),
                    size: sizeMap[tag] || 'xl',
                    align: 'left'
                }
            });
            continue;
        }

        // Check for Image
        const imageMatch = trimmed.match(/^<img[^>]*src=["']([^"']+)["'][^>]*>$/i);
        if (imageMatch) {
            const altMatch = trimmed.match(/alt=["']([^"']*)["']/i);
            blocks.push({
                type: 'ImageBlock',
                props: {
                    id: generateId(),
                    src: imageMatch[1],
                    alt: altMatch ? altMatch[1] : 'Imported image',
                    aspectRatio: 'auto',
                    rounded: 'md'
                }
            });
            continue;
        }

        // Everything else is a RichTextBlock
        blocks.push({
            type: 'RichTextBlock',
            props: {
                id: generateId(),
                content: trimmed
            }
        });
    }

    // Final cleanup: if we have a lot of tiny blocks, maybe we split too much?
    // But usually more granular is better for clickability.

    console.log(`[HTML_TO_PUCK] Created ${blocks.length} editable blocks`);
    return blocks;
}
