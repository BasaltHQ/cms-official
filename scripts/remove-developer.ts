import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Removing 'Developer' user (admin@ledger1.com)...");

    try {
        const user = await prisma.users.findUnique({
            where: { email: "admin@ledger1.com" },
        });

        if (user) {
            await prisma.users.delete({
                where: { id: user.id },
            });
            console.log("Successfully deleted user: admin@ledger1.com");
        } else {
            console.log("User 'admin@ledger1.com' not found.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
