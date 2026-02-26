"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Download, Ticket, Gift, CreditCard, Users, Link as LinkIcon, Box, LucideIcon } from "lucide-react";
import { CouponsTable, Coupon } from "@/components/cms/coupons/CouponsTable";
import { CouponModal } from "@/components/cms/coupons/CouponModal";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/actions/cms/coupons";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadCoupons = async () => {
        setIsLoading(true);
        const res = await getCoupons();
        if (res.success && res.data) {
            // Map Prisma format to UI format if needed, mostly they match based on our interface
            // We need to ensure types match perfectly. Prisma returns objects, our UI expects Coupon interface.
            // Our Coupon interface in CouponsTable has specific types.
            // We cast for now, assuming server action returns compatible structure.
            const mappedData = res.data.map(c => ({
                ...c,
                description: c.description || "",
                expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString() : "",
                type: c.type as any
            }));
            setCoupons(mappedData);
        } else {
            toast.error("Failed to load coupons");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleCreate = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        try {
            const res = await deleteCoupon(id);
            if (res.success) {
                setCoupons(prev => prev.filter(c => c.id !== id));
                toast.success("Coupon deleted");
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting coupon");
        }
    };

    const handleSave = async (couponData: Partial<Coupon>) => {
        try {
            if (editingCoupon) {
                // Update
                const res = await updateCoupon(editingCoupon.id, couponData as any);
                if (res.success) {
                    await loadCoupons(); // Reload to get fresh data
                    toast.success("Coupon updated successfully");
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Failed to update");
                }
            } else {
                // Create
                const res = await createCoupon(couponData as any);
                if (res.success) {
                    await loadCoupons();
                    toast.success("Coupon created successfully");
                    setIsModalOpen(false);
                } else {
                    toast.error(res.error || "Failed to create");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Ticket className="h-8 w-8 text-amber-500" />
                        Coupons & Promotions
                    </h1>
                    <p className="text-slate-400 mt-1">Manage discounts, promo codes, and special offers.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-500 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            {isLoading ? (
                <div className="text-center py-20 bg-[#0A0A0B] border border-white/5 rounded-xl">
                    <p className="text-slate-500">Loading coupons...</p>
                </div>
            ) : (
                <CouponsTable
                    data={coupons}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingCoupon}
            />

            {/* Extensions / Upsell Area */}
            <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-xl font-semibold text-white">Power Up Your Promotions</h3>
                <p className="text-slate-400 text-sm">Take your marketing to the next level with these integrated modules.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ExtensionCard
                        icon={Gift}
                        title="Smart Coupons"
                        description="Powerful 'all in one' solution for gift certificates, store credits, and vouchers."
                        color="text-pink-400"
                    />
                    <ExtensionCard
                        icon={Users}
                        title="Personalized Coupons"
                        description="Generate dynamic personalized coupons for your customers that increase purchase rates."
                        color="text-blue-400"
                    />
                    <ExtensionCard
                        icon={LinkIcon}
                        title="URL Coupons"
                        description="Create a unique URL that applies a discount and optionally adds products to the cart."
                        color="text-purple-400"
                    />
                    <ExtensionCard
                        icon={CreditCard}
                        title="Store Credit"
                        description="Create 'store credit' coupons for customers which are redeemable at checkout."
                        color="text-emerald-400"
                    />
                    <ExtensionCard
                        icon={Box}
                        title="Free Gift Coupons"
                        description="Give away a free item to any customer with the coupon code."
                        color="text-amber-400"
                    />
                    <ExtensionCard
                        icon={Users}
                        title="Group Coupons"
                        description="Coupons for groups, restricted to group members or roles."
                        color="text-cyan-400"
                    />
                </div>
            </div>
        </div>
    );
}

function ExtensionCard({ icon: Icon, title, description, color }: { icon: LucideIcon, title: string, description: string, color: string }) {
    return (
        <Card className="bg-[#0A0A0B] border-white/5 hover:border-white/10 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", color)}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium text-white group-hover:text-amber-400 transition-colors">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-slate-500 text-xs leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}
