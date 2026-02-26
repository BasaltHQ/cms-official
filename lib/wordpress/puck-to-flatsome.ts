import { Data } from "@measured/puck";

/**
 * Converts Puck Data into Flatsome UX Builder Shortcodes
 * Supports recursive Zones and strict [section][row][col] hierarchy.
 */

export function puckToFlatsome(data: Data): string {
    if (!data.content || data.content.length === 0) return "";

    // We start processing the top-level content
    // We pass the whole 'data' object so we can lookup zones by ID
    return processBlocks(data.content, data);
}

// Alias for compatibility if imported elsewhere
export const puckToFlatsomeShortcode = puckToFlatsome;

function processBlocks(blocks: any[], data: Data): string {
    return blocks.map(block => convertBlock(block, data)).filter(Boolean).join("\n");
}

function convertBlock(block: any, data: Data): string {
    const type = block.type;
    const props = block.props || {};
    const id = props.id || block.id;

    switch (type) {
        case "Section":
            return convertSection(props, id, data);

        case "HeadingBlock":
        case "Heading":
            const headingTag = props.size === "xl" ? "h1" : (props.size === "lg" ? "h2" : "h3");
            const headingColor = props.textColor ? `color: var(--${props.textColor});` : (props.customTextColor ? `color: ${props.customTextColor};` : "");
            const headingStyle = headingColor ? ` style="${headingColor}"` : "";
            return `[ux_text text_align="${props.align || 'left'}"]\n<${headingTag}${headingStyle}>${props.title || ''}</${headingTag}>\n[/ux_text]`;

        case "RichTextBlock":
        case "Text":
            return convertText(props);

        case "ImageBlock":
        case "Image":
            return convertImage(props);

        case "Button":
        case "ButtonBlock":
            return convertButton(props);

        case "TextBlock":
        case "TextParagraph":
            return convertTextBlock(props);

        case "ContainerBlock":
        case "Container":
            return convertContainer(props, id, data);

        case "SpacerBlock":
        case "Spacer":
            return convertSpacer(props);

        case "DividerBlock":
        case "Divider":
            return convertDivider(props);

        case "Columns":
        case "ColumnsBlock":
            return convertColumns(props);

        case "CardBlock":
        case "Card":
            return convertCard(props, id, data);

        case "TestimonialBlock":
        case "Testimonial":
            return convertTestimonial(props);

        case "HeroBlock":
        case "Hero":
            return convertHero(props);

        case "FeaturesGridBlock":
        case "Features":
            return convertFeaturesGrid(props);

        case "PricingBlock":
        case "Pricing":
            return convertPricingCards(props);

        case "StatsBlock":
        case "Stats":
            return convertStatsRow(props);

        case "FaqBlock":
        case "FAQ":
            return convertFAQ(props);

        case "VideoBlock":
            return `[ux_video url="${props.url || ''}"]`;

        case "IconBlock":
            return `[icon name="${props.icon || 'star'}" size="${props.size || 'md'}" color="${props.color || ''}"]`;

        case "CodeBlock":
            return props.code || "";

        default:
            // Fallback: If block has content prop, try to render as text
            if (props.content && typeof props.content === 'string') {
                return `[ux_text]\n${props.content}\n[/ux_text]`;
            }
            console.warn(`[PUCK_TO_FLATSOME] Unknown block type: ${type}`);
            return "";
    }
}

function convertSection(props: any, id: string, data: Data): string {
    let attributes = `padding="${props.padding || '60px'}"`;
    if (props.backgroundColor) {
        attributes += ` bg_color="${props.backgroundColor}"`;
    }

    // Look for children in the "content" zone
    const zoneKey = `${id}:content`;
    const children = data.zones ? data.zones[zoneKey] : undefined;

    let innerContent = "";
    if (children && children.length > 0) {
        innerContent = processBlocks(children, data);
    }

    // Flatsome section with inner row/col for alignment
    return `[section ${attributes}]\n[row style="collapse" width="full-width"]\n[col span="12"]\n${innerContent}\n[/col]\n[/row]\n[/section]`;
}

function convertText(props: any): string {
    const content = props.content || props.text || "";
    if (!content) return "";
    return `[ux_text]\n${content}\n[/ux_text]`;
}

function convertImage(props: any): string {
    const src = props.src || props.imageUrl;
    if (src) {
        return `[ux_image url="${src}"]`;
    }
    return "";
}

function convertButton(props: any): string {
    const label = props.label || props.text || "Click Me";
    const link = props.href || props.url || "#";
    const styleAttr = props.variant === "outline" ? 'style="outline"' : '';
    const colorAttr = props.color ? `color="${props.color}"` : 'color="primary"';

    return `[button text="${label}" link="${link}" ${styleAttr} ${colorAttr}]`;
}

function convertTextBlock(props: any): string {
    const content = props.content || props.text || "";
    if (!content) return "";

    const align = props.align || "left";
    const color = props.textColor ? `color: var(--${props.textColor});` : (props.customTextColor ? `color: ${props.customTextColor};` : "");
    const style = color ? ` style="${color}"` : "";

    return `[ux_text text_align="${align}"]\n<p${style}>${content}</p>\n[/ux_text]`;
}

