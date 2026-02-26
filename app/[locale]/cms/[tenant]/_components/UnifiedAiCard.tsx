import { prismadb } from "@/lib/prisma";
import { AiProvider } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { UnifiedAiConfigTabs } from "./UnifiedAiConfigTabs";

const UnifiedAiCard = async () => {
    const systemConfigs = await prismadb.systemAiConfig.findMany();
    const allModels = await prismadb.aiModel.findMany({
        where: { isActive: true }
    });
    const providers = Object.values(AiProvider);

    return (
        <Card className="bg-[#0A0A0B] border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl text-white">Unified AI Configuration</CardTitle>
                <CardDescription className="text-slate-400">Manage System-wide API keys and Default Models.</CardDescription>
            </CardHeader>
            <CardContent>
                <UnifiedAiConfigTabs
                    providers={providers}
                    allModels={allModels}
                    systemConfigs={systemConfigs}
                />
            </CardContent>
        </Card>
    );
}

export default UnifiedAiCard;
