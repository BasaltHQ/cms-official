
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Fixing team member images path...");

    // Select any member who has the incorrect path OR the old missing paths (just in case)
    const incorrectPaths = [
        "/images/team/nouser.png",
        "/images/team/member1.png",
        "/images/team/member2.png",
        "/images/team/member3.png",
        "/images/team/member4.png",
        "/images/team/member5.png",
        "/images/team/member6.png",
    ];

    const updateResult = await prisma.marketingTeamMember.updateMany({
        where: {
            imageSrc: {
                in: incorrectPaths,
            },
        },
        data: {
            imageSrc: "/images/nouser.png",
        },
    });

    console.log(`Updated ${updateResult.count} team members to use correct placeholder path: /images/nouser.png`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
