"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Repeat2, BarChart2, PenSquare, ArrowRight, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { AppConfigModal } from "@/components/cms/apps/AppConfigModal";
import { useAppConnection, useAppDashboardData } from "@/hooks/useAppConnection";

interface SocialDashboardProps {
    appId: string;
    appName: string;
    accentColor: string;
    iconUrl: string;
}

interface SocialData {
    profile: {
        id: string;
        name: string;
        handle: string;
        avatarUrl?: string;
        followersCount: number;
        followingCount: number;
    };
    metrics: {
        impressions7d: number;
        engagementRate: number;
        postsCount: number;
    };
    recentPosts: Array<{
        id: string;
        content: string;
        likes: number;
        comments: number;
        shares: number;
        createdAt: string;
    }>;
}

export function SocialDashboard({ appId, appName, accentColor, iconUrl }: SocialDashboardProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const { isConnected, isLoading: connectionLoading } = useAppConnection(appId);
    const { data, isLoading: dataLoading, refetch } = useAppDashboardData<SocialData>(appId, isConnected);

    if (connectionLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center border border-white/10" style={{ backgroundColor: `${accentColor}20` }}>
                    <img src={iconUrl} alt={appName} className="w-10 h-10 object-contain" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold text-white">Connect {appName}</h2>
                    <p className="text-slate-400">
                        Link your account to track post performance, engagement metrics, and broadcast content directly from your CMS.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                    onClick={() => setIsConfigOpen(true)}
                >
                    Connect Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <AppConfigModal
                    isOpen={isConfigOpen}
                    onClose={() => setIsConfigOpen(false)}
                    app={{
                        id: appId,
                        name: appName,
                        icon: iconUrl,
                        description: `Manage your ${appName} presence.`,
                        category: "Social",
                        status: "active",
                        connected: false,
                        author: appName,
                        rating: 4.5,
                        installs: "1M+",
                        updatedAt: "Just now"
                    }}
                />
            </div>
        );
    }

    const isLoading = dataLoading || !data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {data?.profile.avatarUrl && (
                        <img src={data.profile.avatarUrl} alt={data.profile.name} className="w-12 h-12 rounded-full" />
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-white">{data?.profile.name || appName}</h2>
                        <p className="text-slate-400">{data?.profile.handle || `Manage your ${appName} presence`}</p>
                    </div>
                </div>
                <Button className="text-white" style={{ backgroundColor: accentColor }} onClick={() => refetch()}>
                    <PenSquare className="w-4 h-4 mr-2" />
                    New Post
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Followers</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "--" : data.profile.followersCount.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Impressions (7d)</CardTitle>
                        <BarChart2 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "--" : data.metrics.impressions7d.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Engagement Rate</CardTitle>
                        <Heart className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "--%" : `${data.metrics.engagementRate}%`}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1A1B1E] border-white/10 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Posts</CardTitle>
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "--" : data.metrics.postsCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-[#1A1B1E] border-white/10 text-white">
                <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                        </div>
                    ) : data.recentPosts.length > 0 ? (
                        <div className="space-y-4">
                            {data.recentPosts.map((post) => (
                                <div key={post.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <p className="text-sm text-white line-clamp-2">{post.content}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                                        <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3" /> {post.shares}</span>
                                        <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            No posts found in the last 30 days.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

