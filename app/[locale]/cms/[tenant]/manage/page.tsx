"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash, Save, GripVertical, Trash2, Users2, Linkedin, Twitter, Image as ImageIcon } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/cms/DeleteConfirmationModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TeamMember {
    id?: string;
    name: string;
    role: string;
    imageSrc: string;
    linkedin?: string;
    twitter?: string;
    order?: number;
}

interface TeamGroup {
    id?: string;
    title: string;
    order: number;
    members: TeamMember[];
}

export default function TeamAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState<TeamGroup[]>([]);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/team");
            if (!res.ok) throw new Error("Failed to fetch data");
            const data = await res.json();
            setGroups(data.groups || []);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        try {
            setSaving(true);
            const res = await fetch("/api/team", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groups }),
            });

            if (!res.ok) throw new Error("Failed to save");
            toast.success("Team updated successfully");
            fetchData();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const updateGroup = (index: number, field: keyof TeamGroup, value: any) => {
        const newGroups = [...groups];
        newGroups[index] = { ...newGroups[index], [field]: value };
        setGroups(newGroups);
    };

    const updateMember = (groupIndex: number, memberIndex: number, field: keyof TeamMember, value: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex].members[memberIndex] = {
            ...newGroups[groupIndex].members[memberIndex],
            [field]: value,
        };
        setGroups(newGroups);
    };

    const addMember = (groupIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].members.push({
            name: "New Member",
            role: "Role",
            imageSrc: "/images/team/member1.jpg",
            linkedin: "",
            twitter: ""
        });
        setGroups(newGroups);
    };

    const removeMember = (groupIndex: number, memberIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].members.splice(memberIndex, 1);
        setGroups(newGroups);
    };

    const addGroup = () => {
        setGroups([...groups, {
            title: "New Group",
            order: groups.length,
            members: []
        }]);
    };

    const confirmRemoveGroup = () => {
        if (groupToDelete === null) return;
        const newGroups = [...groups];
        newGroups.splice(groupToDelete, 1);
        setGroups(newGroups);
        setGroupToDelete(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Team Management</h1>
                    <p className="text-slate-400 mt-1 text-lg">Manage features and team members for the About page.</p>
                </div>
                <Button
                    onClick={onSave}
                    disabled={saving}
                    variant="gradient"
                    className="text-white"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <DeleteConfirmationModal
                isOpen={groupToDelete !== null}
                onClose={() => setGroupToDelete(null)}
                onConfirm={confirmRemoveGroup}
                title="Delete Team Group"
                description="Are you sure you want to remove this group? All members in it will be removed."
            />

            {/* Groups Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Team Groups</h2>
                <Button
                    onClick={addGroup}
                    variant="outline"
                    className="border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 text-slate-400 hover:text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Group
                </Button>
            </div>

            {/* Groups List */}
            <div className="space-y-8">
                {groups.map((group, gIndex) => (
                    <Card key={group.id || gIndex} className="bg-[#0A0A0B] backdrop-blur-sm border-white/10 shadow-lg">
                        <CardHeader className="p-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <GripVertical className="h-5 w-5 text-slate-500 cursor-grab active:cursor-grabbing" />
                                    <Input
                                        className="text-xl font-bold bg-transparent border-transparent hover:border-white/10 focus:border-blue-500 p-0 px-2 h-auto w-full text-white placeholder:text-slate-600 focus-visible:ring-0 rounded-sm"
                                        value={group.title}
                                        onChange={(e) => updateGroup(gIndex, "title", e.target.value)}
                                        placeholder="Group Title (e.g. Leadership)"
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setGroupToDelete(gIndex)}
                                    className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.members.map((member, mIndex) => (
                                    <div key={mIndex} className="group relative bg-[#13151A] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeMember(gIndex, mIndex)}
                                                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-white/10"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Avatar & Basic Info */}
                                            <div className="flex gap-3">
                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-black flex-shrink-0 border border-white/10 relative group-hover:border-white/30 transition-colors">
                                                    {member.imageSrc ? (
                                                        <img
                                                            src={member.imageSrc}
                                                            alt={member.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.querySelector('.fallback-initials')?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`fallback-initials absolute inset-0 flex items-center justify-center bg-zinc-900 text-white font-medium ${member.imageSrc ? 'hidden' : ''}`}>
                                                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 flex-1 min-w-0 pr-8">
                                                    <Input
                                                        className="h-7 text-sm font-semibold bg-transparent border-transparent hover:border-white/10 text-white p-1"
                                                        placeholder="Name"
                                                        value={member.name}
                                                        onChange={(e) => updateMember(gIndex, mIndex, "name", e.target.value)}
                                                    />
                                                    <Input
                                                        className="h-6 text-xs text-slate-400 bg-transparent border-transparent hover:border-white/10 p-1"
                                                        placeholder="Role"
                                                        value={member.role}
                                                        onChange={(e) => updateMember(gIndex, mIndex, "role", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Details Inputs */}
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-3 w-3 text-zinc-500" />
                                                    <Input
                                                        className="h-7 text-xs bg-black/40 border-white/10 text-slate-300 placeholder:text-slate-600 font-mono"
                                                        placeholder="/images/team/..."
                                                        value={member.imageSrc}
                                                        onChange={(e) => updateMember(gIndex, mIndex, "imageSrc", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Linkedin className="h-3 w-3 text-blue-400" />
                                                    <Input
                                                        className="h-7 text-xs bg-black/40 border-white/10 text-slate-300 placeholder:text-slate-600 font-mono"
                                                        placeholder="LinkedIn URL"
                                                        value={member.linkedin || ""}
                                                        onChange={(e) => updateMember(gIndex, mIndex, "linkedin", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Twitter className="h-3 w-3 text-sky-400" />
                                                    <Input
                                                        className="h-7 text-xs bg-black/40 border-white/10 text-slate-300 placeholder:text-slate-600 font-mono"
                                                        placeholder="X (Twitter) URL"
                                                        value={member.twitter || ""}
                                                        onChange={(e) => updateMember(gIndex, mIndex, "twitter", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    onClick={() => addMember(gIndex)}
                                    variant="outline"
                                    className="h-full min-h-[140px] border-dashed border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex flex-col gap-2"
                                >
                                    <Plus className="h-6 w-6" />
                                    <span>Add Team Member</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
