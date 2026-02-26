import { prismadb } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, Zap, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";


export default async function CMSDocsOverviewPage(props: { params: Promise<{ locale: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const docs = await prismadb.docArticle.findMany({
        where: { type: "docs" }
    });
    const totalDocs = docs.length;
    const categories = new Set(docs.map(d => d.category)).size;
    const recentDocs = await prismadb.docArticle.findMany({
        where: { type: "docs" },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Documentation Center</h1>
                <p className="text-slate-400 mt-2 text-base md:text-lg">Manage your entire knowledge base from one unified interface.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Link href={`/${params.locale}/cms/docs?view=all`} className="block transition-transform hover:scale-[1.02]">
                    <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-sm hover:border-blue-500/50 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Total Articles</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalDocs}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Click to view all docs
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/${params.locale}/cms/docs?view=categories`} className="block transition-transform hover:scale-[1.02]">
                    <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-sm hover:border-emerald-500/50 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Active Categories</CardTitle>
                            <Layers className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{categories}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Manage topics
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">API Endpoints</CardTitle>
                        <Zap className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">12</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Documented routes
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="border-b border-white/10 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-6 min-w-max px-1">
                    <Link
                        href={`/${params.locale}/cms/docs`}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${!searchParams?.view ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"}`}
                    >
                        Overview
                    </Link>
                    <Link
                        href={`/${params.locale}/cms/docs?view=all`}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${searchParams?.view === "all" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"}`}
                    >
                        All Docs
                    </Link>
                    <Link
                        href={`/${params.locale}/cms/docs?view=categories`}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${searchParams?.view === "categories" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"}`}
                    >
                        Categories
                    </Link>
                </div>
            </div>

            {/* Content Views */}
            {searchParams?.view === "all" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">All Documentation</h2>
                        <Link href={`/${params.locale}/cms/docs/new`}>
                            <div className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                + Create New
                            </div>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {docs.map((doc) => (
                            <Link key={doc.id} href={`/${params.locale}/cms/docs/${doc.id}`}>
                                <div className="flex items-center justify-between p-4 bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{doc.title}</h4>
                                            <p className="text-sm text-slate-400">{doc.category} • /{doc.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Last Updated</p>
                                            <p className="text-sm text-slate-300 font-mono">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-xs text-slate-400">
                                            {doc.type}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : searchParams?.view === "categories" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-white">Content Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from(new Set(docs.map(d => d.category))).map((category) => (
                            <div key={category} className="p-6 bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-xl hover:border-emerald-500/50 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-white/5 rounded">
                                        {docs.filter(d => d.category === category).length} Articles
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{category}</h3>
                                <div className="space-y-2">
                                    {docs.filter(d => d.category === category).slice(0, 3).map(doc => (
                                        <Link key={doc.id} href={`/${params.locale}/cms/docs/${doc.id}`} className="block text-sm text-slate-400 hover:text-blue-400 truncate transition-colors">
                                            • {doc.title}
                                        </Link>
                                    ))}
                                    {docs.filter(d => d.category === category).length > 3 && (
                                        <p className="text-xs text-slate-600 italic">+ {docs.filter(d => d.category === category).length - 3} more</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Recent Activity (Overview Mode) */
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <h2 className="text-xl font-semibold text-white">Recently Updated</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {recentDocs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/${params.locale}/cms/docs/${doc.id}`}
                                className="block"
                            >
                                <div className="flex items-center justify-between p-4 bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer">
                                    <div>
                                        <h4 className="font-semibold text-white">{doc.title}</h4>
                                        <p className="text-sm text-slate-400">{doc.category} • {doc.slug}</p>
                                    </div>
                                    <div className="text-sm text-slate-500 font-mono">
                                        {new Date(doc.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
