import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings, Trash2, Palette, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Available themes
const THEMES = [
    { id: 'default', name: 'Default (Violet)', start: 'from-violet-600', end: 'to-fuchsia-600' },
    { id: 'ocean', name: 'Ocean (Blue)', start: 'from-blue-600', end: 'to-cyan-600' },
    { id: 'sunset', name: 'Sunset (Orange)', start: 'from-orange-500', end: 'to-red-500' },
    { id: 'forest', name: 'Forest (Green)', start: 'from-emerald-600', end: 'to-teal-600' },
];

interface BrainTrainingSettingsProps {
    currentTheme: string;
    onThemeChange: (themeId: string) => void;
}

export function BrainTrainingSettings({ currentTheme, onThemeChange }: BrainTrainingSettingsProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (!user) return;
        setIsResetting(true);
        try {
            const { error } = await supabase
                .from('brain_training_scores')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success("All game data has been reset.");
            setOpen(false);
            // Ideally trigger a refresh in parent, but component reload works too
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to reset data.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5 text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Brain Gym Settings</DialogTitle>
                    <DialogDescription>
                        Customize your experience or manage your data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Theme Selector */}
                    <div className="space-y-3">
                        <Label>Theme</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => onThemeChange(theme.id)}
                                    className={`
                                        flex items-center gap-2 p-2 rounded-lg border-2 transition-all
                                        ${currentTheme === theme.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-slate-50"}
                                    `}
                                >
                                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.start} ${theme.end}`} />
                                    <span className="text-sm font-medium">{theme.name}</span>
                                    {currentTheme === theme.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Danger Zone
                        </h4>
                        <div className="bg-red-50 p-3 rounded-lg space-y-3">
                            <p className="text-xs text-red-600/80">
                                This will permanently delete all your high scores and progress history from the Brain Gym. This action cannot be undone.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={handleReset}
                                disabled={isResetting}
                            >
                                {isResetting ? "Resetting..." : "Reset All Game Data"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export const getThemeGradient = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    return theme ? `bg-gradient-to-r ${theme.start} ${theme.end}` : THEMES[0].start; // Fallback
};
