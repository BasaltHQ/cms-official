"use server";

import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Create a new scheduled post
export async function createScheduledPost(data: {
    content: string;
    platforms: string[];
    attachments: string[];
    scheduledFor: Date;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prismadb.users.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const post = await prismadb.scheduledPost.create({
            data: {
                content: data.content,
                platforms: data.platforms,
                attachments: data.attachments,
                scheduledFor: data.scheduledFor,
                createdById: user.id,
            }
        });

        revalidatePath("/cms/apps");
        return { success: true, post };
    } catch (error) {
        console.error("[CREATE_SCHEDULED_POST]", error);
        return { success: false, error: "Failed to create scheduled post" };
    }
}

// Get all scheduled posts for current user
export async function getScheduledPosts(filters?: {
    status?: "PENDING" | "PUBLISHED" | "FAILED" | "CANCELLED";
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized", posts: [] };
        }

        const user = await prismadb.users.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return { success: false, error: "User not found", posts: [] };
        }

        const posts = await prismadb.scheduledPost.findMany({
            where: {
                createdById: user.id,
                ...(filters?.status && { status: filters.status })
            },
            orderBy: { scheduledFor: "asc" }
        });

        return { success: true, posts };
    } catch (error) {
        console.error("[GET_SCHEDULED_POSTS]", error);
        return { success: false, error: "Failed to get scheduled posts", posts: [] };
    }
}

// Update a scheduled post
export async function updateScheduledPost(
    postId: string,
    data: {
        content?: string;
        platforms?: string[];
        attachments?: string[];
        scheduledFor?: Date;
    }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        const post = await prismadb.scheduledPost.update({
            where: { id: postId },
            data
        });

        revalidatePath("/cms/apps");
        return { success: true, post };
    } catch (error) {
        console.error("[UPDATE_SCHEDULED_POST]", error);
        return { success: false, error: "Failed to update scheduled post" };
    }
}

// Cancel/Delete a scheduled post
export async function cancelScheduledPost(postId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await prismadb.scheduledPost.update({
            where: { id: postId },
            data: { status: "CANCELLED" }
        });

        revalidatePath("/cms/apps");
        return { success: true };
    } catch (error) {
        console.error("[CANCEL_SCHEDULED_POST]", error);
        return { success: false, error: "Failed to cancel scheduled post" };
    }
}

// Delete a scheduled post permanently
export async function deleteScheduledPost(postId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        await prismadb.scheduledPost.delete({
            where: { id: postId }
        });

        revalidatePath("/cms/apps");
        return { success: true };
    } catch (error) {
        console.error("[DELETE_SCHEDULED_POST]", error);
        return { success: false, error: "Failed to delete scheduled post" };
    }
}
