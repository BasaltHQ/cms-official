"use server";

import { prismadb } from "@/lib/prisma";
import { AiProvider } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function saveSystemAiConfig(formData: FormData) {
    const provider = formData.get("provider") as AiProvider;
    const apiKey = formData.get("apiKey") as string;
    const baseUrl = formData.get("baseUrl") as string;
    const isActive = formData.get("isActive") === "on";
    const defaultModelId = formData.get("defaultModelId") as string;

    // Azure/Google Specifics
    const resourceName = formData.get("resourceName") as string;
    const deploymentId = formData.get("deploymentId") as string;
    const apiVersion = formData.get("apiVersion") as string;
    const projectId = formData.get("projectId") as string;

    let configuration = {};

    if (provider === "AZURE") {
        configuration = { resourceName, deploymentId, apiVersion };
    } else if (provider === "GOOGLE") {
        configuration = { projectId };
    }

    if (!apiKey) return;

    await prismadb.systemAiConfig.upsert({
        where: { provider },
        create: {
            provider,
            apiKey,
            baseUrl,
            configuration: configuration,
            defaultModelId: defaultModelId || null,
            isActive
        },
        update: {
            apiKey,
            baseUrl,
            configuration: configuration,
            defaultModelId: defaultModelId || null,
            isActive
        }
    });

    revalidatePath("/cms/oauth");
}
