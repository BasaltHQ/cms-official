import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Pricing Page Content...");

    const content = [
        {
            type: "HeroBlock",
            props: {
                title: "Simple, Transparent Pricing",
                subtitle: "Choose the plan that's right for your business. No hidden fees.",
                bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80",
                primaryAction: "Get Started",
                secondaryAction: "Contact Sales"
            }
        },
        {
            type: "DividerBlock",
            props: { padding: "md" }
        },
        {
            type: "HeadingBlock",
            props: { title: "Our Plans", align: "center", size: "xl" }
        },
        {
            type: "ColumnsBlock",
            props: {
                leftContent: "This text will be replaced by Pricing Cards in a real columns layout, or we can stack them.",
                rightContent: "For now, we will add individual Pricing Cards below to demonstrate."
            }
        },
        {
            type: "PricingBlock",
            props: {
                plan: "Starter",
                price: "$29/mo",
                features: "1 Admin User, Basic Analytics, Email Support",
                recommended: "false"
            }
        },
        {
            type: "PricingBlock",
            props: {
                plan: "Pro",
                price: "$99/mo",
                features: "Unlimited Users, Advanced Analytics, 24/7 Priority Support, Custom Domain",
                recommended: "true"
            }
        },
        {
            type: "DividerBlock",
            props: { padding: "lg" }
        },
        {
            type: "FaqBlock",
            props: {
                items: [
                    { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time from the dashboard." },
                    { question: "Do you offer enterprise plans?", answer: "Yes, contact our sales team for custom enterprise quotes." }
                ]
            }
        }
    ];

    await prisma.landingPage.update({
        where: { slug: "pricing" },
        data: {
            content: {
                content: content,
                root: { props: { title: "Pricing" } }
            }
        }
    });

    console.log("Pricing Page populated!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
