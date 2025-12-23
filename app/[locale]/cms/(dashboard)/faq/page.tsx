import { prismadb } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Layers, Plus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeedFaqsButton } from "./_components/SeedFaqsButton";

export default async function CMSFaqPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;

    const faqs = await prismadb.faq.findMany({
        orderBy: { order: "asc" }
    });

    const totalFaqs = faqs.length;
    const categories = new Set(faqs.map(f => f.category)).size;

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">FAQ Manager</h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage your frequently asked questions and answers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <SeedFaqsButton />
                    <Link href={`/${params.locale}/cms/faq/new`}>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2">
                            <Plus className="h-4 w-4" />
                            Create New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-sm hover:border-blue-500/50 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Total Questions</CardTitle>
                        <HelpCircle className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{totalFaqs}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#0A0A0B] backdrop-blur-xl border-white/10 shadow-sm hover:border-emerald-500/50 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">Categories</CardTitle>
                        <Layers className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{categories}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">All Questions</h2>

                {faqs.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-slate-400 mb-4">No FAQs found.</p>
                        <SeedFaqsButton />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {faqs.map((faq) => (
                            <Link key={faq.id} href={`/${params.locale}/cms/faq/${faq.id}`}>
                                <div className="flex items-center justify-between p-4 bg-[#0A0A0B] backdrop-blur-xl border border-white/10 rounded-lg hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                            <HelpCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{faq.question}</h4>
                                            <p className="text-sm text-slate-400">{faq.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                {faq.isVisible ? (
                                                    <span className="flex items-center gap-1 text-emerald-400"><Eye className="h-3 w-3" /> Visible</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-slate-500"><EyeOff className="h-3 w-3" /> Hidden</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
