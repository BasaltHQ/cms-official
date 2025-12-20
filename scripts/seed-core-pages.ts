import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Core App Pages...");

    const corePages = [
        { title: "Blog Home", slug: "blog", description: "Main blog listing page" },
        { title: "Careers", slug: "careers", description: "Job listings and company culture" },
        { title: "Documentation", slug: "docs", description: "User guides and API docs" },
        { title: "Footer Components", slug: "footer", description: "Global footer content" },
        { title: "About Us", slug: "about", description: "Company history and team" },
    ];

    for (const page of corePages) {
        // Upsert to avoid duplicates
        await prisma.landingPage.upsert({
            where: { slug: page.slug },
            update: {},
            create: {
                title: page.title,
                slug: page.slug,
                description: page.description,
                content: {
                    content: [
                        { type: "HeroBlock", props: { title: page.title, subtitle: "Start building this page visually...", primaryAction: "Edit Now" } }
                    ],
                    root: { props: { title: page.title } }
                }
            }
        });
        console.log(`Synced: ${page.title}`);
    }

    console.log("Core pages synced to Landing Page Database!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
