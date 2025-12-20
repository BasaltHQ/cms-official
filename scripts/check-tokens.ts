
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking tokens...");
    const tokens = await prisma.gmail_Tokens.findMany({
        include: {
            assigned_user: true
        }
    });

    console.log(`Found ${tokens.length} tokens.`);
    tokens.forEach(t => {
        console.log(`- Provider: ${t.provider}, User: ${t.assigned_user?.email} (${t.user})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
