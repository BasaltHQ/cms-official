"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    LayoutGrid, List, Search, Plus, Filter,
    MoreVertical, Phone, Mail, Globe,
    Linkedin, Star, Shield, AlertTriangle, CheckCircle,
    GalleryHorizontal // Rolodex Icon
} from "lucide-react";
import { RolodexModal } from "@/components/cms/RolodexModal";
import VendorDetailsModal from "@/components/cms/VendorDetailsModal";
import { VendorProfile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAllVendors } from "@/actions/vcms/get-all-vendors";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Types (Mirroring the Prisma Model essentially but with serialized dates)
interface VendorFrontend {
    id: string;
    name: string | null;
    company_name?: string | null;
    title: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;

    // VCMS Props
    vcms_score: number;
    primary_industry: string | null;
    industry_synonyms: string[];

    // Validation
    validation_status: "PENDING" | "VALIDATED" | "AMBIGUOUS" | "FAILED";
    validation_notes: string | null;
    raw_ocr_data: any;

    // Compliance
    document_status: "MISSING" | "PARTIAL" | "VALID" | "EXPIRED";
    coi_expiry: string | null;
    license_expiry?: string | null;
    license_number: string | null;
    w9_on_file: boolean;
    is_do_not_use: boolean;

    // Integrations
    angies_list_url: string | null;
    google_reviews_url: string | null;
    google_rating: number | null;
    review_count: number | null;
    custom_fields: any;

    // Time (Serialized)
    createdAt?: string | null;
    updatedAt?: string | null;
    last_contact_date?: string | null;

    // Relations
    business_cards: { url: string; isBusinessCard?: boolean }[];
}

