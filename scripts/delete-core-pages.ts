
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Removing Seeded Core Pages...");

    const slugsToRemove = ["blog", "careers", "docs", "footer", "about"];

    const result = await prisma.landingPage.deleteMany({
        where: {
            slug: {
                in: slugsToRemove
            }
        }
    });

    console.log(`Deleted ${result.count} pages.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
