"use server";

import { prismadb } from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";

export async function getDashboardStats() {
    const context = await getTenantContext(false);
    if (!context) return null;

    const { teamId } = context;

    try {
        const [
            mediaCount,
            documentsCount,
            blogPostsCount,
            totalUsers,
            recentDocs,
            recentPosts
        ] = await Promise.all([
            prismadb.mediaItem.count({ where: { team_id: teamId } }),
            prismadb.documents.count({ where: { team_id: teamId } }),
            prismadb.blogPost.count({ where: { team_id: teamId } }),
            prismadb.users.count({ where: { team_id: teamId } }),
            prismadb.documents.findMany({
                where: { team_id: teamId },
                take: 3,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, document_name: true, updatedAt: true, document_type: true }
            }),
            prismadb.blogPost.findMany({
                where: { team_id: teamId },
                take: 3,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true, updatedAt: true }
            })
        ]);

        // Calculate storage usage (mock calculation based on count for now, assuming avg 2MB per media)
        const storageUsedMB = Math.round(mediaCount * 2.5);
        const storageLimitMB = 10000; // 10GB limit example

        // AI Token usage - simplified mock or real aggregation if table allows
        // For now, we'll return a calculated metric based on message counts if available, or static for demo
        // const messageCount = await prismadb.chat_Messages.count();

        // Seat usage
        const seatLimit = 50; // Example limit

        return {
            storage: {
                used: storageUsedMB,
                limit: storageLimitMB,
                percent: Math.min(Math.round((storageUsedMB / storageLimitMB) * 100), 100)
            },
            ai: {
                used: 0, // Resetting from hardcoded 'slop' to actual starting state
                limit: 500000,
                percent: 0
            },
            seats: {
                used: totalUsers,
                limit: seatLimit,
                percent: Math.min(Math.round((totalUsers / seatLimit) * 100), 100)
            },
            content: {
                published: blogPostsCount,
                drafts: 0 // If we had status in count
            },
            recentActivity: [
                ...recentPosts.map(p => ({
                    type: 'post' as const,
                    title: p.title,
                    updatedAt: p.updatedAt,
                    id: p.id,
                    status: 'Active',
                    views: 0
                })),
                ...recentDocs.map(d => ({
                    type: 'doc' as const,
                    title: d.document_name,
                    updatedAt: d.updatedAt!,
                    id: d.id,
                    status: 'Active',
                    views: 0
                }))
            ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        return null;
    }
}
