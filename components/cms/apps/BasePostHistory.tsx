"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    FileText,
    Hash,
    Calendar,
    Heart,
    Repeat,
    MessageCircle,
    Gem,
    ExternalLink,
    Loader2,
    CheckCircle,
    XCircle
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface BasePostHistoryProps {
    refreshTrigger?: number;
}

export function BasePostHistory({ refreshTrigger }: BasePostHistoryProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [refreshTrigger]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/social/base");
            const data = await res.json();
            if (res.ok) {
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500 bg-[#0A0A0B]/50 rounded-xl border border-white/5">
                <p>No broadcast history found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0A0A0B] shadow-lg">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="w-[300px] text-slate-300">
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Content</div>
                        </TableHead>
                        <TableHead className="text-slate-300">
                            <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Channel</div>
                        </TableHead>
                        <TableHead className="text-slate-300">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</div>
                        </TableHead>
                        <TableHead className="text-slate-300 text-center">
                            <div className="flex items-center justify-center gap-2"><Heart className="w-4 h-4" /> Likes</div>
                        </TableHead>
                        <TableHead className="text-slate-300 text-center">
                            <div className="flex items-center justify-center gap-2"><Repeat className="w-4 h-4" /> Recasts</div>
                        </TableHead>
                        <TableHead className="text-slate-300 text-center">
                            <div className="flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Replies</div>
                        </TableHead>
                        <TableHead className="text-slate-300 text-center">
                            <div className="flex items-center justify-center gap-2 text-purple-400"><Gem className="w-4 h-4" /> Mints</div>
                        </TableHead>
                        <TableHead className="text-right text-slate-300">
                            <div className="flex items-center justify-end gap-2"><ExternalLink className="w-4 h-4" /> View</div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.hash} className="border-white/5 hover:bg-white/5 transition-colors group">
                            <TableCell className="font-medium text-slate-200">
                                <div className="line-clamp-2 max-w-[300px]">
                                    {post.text}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-white/5">
                                    /{post.channel?.id || "base"}
                                </span>
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm whitespace-nowrap">
                                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-center font-mono text-slate-300">
                                {post.reactions?.likes_count || 0}
                            </TableCell>
                            <TableCell className="text-center font-mono text-slate-300">
                                {post.reactions?.recasts_count || 0}
                            </TableCell>
                            <TableCell className="text-center font-mono text-slate-300">
                                {post.replies?.count || 0}
                            </TableCell>
                            <TableCell className="text-center font-mono text-purple-400 font-bold">
                                {post.mints_count || 0}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link
                                    href={`https://warpcast.com/${post.author?.username}/${post.hash.substring(0, 10)}`}
                                    target="_blank"
                                    className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
