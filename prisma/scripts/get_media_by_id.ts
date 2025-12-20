import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const id = '693a0c044b17bda27f22179c';
    try {
        // Try to find the item in known models that might store media
        let mediaItem: any = null;

        if (prisma.mediaItem) {
            console.log("Checking MediaItem model...");
            mediaItem = await prisma.mediaItem.findUnique({ where: { id } });
        }

        if (!mediaItem && prisma.imageUpload) {
            console.log("Checking ImageUpload model...");
            mediaItem = await prisma.imageUpload.findUnique({ where: { id } });
        }

        if (mediaItem) {
            console.log("FOUND ITEM:", JSON.stringify(mediaItem, null, 2));

            // Check if URL is base64
            if (mediaItem.url && mediaItem.url.startsWith('data:image')) {
                const base64Data = mediaItem.url.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                const outputPath = path.join(process.cwd(), 'public', 'recovered_image.webp');
                fs.writeFileSync(outputPath, buffer);
                console.log("Saved base64 content to public/recovered_image.webp");
            } else if (mediaItem.url) {
                console.log("URL is not base64:", mediaItem.url);
            }
        } else {
            console.log("Item not found with ID:", id);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
