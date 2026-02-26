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

        const users = await prismadb.users.findMany({
            orderBy: { created_on: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                userStatus: true,
                is_admin: true,
                team_role: true,
                created_on: true,
                assigned_team: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("[PLATFORM_USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
