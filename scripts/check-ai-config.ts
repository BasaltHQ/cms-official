import { prismadb } from "@/lib/prisma";

async function main() {
    const configs = await prismadb.systemAiConfig.findMany({
        where: { isActive: true }
    });
    console.log("Active AI Configs:", JSON.stringify(configs, null, 2));
}

main();
