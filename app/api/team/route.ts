import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { logActivity } from "@/actions/audit";

export async function GET() {
    try {

        let groups = await prismadb.marketingTeamGroup.findMany({
            include: {
                members: {
                    orderBy: { order: "asc" },
                },
            },
            orderBy: { order: "asc" },
        });

        if (groups.length === 0) {
            // Seed Default Data
            const defaultGroups = [
                {
                    title: "Leadership",
                    order: 0,
                    members: [
                        { name: "Krishna Patel", role: "Chairman & CTO", imageSrc: "/images/team/member1.jpg", linkedin: "https://www.linkedin.com/in/krishna-patel-89039120/", twitter: "https://x.com/GenRevoeth" },
                        { name: "Eric Turner", role: "Chief Executive Officer (CEO)", imageSrc: "/images/team/member6.jpg", linkedin: "https://www.linkedin.com/in/ericturner85/", twitter: "https://x.com/sinisterxtwitr" },
                        { name: "Michael Milton", role: "Chief Marketing Officer (CMO)", imageSrc: "/images/team/member3.jpg", linkedin: "https://www.linkedin.com/in/mayordelmar/", twitter: "https://x.com/mayordelmar" },
                    ]
                },
                {
                    title: "Engineering & Research",
                    order: 1,
                    members: [
                        { name: "John Garcia", role: "SVP, AI Research", imageSrc: "/images/team/member5.jpg", linkedin: "https://www.linkedin.com/in/john-garcia-54ab73398/", twitter: "https://x.com/JohnG1isit" },
                        { name: "Shahir Monjour", role: "SVP, Engineering", imageSrc: "/images/team/member4.jpg", linkedin: "https://www.linkedin.com/in/shahir-monjur/", twitter: "https://x.com/shahir1395" },
                    ]
                }
            ];

            for (const grp of defaultGroups) {
                const newGroup = await prismadb.marketingTeamGroup.create({
                    data: { title: grp.title, order: grp.order }
                });

                if (grp.members.length > 0) {
                    await prismadb.marketingTeamMember.createMany({
                        data: grp.members.map((m, idx) => ({
                            ...m,
                            order: idx,
                            groupId: newGroup.id
                        }))
                    });
                }
            }

            // Re-fetch
            groups = await prismadb.marketingTeamGroup.findMany({
                include: {
                    members: { orderBy: { order: "asc" } },
                },
                orderBy: { order: "asc" },
            });
        }


        return NextResponse.json({ groups });
    } catch (error) {
        console.error("[TEAM_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    // TODO: stricter checks matching your permission system
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { groups } = body;

        if (groups && Array.isArray(groups)) {
            // Get existing group IDs
            const existingGroups = await prismadb.marketingTeamGroup.findMany();
            const existingIds = existingGroups.map(g => g.id);
            const newIds = groups.filter((g: any) => g.id).map((g: any) => g.id);

            // Delete groups that were removed
            for (const existing of existingGroups) {
                if (!newIds.includes(existing.id)) {
                    await prismadb.marketingTeamMember.deleteMany({ where: { groupId: existing.id } });
                    await prismadb.marketingTeamGroup.delete({ where: { id: existing.id } });
                }
            }

            // Process each group
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];

                if (group.id && existingIds.includes(group.id)) {
                    // Update existing group
                    await prismadb.marketingTeamGroup.update({
                        where: { id: group.id },
                        data: { title: group.title, order: i },
                    });
                } else {
                    // Create new group
                    const created = await prismadb.marketingTeamGroup.create({
                        data: { title: group.title, order: i },
                    });
                    group.id = created.id;
                }

                // Handle members
                if (group.members && Array.isArray(group.members)) {
                    // Start by wiping members to do a clean replace (easiest for robust ordering)
                    // Efficient for small lists like team members.
                    await prismadb.marketingTeamMember.deleteMany({ where: { groupId: group.id } });

                    if (group.members.length > 0) {
                        await prismadb.marketingTeamMember.createMany({
                            data: group.members.map((member: any, index: number) => ({
                                name: member.name,
                                role: member.role,
                                imageSrc: member.imageSrc,
                                linkedin: member.linkedin,
                                twitter: member.twitter,
                                order: index,
                                groupId: group.id,
                            })),
                        });
                    }
                }
            }
        }

        // Log Activity
        await logActivity(
            "Updated Team",
            "Team Management",
            "Modified team groups and members"
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TEAM_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
