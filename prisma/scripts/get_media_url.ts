import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const item = await prisma.mediaItem.findFirst({
            where: {
                filename: 'Ledger1CMS Cyan - Wide.webp'
            }
        });
        if (item) {
            console.log("FOUND_URL:", item.url);
        } else {
            console.log("NOT_FOUND");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
