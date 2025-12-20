import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Accessing methods directly as they should be available in the generated client
        const items = await prisma.imageUpload.findMany();
        console.log("ImageUpload items:", items);

        const mediaItems = await prisma.mediaItem.findMany({
            where: {
                filename: {
                    contains: 'Cyan',
                    mode: 'insensitive'
                }
            }
        });
        console.log("MediaItems found:", mediaItems);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
