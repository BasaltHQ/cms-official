import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, Zap, Clock, GraduationCap, Plus, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CMSUniversityOverviewPage(props: { params: Promise<{ locale: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin || session?.user?.email === "info@basalthq.com";

    const docs = await prismadb.docArticle.findMany({
        where: { type: "university" }
    });

    const totalDocs = docs.length;
    const categories = new Set(docs.map(d => d.category)).size;
    const recentDocs = await prismadb.docArticle.findMany({
        where: { type: "university" },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });
    // ... existing logic ...

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* ... Header ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">University & SOPs</h1>
                    <p className="text-slate-400 mt-2 text-lg">Central knowledge base for standard operating procedures and training.</p>
                </div>
                {/* Only admin can create */}
                {isAdmin && (
                    <Link href={`/${params.locale}/cms/university/new`}>
                        <Button variant="gradient" className="px-4 py-2 rounded-md flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create SOP
                        </Button>
                    </Link>
                )}
            </div>

            {/* Admin Security Section */}
            {isAdmin && searchParams?.view !== 'all' && searchParams?.view !== 'categories' && (
                <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 group hover:bg-red-950/30 transition-all cursor-pointer">
                    <Link href={`/${params.locale}/cms/university/security`} className="flex-1 flex items-center gap-6 w-full">
                        <div className="h-16 w-16 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Admin Security Protocols</h3>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/20 uppercase tracking-wider font-bold">
                                    Restricted
                                </span>
                            </div>
                            <p className="text-slate-400 mt-1 max-w-2xl">
                                Access confidential documentation regarding Access Control, System Lockdown procedures, and the Emergency Kill Switch protocol.
                            </p>
                        </div>
                    </Link>
                    <div className="hidden md:block">
                        <Link href={`/${params.locale}/cms/university/security`}>
                            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                View Protocols
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href={`/${params.locale}/cms/university?view=all`} className="block transition-transform hover:scale-[1.02]">
                    <Card className="bg-slate-950/50 backdrop-blur-xl border-white/10 shadow-sm hover:border-blue-500/50 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Total SOPs</CardTitle>
                            <GraduationCap className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{totalDocs}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Click to view all modules
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/${params.locale}/cms/university?view=categories`} className="block transition-transform hover:scale-[1.02]">
                    <Card className="bg-slate-950/50 backdrop-blur-xl border-white/10 shadow-sm hover:border-emerald-500/50 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-200">Categories</CardTitle>
                            <Layers className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{categories}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Manage departments
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="bg-slate-950/50 backdrop-blur-xl border-white/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">New Additions</CardTitle>
                        <Zap className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {recentDocs.filter(d => d.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            This week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="border-b border-white/10">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/${params.locale}/cms/university`}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${!searchParams?.view ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"}`}
                    >
                        Overview
                    </Link>
                    <Link
                        href={`/${params.locale}/cms/university?view=all`}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${searchParams?.view === "all" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"}`}
                    >
                        All SOPs
                    </Link>
                    <Link
                        href={`/${params.locale}/cms/university?view=categories`}
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
                        <h2 className="text-xl font-semibold text-white">All Training Modules</h2>
                        {isAdmin && (
                            <Link href={`/${params.locale}/cms/university/new`}>
                                <div className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                    + Create New
                                </div>
                            </Link>
                        )}
                    </div>
                    {docs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {docs.map((doc) => (
                                <Link key={doc.id} href={`/${params.locale}/cms/university/${doc.id}`}>
                                    <div className="flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                <GraduationCap className="h-5 w-5" />
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
                    ) : (
                        <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-slate-900/50">
                            <p className="text-slate-500">No SOPs found.</p>
                        </div>
                    )}
                </div>
            ) : searchParams?.view === "categories" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold text-white">Departments & Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from(new Set(docs.map(d => d.category))).map((category) => (
                            <div key={category} className="p-6 bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-xl hover:border-emerald-500/50 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 px-2 py-1 bg-white/5 rounded">
                                        {docs.filter(d => d.category === category).length} Modules
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{category}</h3>
                                <div className="space-y-2">
                                    {docs.filter(d => d.category === category).slice(0, 3).map(doc => (
                                        <Link key={doc.id} href={`/${params.locale}/cms/university/${doc.id}`} className="block text-sm text-slate-400 hover:text-blue-400 truncate transition-colors">
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
                        <h2 className="text-xl font-semibold text-white">Recently Updated SOPs</h2>
                    </div>
                    {recentDocs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {recentDocs.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/${params.locale}/cms/university/${doc.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer">
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
                    ) : (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-lg bg-slate-950/30">
                            <p className="text-slate-500">No university documentation found. Create your first SOP above.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
