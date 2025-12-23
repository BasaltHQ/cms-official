"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, LayoutGrid, ToggleLeft, Shield, Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getRoles, createRole, updateRoleModules, updateRoleDetails } from "@/actions/cms/role-settings";
import { CMS_MODULES } from "@/app/[locale]/cms/config";

interface Role {
    id: string;
    name: string;
    description: string | null;
    color: string;
    cmsModules: string[];
    _count: {
        users: number;
    }
}

const ROLE_COLORS: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/40",
    red: "bg-red-500/10 text-red-400 border-red-500/20 hover:border-red-500/40",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20 hover:border-pink-500/40",
};

const COLOR_OPTIONS = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "green", label: "Green", class: "bg-emerald-500" },
    { value: "amber", label: "Amber", class: "bg-amber-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "pink", label: "Pink", class: "bg-pink-500" },
];

// Re-defining for safety if layout import fails or is circular (Layout often is server component mixed)
// Ideally pass this as prop or shared constant, but for now copying the slug structure provided in context
// Re-defining for safety if layout import fails or is circular (Layout often is server component mixed)
// Ideally pass this as prop or shared constant, but for now copying the slug structure provided in context
// const SYSTEM_MODULES = [ ... ]; REMOVED in favor of direct import to ensure consistency

import { useRouter } from "next/navigation";

