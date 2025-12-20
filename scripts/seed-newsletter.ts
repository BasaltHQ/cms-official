
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Newsletter Footer Link...");

    // Find Company section
    let section = await prisma.footerSection.findFirst({
        where: { title: "Company" }
    });

    if (!section) {
        console.log("Creating Company section...");
        section = await prisma.footerSection.create({
            data: {
                title: "Company",
                order: 1
            }
        });
    }

    // Check for link
    const existing = await prisma.footerLink.findFirst({
        where: {
            text: "Newsletter",
            sectionId: section.id
        }
    });

    if (existing) {
        console.log("Newsletter link already exists.");
        // Ensure URL is correct
        if (existing.url !== "?newsletter=true") {
            await prisma.footerLink.update({
                where: { id: existing.id },
                data: { url: "?newsletter=true" }
            });
            console.log("Updated Newsletter link URL.");
        }
    } else {
        await prisma.footerLink.create({
            data: {
                text: "Newsletter",
                url: "?newsletter=true",
                order: 999,
                sectionId: section.id
            }
        });
        console.log("Created Newsletter link.");
    }

    console.log("Done.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
