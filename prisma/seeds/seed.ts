import { PrismaClient } from "@prisma/client";

//Menu Items
import moduleData from "../initial-data/system_Modules_Enabled.json";
//GPT Models
import gptModelsData from "../initial-data/gpt_Models.json";

import docsData from "./data/docs.json";
import universityData from "./data/university.json";
import { seedLocations } from "./locations";
/*
Seed data is used to populate the database with initial data.
*/

const prisma = new PrismaClient();

async function retry<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'P2034' || error.message?.includes('WriteConflict') || error.code === 'P2002')) {
      console.log(`Retrying transaction... (${retries} attempts left) - ${error.message}`);
      await new Promise((res) => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function main() {
  // Your seeding logic here using Prisma Client
  console.log("-------- Seeding DB --------");

  //Seed Menu Items
  const modules = await prisma.system_Modules_Enabled.findMany();

  if (modules.length === 0) {
    await Promise.all(
      moduleData.map((item) =>
        prisma.system_Modules_Enabled.create({
          data: item,
        })
      )
    );
    console.log("Modules seeded successfully");
  } else {
    console.log("Modules already seeded");
  }



  //Seed AI Models (migrated from gpt_models + new defaults)
  const defaultModels = [
    // OpenAI
    { name: "GPT-5 (Preview)", modelId: "gpt-5-preview", provider: "OPENAI", isActive: true },
    { name: "GPT-5", modelId: "gpt-5", provider: "OPENAI", isActive: true },
    { name: "GPT-4o", modelId: "gpt-4o", provider: "OPENAI", isActive: true },
    { name: "GPT-4 Turbo", modelId: "gpt-4-turbo", provider: "OPENAI", isActive: true },
    { name: "o1 Preview", modelId: "o1-preview", provider: "OPENAI", isActive: true },

    // Azure (Legacy + New)
    { name: "Azure GPT-5 (Preview)", modelId: "gpt-5-preview", provider: "AZURE", isActive: true },
    { name: "Azure GPT-5", modelId: "gpt-5", provider: "AZURE", isActive: true },
    { name: "Azure GPT-4o", modelId: "gpt-4o", provider: "AZURE", isActive: true },
    { name: "Azure GPT-4 Turbo", modelId: "gpt-4-turbo", provider: "AZURE", isActive: true },
    { name: "Azure GPT-3.5 Turbo", modelId: "gpt-35-turbo", provider: "AZURE", isActive: true },

    // Anthropic
    { name: "Claude 4.5 Sonnet", modelId: "claude-4-5-sonnet-latest", provider: "ANTHROPIC", isActive: true },
    { name: "Claude 4.5 Opus", modelId: "claude-4-5-opus-latest", provider: "ANTHROPIC", isActive: true },
    { name: "Claude 4.5 Haiku", modelId: "claude-4-5-haiku-latest", provider: "ANTHROPIC", isActive: true },

    // Google
    { name: "Gemini 3.0 Pro", modelId: "gemini-3.0-pro", provider: "GOOGLE", isActive: true },
    { name: "Gemini 3.0 Flash", modelId: "gemini-3.0-flash", provider: "GOOGLE", isActive: true },

    // Mistral
    { name: "Mistral Large 2", modelId: "mistral-large-latest", provider: "MISTRAL", isActive: true },

    // Perplexity
    { name: "Llama 3.1 Sonar Ex Large", modelId: "llama-3.1-sonar-e-large-128k-online", provider: "PERPLEXITY", isActive: true },

    // Grok
    { name: "Grok 2", modelId: "grok-2", provider: "GROK", isActive: true },

    // Deepseek
    { name: "DeepSeek Chat", modelId: "deepseek-chat", provider: "DEEPSEEK", isActive: true },
  ];

  // Proper Sync Logic
  /*
  for (const m of defaultModels) {
    await retry(() => prisma.aiModel.upsert({
      where: {
        modelId_provider: {
          modelId: m.modelId,
          provider: m.provider as any
        }
      },
      update: {
        name: m.name,
        isActive: m.isActive ?? true
      },
      create: {
        name: m.name,
        modelId: m.modelId,
        provider: m.provider as any,
        isActive: m.isActive ?? true,
        inputPrice: 0,
        outputPrice: 0
      }
    }));
    console.log(`Upserted ${m.provider} - ${m.name}`);
  }
  console.log("AI Models sync complete");
  */

  // Seed Footer Data
  const footerSetting = await prisma.footerSetting.findFirst();
  if (!footerSetting) {
    await prisma.footerSetting.create({
      data: {
        tagline: "Your 24/7 AI workforce. Sales, Support, and Growth on autopilot.",
        copyrightText: "© 2025 Ledger AI. All rights reserved.",
      },
    });
    console.log("Footer Settings seeded successfully");
  } else {
    console.log("Footer Settings already seeded");
  }

  const footerSections = await prisma.footerSection.findMany();
  if (footerSections.length === 0) {
    // Product Section
    const productSection = await prisma.footerSection.create({
      data: {
        title: "Product",
        order: 1,
        links: {
          create: [
            { text: "Features", url: "/features", order: 1 },
            { text: "Pricing", url: "/pricing", order: 2 },
          ],
        },
      },
    });

    // Company Section
    const companySection = await prisma.footerSection.create({
      data: {
        title: "Company",
        order: 2,
        links: {
          create: [
            { text: "About Us", url: "/about", order: 1 },
            { text: "Blog", url: "/blog", order: 2 },
            { text: "Careers", url: "/careers", order: 3 },
            { text: "Contact", url: "/support", order: 4 },
          ],
        },
      },
    });

    // Legal Section
    const legalSection = await prisma.footerSection.create({
      data: {
        title: "Legal",
        order: 3,
        links: {
          create: [
            { text: "Privacy Policy", url: "/privacy", order: 1 },
            { text: "Terms of Service", url: "/terms", order: 2 },
            { text: "Cookie Policy", url: "/cookies", order: 3 },
          ],
        },
      },
    });

    console.log("Footer Sections and Links seeded successfully");
  } else {
    console.log("Footer Sections and Links already seeded");
  }

  // Seed Docs & University Content
  const allDocs = [...docsData, ...universityData];
  for (const doc of allDocs) {
    await retry(() => prisma.docArticle.upsert({
      where: { slug: doc.slug },
      update: {
        title: doc.title,
        category: doc.category,
        type: doc.type,
        content: doc.content,
        order: doc.order
      },
      create: {
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        type: doc.type,
        content: doc.content,
        order: doc.order
      }
    }));
    console.log(`Upserted DocArticle: ${doc.title} (${doc.type})`);
  }
  console.log("Docs & University content seeded successfully");

  // Seed Locations
  // await seedLocations();

  console.log("-------- Seed DB completed --------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
