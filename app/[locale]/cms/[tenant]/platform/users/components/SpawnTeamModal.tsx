import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, LayoutDashboard, Loader2 } from "lucide-react"

export function SpawnTeamModal({
    isOpen,
    onClose,
    user,
    onSubmit
}: {
    isOpen: boolean
    onClose: () => void
    user: any
    onSubmit: (data: { teamName: string; slug: string; resetPassword?: string }) => void
}) {
    const [teamName, setTeamName] = useState("")
    const [slug, setSlug] = useState("")
    const [resetPassword, setResetPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await onSubmit({ teamName, slug, resetPassword })
        setLoading(false)
    }

    // Auto-generate slug suggestion
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTeamName(val)
        if (!slug || slug === teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0B] border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <LayoutDashboard className="h-5 w-5 text-blue-400" />
                        Spawn Workspace
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create a new tenant workspace and transfer owner rights to <span className="text-white font-medium">{user?.name || user?.email}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="teamName" className="text-slate-300">Workspace Name *</Label>
                        <Input
                            id="teamName"
                            value={teamName}
                            onChange={handleNameChange}
                            placeholder="e.g. Acme Corp"
                            className="bg-black/50 border-white/10 text-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug" className="text-slate-300">Tenant Slug</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="acme-corp"
                            className="bg-black/50 border-white/10 text-white font-mono text-sm"
                        />
                        <p className="text-[10px] text-slate-500">Leaving this empty will auto-generate a secure random slug.</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <Label htmlFor="resetPassword" className="text-slate-300">Override Password (Optional)</Label>
                        <Input
                            id="resetPassword"
                            type="password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder="Enter a new secure password"
                            className="bg-black/50 border-white/10 text-white"
                        />
                        <p className="text-[10px] text-yellow-500/80 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" /> Provide to manually reset the user database credentials.
                        </p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!teamName || loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Spawn Workspace"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
