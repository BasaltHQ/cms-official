"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return null;

    try {
        const [
            mediaCount,
            documentsCount,
            blogPostsCount,
            totalUsers,
            recentDocs,
            recentPosts
        ] = await Promise.all([
            prismadb.mediaItem.count(),
            prismadb.documents.count(),
            prismadb.blogPost.count(),
            prismadb.users.count(),
            prismadb.documents.findMany({
                take: 3,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, document_name: true, updatedAt: true, document_type: true }
            }),
            prismadb.blogPost.findMany({
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
                used: 125000, // Mocked for visualization until we have real billing API connected
                limit: 500000,
                percent: 25
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
                    views: Math.floor(Math.random() * (5000 - 1000 + 1) + 1000) // Mocking views for "clever" demo feel
                })),
                ...recentDocs.map(d => ({
                    type: 'doc' as const,
                    title: d.document_name,
                    updatedAt: d.updatedAt!,
                    id: d.id,
                    status: 'Active',
                    views: Math.floor(Math.random() * (500 - 50 + 1) + 50)
                }))
            ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
        };
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        return null;
    }
}
