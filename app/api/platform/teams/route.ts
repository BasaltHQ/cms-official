import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify Platform Admin Status
        const user = await prismadb.users.findUnique({
            where: { email: session.user.email },
            include: { assigned_team: true }
        });

        const isPlatformAdmin = user?.is_admin || user?.assigned_team?.slug === "basalt";

        if (!isPlatformAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const teams = await prismadb.team.findMany({
            orderBy: { created_at: "desc" },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        return NextResponse.json({ teams });
    } catch (error) {
        console.error("[PLATFORM_TEAMS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
