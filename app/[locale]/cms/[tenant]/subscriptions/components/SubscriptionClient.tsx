"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Download, Settings, Trash, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubscribers, deleteSubscriber, updateSubscriberPreferences, addSubscriber } from "@/actions/cms/subscriptions";
import SubscriptionConfigModal from "./SubscriptionConfigModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SubscriptionClient() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, [page, search]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await getSubscribers(page, 20, search);
            if (res.success) {
                setSubscribers(res.data || []);
                setPagination(res.pagination);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to fetch subscribers");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newEmail) return;
        setAdding(true);
        try {
            const res = await addSubscriber({ email: newEmail, firstName: newFirstName, lastName: newLastName });
            if (res.success) {
                toast.success("Subscriber added");
                setIsAddOpen(false);
                setNewEmail("");
                setNewFirstName("");
                setNewLastName("");
                fetchSubscribers();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            const res = await deleteSubscriber(id);
            if (res.success) {
                toast.success("Subscriber deleted");
                fetchSubscribers();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggle = async (id: string, field: "subscribedToBlog" | "subscribedToCareers") => {
        // Optimistic update
        const sub = subscribers.find(s => s.id === id);
        if (!sub) return;
        const newValue = !sub[field];

        setSubscribers(subscribers.map(s => s.id === id ? { ...s, [field]: newValue } : s));

        try {
            const res = await updateSubscriberPreferences(id, { [field]: newValue });
            if (!res.success) {
                // Revert
                setSubscribers(subscribers.map(s => s.id === id ? { ...s, [field]: !newValue } : s));
                toast.error(res.error);
            }
        } catch (error) {
            setSubscribers(subscribers.map(s => s.id === id ? { ...s, [field]: !newValue } : s));
            toast.error("Failed to update");
        }
    };

    const handleExport = () => {
        const headers = ["Email", "First Name", "Last Name", "Blog Updates", "Career Alerts", "Created At"];
        const csvContent = [
            headers.join(","),
            ...subscribers.map(s => [
                s.email,
                s.firstName || "",
                s.lastName || "",
                s.subscribedToBlog ? "Yes" : "No",
                s.subscribedToCareers ? "Yes" : "No",
                new Date(s.createdAt).toISOString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 md:pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Subscriptions</h2>
                    <p className="text-muted-foreground">Manage subscribers and notification preferences.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Button className="bg-black border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white flex-1 md:flex-none" onClick={() => setIsConfigOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Settings</span>
                        <span className="inline sm:hidden">Config</span>
                    </Button>
                    <Button className="bg-black border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white flex-1 md:flex-none" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
                <Input
                    placeholder="Search subscribers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-[300px] bg-[#0A0A0B] border-white/10 text-white placeholder:text-slate-500"
                />
            </div>

            <Card className="bg-[#0A0A0B] border-white/10">
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5 bg-black/40">
                                <TableHead className="text-slate-400">Email</TableHead>
                                <TableHead className="text-slate-400">Name</TableHead>
                                <TableHead className="text-slate-400 text-center">Blog Updates</TableHead>
                                <TableHead className="text-slate-400 text-center">Career Alerts</TableHead>
                                <TableHead className="text-slate-400 text-right">Joined</TableHead>
                                <TableHead className="text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : subscribers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No subscribers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscribers.map((sub) => (
                                    <TableRow key={sub.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">{sub.email}</TableCell>
                                        <TableCell className="text-slate-300">
                                            {[sub.firstName, sub.lastName].filter(Boolean).join(" ") || "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={sub.subscribedToBlog ? "default" : "secondary"}
                                                className={`cursor-pointer ${sub.subscribedToBlog ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}
                                                onClick={() => handleToggle(sub.id, "subscribedToBlog")}
                                            >
                                                {sub.subscribedToBlog ? "Active" : "Off"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={sub.subscribedToCareers ? "default" : "secondary"}
                                                className={`cursor-pointer ${sub.subscribedToCareers ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}
                                                onClick={() => handleToggle(sub.id, "subscribedToCareers")}
                                            >
                                                {sub.subscribedToCareers ? "Active" : "Off"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-slate-400">
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} className="h-8 w-8 p-0 text-slate-500 hover:text-red-400">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <SubscriptionConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-[#0A0A0B] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Subscriber</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Manually add a new subscriber to the list.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="bg-black border-white/10 focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={newFirstName}
                                    onChange={e => setNewFirstName(e.target.value)}
                                    placeholder="John"
                                    className="bg-black border-white/10 focus-visible:ring-offset-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={newLastName}
                                    onChange={e => setNewLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="bg-black border-white/10 focus-visible:ring-offset-0"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="hover:bg-white/5 hover:text-white">Cancel</Button>
                        <Button onClick={handleAdd} disabled={!newEmail || adding} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Subscriber
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
