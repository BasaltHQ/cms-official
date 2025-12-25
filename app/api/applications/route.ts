import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
    try {
        const applications = await prismadb.jobApplication.findMany({
            orderBy: { createdAt: "desc" },
            include: { job: true }
        });
        return NextResponse.json(applications);
    } catch (error) {
        return handleApiError(error, "APPLICATIONS_GET");
    }
}
