"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Zap, Settings, X } from "lucide-react";

interface FeatureToggleManagerProps {
    userId: string;
    userName: string;
    onClose: () => void;
}

// Define the customizable feature set
const AVAILABLE_FEATURES = {
    CAN_ACCESS_ANALYTICS: "Access Dashboard Analytics",
    CAN_USE_AI_TOOLS: "Use AI/GPT Tools (e.g., SEO Generation)",
    CAN_CREATE_CONTENT: "Create New Content (Posts, Jobs, etc.)",
    CAN_DELETE_ASSETS: "Delete Assets/Content",
};

type FeatureSet = Partial<Record<keyof typeof AVAILABLE_FEATURES, boolean>>;

export default function FeatureToggleManager({
    userId,
    userName,
    onClose,
}: FeatureToggleManagerProps) {
    const [toggles, setToggles] = useState<FeatureSet>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch current user-specific feature overrides
    useEffect(() => {
        const fetchFeatures = async () => {
            setLoading(true);
            try {
                // API to get current overrides for userId
                const res = await fetch(`/api/admin/user-features/${userId}`);
                const data = await res.json();
                setToggles(data.features || {}); // Load existing overrides
            } catch (error) {
                toast.error("Failed to load user features.");
                console.error(error);
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchFeatures();
    }, [userId, onClose]);

    const handleToggle = (featureKey: keyof typeof AVAILABLE_FEATURES) => {
        setToggles((prev) => ({
            ...prev,
            [featureKey]: !prev[featureKey],
        }));
    };

    // 2. Save the feature overrides
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/admin/user-features/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ features: toggles }),
            });
            toast.success(`Custom features saved for ${userName}.`);
            onClose();
        } catch (error) {
            toast.error("Failed to save feature settings.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                <div className="p-8 flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-[#0F1115] rounded-xl shadow-2xl w-full max-w-lg border border-white/10">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                        <Settings className="h-6 w-6 text-indigo-400" />
                        Customize Features: {userName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {Object.entries(AVAILABLE_FEATURES).map(([key, label]) => (
                        <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
                        >
                            <span className="text-sm text-slate-200">{label}</span>
                            <button
                                type="button"
                                role="switch"
                                onClick={() =>
                                    handleToggle(key as keyof typeof AVAILABLE_FEATURES)
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toggles[key as keyof typeof AVAILABLE_FEATURES]
                                    ? "bg-emerald-600"
                                    : "bg-slate-700"
                                    }`}
                                aria-checked={
                                    !!toggles[key as keyof typeof AVAILABLE_FEATURES]
                                }
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles[key as keyof typeof AVAILABLE_FEATURES]
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="h-4 w-4" />
                        )}
                        {isSaving ? "Saving..." : "Save Custom Access"}
                    </button>
                </div>
            </div>
        </div>
    );
}