export default function VendorsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user && !session.user.isAdmin && !session.user.cmsModules?.includes("vendors")) {
            toast.error("You do not have permission to access Vendor Management.");
            router.push(`/${locale}/cms/dashboard`);
        }
    }, [session, locale, router]);

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [vendors, setVendors] = useState<VendorFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showRolodex, setShowRolodex] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorFrontend | null>(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await getAllVendors();
            if (res.success) {
                setVendors((res.data as any) || []);
            } else {
                toast.error(res.error);
            }
        } catch (e) {
            toast.error("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredVendors = vendors.filter(v => {
        if (!search.trim()) return true; // Show all if no search
        const query = search.toLowerCase();
        return (
            (v.name?.toLowerCase().includes(query)) ||
            (v.company_name?.toLowerCase().includes(query)) ||
            (v.primary_industry?.toLowerCase().includes(query)) ||
            (v.email?.toLowerCase().includes(query))
        );
    });

    return (
        <div className="flex flex-col h-full bg-[#0A0A0B] text-slate-200">
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0B]/50 backdrop-blur-xl sticky top-0 z-30">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Contacts</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{vendors.length}</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage vendor profiles, compliance, and scoring.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find vendors..."
                            className="w-64 pl-9 bg-black/20 border-white/10 focus:border-cyan-500/50 text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 rounded-md transition-all", viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button
                        onClick={() => setShowRolodex(true)}
                        className="p-2 rounded-md transition-all text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                        title="Open Rolodex"
                    >
                        <GalleryHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <Link href={`/${locale}/cms/media?tab=vendors`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                    </Button>
                </Link>
            </div>
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Loading contacts...</div>
                ) : filteredVendors.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-600">
                            <Search className="h-6 w-6" />
                        </div>
                        <p>No contacts found.</p>
                        <Link href={`/${locale}/cms/media?tab=vendors`} className="mt-4 text-emerald-400 hover:underline text-sm">Scan a business card to get started</Link>
                    </div>
                ) : (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredVendors.map(vendor => (
                                    <VendorCard key={vendor.id} vendor={vendor} onClick={() => setSelectedVendor(vendor)} />
                                ))}
                            </div>
                        ) : (
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0A0A0B]/30 backdrop-blur-md">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                                        <tr>
                                            <th className="px-4 py-3">Vendor / Contact</th>
                                            <th className="px-4 py-3">Industry</th>
                                            <th className="px-4 py-3">Score</th>
                                            <th className="px-4 py-3">Compliance</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredVendors.map(vendor => (
                                            <tr key={vendor.id} onClick={() => setSelectedVendor(vendor)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-white">{vendor.name}</div>
                                                    <div className="text-xs text-slate-500">{vendor.title || "No Title"}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                                                        {vendor.primary_industry || "Unclassified"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ScoreBadge score={vendor.vcms_score} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ComplianceStatus status={vendor.document_status} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {vendor.website && (
                                                            <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white">
                                                                <Globe className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                        {vendor.email && (
                                                            <a href={`mailto:${vendor.email}`} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white">
                                                                <Mail className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* Modal for Details */}
            <VendorDetailsModal isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} vendor={selectedVendor} onUpdate={fetchVendors} />

            <RolodexModal
                isOpen={showRolodex}
                onClose={() => setShowRolodex(false)}
                vendors={filteredVendors}
                onVendorSelect={setSelectedVendor}
            />
        </div>
    );
}

// --- Sub Components ---

function VendorCard({ vendor, onClick }: { vendor: VendorFrontend, onClick: () => void }) {
    return (
        <div onClick={onClick} className="group relative bg-[#0A0A0B] border border-white/10 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)] flex flex-col h-full cursor-pointer">
            {/* Header / Cover */}
            <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-white/5 relative p-4">
                <div className="absolute top-4 right-4">
                    <ScoreBadge score={vendor.vcms_score} />
                </div>
                {vendor.is_do_not_use && (
                    <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded border border-red-400 shadow-red-500/20 shadow-lg">
                        Do Not Use
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 pt-0 flex-1 flex flex-col">
                <div className="-mt-10 mb-3">
                    {vendor.business_cards && vendor.business_cards.length > 0 ? (
                        <div className="h-20 w-32 rounded-xl bg-black border-4 border-[#0A0A0B] shadow-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={vendor.business_cards[0].url}
                                alt={vendor.name || "Business Card"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-20 w-20 rounded-xl bg-slate-800 border-4 border-[#0A0A0B] shadow-xl flex items-center justify-center overflow-hidden">
                            <span className="text-2xl font-bold text-slate-600 uppercase">{vendor.name?.[0] || "?"}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{vendor.name}</h3>
                    <p className="text-sm text-slate-400 mb-2 truncate">{vendor.title || "No Title"}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-400 uppercase tracking-wider">
                            {vendor.primary_industry || "General"}
                        </span>
                    </div>

                    <div className="space-y-2 mb-4">
                        {vendor.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Phone className="h-3.5 w-3.5 text-slate-600" />
                                <span>{vendor.phone}</span>
                            </div>
                        )}
                        {vendor.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Mail className="h-3.5 w-3.5 text-slate-600" />
                                <span className="truncate">{vendor.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <ComplianceStatus status={vendor.document_status} />

                    <div className="flex gap-1">
                        {vendor.website && (
                            <a href={(vendor.website.includes('http') ? '' : 'https://') + vendor.website} target="_blank" className="p-2 hover:bg-white/5 rounded-md text-slate-500 hover:text-emerald-400 transition-colors">
                                <Globe className="h-4 w-4" />
                            </a>
                        )}
                        {/* Placeholder for LinkedIn if we had it in DB */}
                        <button className="p-2 hover:bg-white/5 rounded-md text-slate-500 hover:text-blue-400 transition-colors">
                            <Linkedin className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreBadge({ score }: { score: number }) {
    let color = "text-slate-400 bg-slate-400/10 border-slate-400/20";
    if (score >= 80) color = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    else if (score >= 50) color = "text-amber-400 bg-amber-400/10 border-amber-400/20";
    else if (score > 0) color = "text-red-400 bg-red-400/10 border-red-400/20";

    return (
        <div className={cn("flex flex-col items-center justify-center h-10 w-10 rounded-full border backdrop-blur-md", color)}>
            <span className="text-xs font-black">{score}</span>
        </div>
    );
}

function ComplianceStatus({ status }: { status: string }) {
    if (status === "VALID") {
        return <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider"><CheckCircle className="h-3 w-3" /> Compliant</div>;
    }
    if (status === "MISSING") {
        return <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase tracking-wider"><Shield className="h-3 w-3" /> Missing Docs</div>;
    }
    return <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider"><AlertTriangle className="h-3 w-3" /> Review</div>;
}