function convertContainer(props: any, id: string, data: Data): string {
    const zoneKey = `${id}:content`;
    const children = data.zones ? data.zones[zoneKey] : undefined;

    let innerContent = "";
    if (children && children.length > 0) {
        innerContent = processBlocks(children, data);
    }

    const bg = props.backgroundColor ? ` bg_color="${props.backgroundColor}"` : "";
    const padding = props.paddingY ? ` padding="${props.paddingY}px 0 ${props.paddingY}px 0"` : "";

    return `[row${bg}${padding}]\n[col span="12"]\n${innerContent}\n[/col]\n[/row]`;
}

function convertSpacer(props: any): string {
    const h = props.height || "30";
    // Puck spacer often uses numeric keys or strings
    const heightMap: Record<string, string> = {
        "2": "8", "4": "16", "8": "32", "12": "48", "16": "64", "24": "96", "32": "128"
    };
    const finalHeight = heightMap[h] || h;
    return `[gap height="${finalHeight}px"]`;
}

function convertDivider(props: any): string {
    return `[divider]`;
}

function convertColumns(props: any): string {
    return `[row]
[col span="6"]
[ux_text]${props.leftContent || ""}[/ux_text]
[/col]
[col span="6"]
[ux_text]${props.rightContent || ""}[/ux_text]
[/col]
[/row]`;
}

function convertCard(props: any, id: string, data: Data): string {
    const zoneKey = `${id}:content`;
    const children = data.zones ? data.zones[zoneKey] : undefined;

    let innerContent = "";
    if (children && children.length > 0) {
        innerContent = processBlocks(children, data);
    } else if (props.content) {
        innerContent = `[ux_text]<p>${props.content}</p>[/ux_text]`;
    }

    const title = props.title ? `[ux_text]<h3>${props.title}</h3>[/ux_text]` : "";
    const bg = props.backgroundColor ? ` bg_color="${props.backgroundColor}"` : "";

    return `[row${bg} depth="2" depth_hover="4"]
[col span="12"]
${title}
${innerContent}
[/col]
[/row]`;
}

function convertTestimonial(props: any): string {
    const quote = props.quote || "";
    const author = props.author || "";
    const role = props.role || "";
    const image = props.avatar || "";

    const imageAttr = image ? ` image="${image}"` : "";

    return `[testimonial${imageAttr} name="${author}" company="${role}"]\n${quote}\n[/testimonial]`;
}

function convertHero(props: any): string {
    const bg = props.bgImage ? ` bg="${props.bgImage}"` : "";
    const title = props.title || "";
    const subtitle = props.subtitle || "";
    const overlay = (parseInt(props.overlayOpacity || "60") / 100).toFixed(1);

    return `[section${bg} bg_overlay="rgba(0,0,0,${overlay})" height="500px" dark="true"]
[row style="collapse" width="full-width" v_align="middle"]
[col span="12" align="center"]
[ux_text text_align="center"]
<h1>${title}</h1>
<p>${subtitle}</p>
[/ux_text]
[button text="${props.primaryAction || 'Get Started'}" link="${props.primaryActionUrl || '#'}" color="primary"]
[button text="${props.secondaryAction || 'Learn More'}" link="${props.secondaryActionUrl || '#'}" style="outline" color="white"]
[/col]
[/row]
[/section]`;
}

function convertFeaturesGrid(props: any): string {
    const features = props.features || [];
    const columns = parseInt(props.columns || "3");
    const span = Math.floor(12 / columns);

    let gridContent = "";
    for (const f of features) {
        gridContent += `[col span="${span}"]\n[ux_text text_align="center"]\n<h3>${f.title || ''}</h3>\n<p>${f.description || ''}</p>\n[/ux_text]\n[/col]\n`;
    }

    return `[row]\n${gridContent}\n[/row]`;
}

function convertPricingCards(props: any): string {
    const cards = props.cards || [];
    const columns = parseInt(props.columns || "3");
    const span = Math.floor(12 / columns);

    let cardsContent = "";
    for (const card of cards) {
        cardsContent += `[col span="${span}"]
[ux_text text_align="center"]
<h3 style="text-transform: uppercase;">${card.plan || ''}</h3>
<h2 style="font-size: 2.5em;">${card.price || ''}</h2>
<p>${card.description || ''}</p>
[/ux_text]
[button text="${card.buttonText || 'Choose Plan'}" link="#" style="outline" color="primary" expand="true"]
[/col]\n`;
    }

    return `[row]\n${cardsContent}\n[/row]`;
}

function convertStatsRow(props: any): string {
    const stats = props.stats || [];
    const span = Math.floor(12 / (stats.length || 1));

    let statsContent = "";
    for (const stat of stats) {
        statsContent += `[col span="${span}"]\n[ux_text text_align="center"]\n<h2>${stat.value || "0"}</h2>\n<p>${stat.label || ""}</p>\n[/ux_text]\n[/col]\n`;
    }

    return `[row]\n${statsContent}\n[/row]`;
}

function convertFAQ(props: any): string {
    const items = props.items || [];
    let faqContent = "";
    for (const item of items) {
        faqContent += `[accordion title="${item.question || ''}"]\n${item.answer || ''}\n[/accordion]\n`;
    }

    return `[accordion-group]\n${faqContent}\n[/accordion-group]`;
}

