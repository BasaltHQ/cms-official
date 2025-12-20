import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding landing pages...");

    const pages = [
        { title: "Home Page", slug: "home", description: "Main landing page" },
        { title: "Pricing", slug: "pricing", description: "Pricing plans and comparison" },
        { title: "About Us", slug: "about", description: "Company information" },
        { title: "Contact Sales", slug: "contact", description: "Contact form and info" },
        { title: "Features", slug: "features", description: "Product features overview" },
        { title: "Terms of Service", slug: "terms", description: "Legal terms" },
        { title: "Privacy Policy", slug: "privacy", description: "Privacy policy" },
    ];

    for (const page of pages) {
        const exists = await prisma.landingPage.findUnique({
            where: { slug: page.slug },
        });

        if (!exists) {
            await prisma.landingPage.create({
                data: {
                    title: page.title,
                    slug: page.slug,
                    description: page.description,
                    content: {
                        content: [],
                        root: { props: { title: page.title } }
                    }
                },
            });
            console.log(`Created: ${page.title}`);
        } else {
            console.log(`Skipped: ${page.title} (already exists)`);
        }
    }

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