export function RoleManagement() {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form State
    const [roleName, setRoleName] = useState("");
    const [roleDesc, setRoleDesc] = useState("");
    const [roleColor, setRoleColor] = useState("#3b82f6"); // Default Blue Hex

    const fetchData = async () => {
        setLoading(true);
        const data = await getRoles();
        setRoles(data as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenCreate = () => {
        setEditingRole(null);
        setRoleName("");
        setRoleDesc("");
        setRoleColor("#3b82f6");
        setDialogOpen(true);
    };

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDesc(role.description || "");
        // Fallback to blue hex if it was a preset name or empty
        const color = role.color && role.color.startsWith("#") ? role.color : "#3b82f6";
        setRoleColor(color);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!roleName) return toast.error("Role name is required");

        try {
            if (editingRole) {
                // Update
                const res = await updateRoleDetails(editingRole.id, {
                    name: roleName,
                    description: roleDesc,
                    color: roleColor
                });
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("Role updated successfully");
                    setDialogOpen(false);
                    fetchData();
                    router.refresh();
                    window.dispatchEvent(new Event("role-update"));
                }
            } else {
                // Create
                const res = await createRole(roleName, roleDesc, roleColor);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success("Role created successfully");
                    setDialogOpen(false);
                    fetchData();
                    router.refresh();
                    window.dispatchEvent(new Event("role-update"));
                }
            }
        } catch (e) {
            toast.error("Failed to save role");
        }
    };

    const handleToggleModule = async (roleId: string, slug: string, currentModules: string[]) => {
        const isEnabled = currentModules.includes(slug);
        const newModules = isEnabled
            ? currentModules.filter(m => m !== slug)
            : [...currentModules, slug];

        // Optimistic update
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, cmsModules: newModules } : r));
        const res = await updateRoleModules(roleId, newModules);
        if (res.error) {
            toast.error(res.error);
            // Revert
            setRoles(prev => prev.map(r => r.id === roleId ? { ...r, cmsModules: currentModules } : r));
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-400" /> Role & Access Control
                    </h3>
                    <p className="text-sm text-slate-400">Define roles and restrict which CMS modules specific user groups can access.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-400/20 w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Add Role
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-slate-950 border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                            <DialogDescription>
                                {editingRole ? "Update role details and appearance." : "Define a new role identifier and color."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <label className="text-sm font-medium">Role Name</label>
                                    <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Content Editor" className="bg-slate-900 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Color</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-full h-10 rounded-md overflow-hidden border border-white/10 p-1 bg-slate-900">
                                            <input
                                                type="color"
                                                value={roleColor}
                                                onChange={e => setRoleColor(e.target.value)}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input value={roleDesc} onChange={e => setRoleDesc(e.target.value)} placeholder="Optional description..." className="bg-slate-900 border-white/10" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={!roleName} className="bg-indigo-600">
                                {editingRole ? "Save Changes" : "Create Role"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => {
                    // Determine color (handle legacy presets by mapping to hex, default to blue)
                    let hexColor = role.color || "#3b82f6";
                    if (!hexColor.startsWith("#")) {
                        // Simple preset mapper
                        const presets: Record<string, string> = {
                            blue: "#3b82f6", purple: "#a855f7", green: "#10b981",
                            amber: "#f59e0b", red: "#ef4444", pink: "#ec4899"
                        };
                        hexColor = presets[hexColor] || "#3b82f6";
                    }

                    return (
                        <div
                            key={role.id}
                            className="group border border-white/5 rounded-xl p-5 flex flex-col h-full transition-all duration-300 relative overflow-hidden bg-slate-900/50 hover:bg-slate-900/80"
                            style={{
                                // Dynamic glow effect variables for CSS
                                // @ts-ignore
                                "--role-color": hexColor,
                            } as React.CSSProperties}
                        >
                            {/* Hover Glow Effect */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500"
                                style={{
                                    background: `radial-gradient(circle at center, ${hexColor}, transparent 70%)`
                                }}
                            />

                            {/* Border Glow */}
                            <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-[color:var(--role-color)] transition-colors duration-300 opacity-50" />

                            <div className="relative z-10 flex justify-between items-start mb-4">
                                <div className="group/title flex items-center gap-2 cursor-pointer" onClick={() => handleOpenEdit(role)}>
                                    <h4 className="text-lg font-bold text-white group-hover/title:text-[color:var(--role-color)] transition-colors">
                                        {role.name}
                                    </h4>
                                    <Pencil className="h-3 w-3 text-slate-600 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                                </div>
                                <Badge variant="secondary" className="bg-slate-950 text-slate-300 flex items-center gap-1 border border-white/10" style={{ borderColor: `${hexColor}40` }}>
                                    <Users className="h-3 w-3" style={{ color: hexColor }} /> {role._count.users}
                                </Badge>
                            </div>

                            <p className="relative z-10 text-xs text-slate-400 line-clamp-2 mt-1 min-h-[2.5em] mb-4">
                                {role.description || "No description provided."}
                            </p>

                            <div className="flex-1 relative z-10">
                                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <LayoutGrid className="h-3 w-3" /> Enabled Modules ({(role.cmsModules || []).length})
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                                    {(role.cmsModules || []).length === 0 && <span className="text-xs text-slate-600 italic">No modules enabled</span>}
                                    {(role.cmsModules || []).map(m => {
                                        const mod = CMS_MODULES.find(sm => sm.slug === m);
                                        return (
                                            <span
                                                key={m}
                                                className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border transition-colors"
                                                style={{
                                                    borderColor: `${hexColor}30`,
                                                    color: hexColor,
                                                    backgroundColor: `${hexColor}10`
                                                }}
                                            >
                                                {mod?.label || m}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full text-xs h-8 border-slate-700 hover:border-[color:var(--role-color)] hover:text-[color:var(--role-color)] hover:bg-[color:var(--role-color)] hover:bg-opacity-10 transition-all">
                                            Configure Access
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-950 border-white/10 text-white max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Configure Modules for {role.name}</DialogTitle>
                                            <DialogDescription>Toggle which sections of the CMS this role can access.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                            {CMS_MODULES.map(module => {
                                                const isActive = (role.cmsModules || []).includes(module.slug);
                                                return (
                                                    <div
                                                        key={module.slug}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isActive ? '' : 'bg-slate-900/50 border-white/5'}`}
                                                        style={isActive ? {
                                                            backgroundColor: `${hexColor}15`,
                                                            borderColor: `${hexColor}40`
                                                        } : {}}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`p-1.5 rounded ${isActive ? '' : 'bg-slate-800 text-slate-500'}`}
                                                                style={isActive ? { backgroundColor: `${hexColor}20`, color: hexColor } : {}}
                                                            >
                                                                <LayoutGrid className="h-4 w-4" />
                                                            </div>
                                                            <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>{module.label}</span>
                                                        </div>
                                                        <Switch
                                                            checked={isActive}
                                                            onCheckedChange={() => handleToggleModule(role.id, module.slug, role.cmsModules || [])}
                                                            className="data-[state=checked]:bg-indigo-600"
                                                            style={isActive ? { backgroundColor: hexColor } : {}}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
