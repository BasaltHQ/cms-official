
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Restoring specific team member images...");

    // Mapping from Name (or partial name identifier) to correct image
    const restorations = [
        { name: "Krishna", image: "/images/team/member1.png" },
        { name: "Eric", image: "/images/team/member6.png" },
        { name: "Michael", image: "/images/team/member3.png" },
        { name: "John", image: "/images/team/member5.png" },
        { name: "Shahir", image: "/images/team/member4.png" },
    ];

    for (const item of restorations) {
        // Find member by name contains
        const result = await prisma.marketingTeamMember.updateMany({
            where: {
                name: {
                    contains: item.name,
                    mode: 'insensitive'
                }
            },
            data: {
                imageSrc: item.image
            }
        });
        console.log(`Updated ${result.count} for ${item.name} -> ${item.image}`);
    }

    console.log("Restoration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
