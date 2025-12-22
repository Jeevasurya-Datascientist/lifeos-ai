import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Smile, Frown, Meh, Sun, CloudRain } from "lucide-react";
import { getMoodFeedback } from "@/lib/aiService";

const MOODS = [
    { value: 1, label: "Stressed", icon: CloudRain, color: "text-red-500", bg: "bg-red-50", feedback: "Take a deep breath." },
    { value: 2, label: "Sad", icon: Frown, color: "text-orange-500", bg: "bg-orange-50", feedback: "Be kind to yourself." },
    { value: 3, label: "Calm", icon: Meh, color: "text-blue-500", bg: "bg-blue-50", feedback: "Enjoy the peace." },
    { value: 4, label: "Good", icon: Smile, color: "text-teal-500", bg: "bg-teal-50", feedback: "Keep it up!" },
    { value: 5, label: "Energetic", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50", feedback: "You're on fire!" },
];

export function MoodTracker() {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleMoodSelect = async (moodValue: number) => {
        if (!user || isSubmitting) return;

        setIsSubmitting(true);
        setSelectedMood(moodValue);
        setFeedback(null);

        const mood = MOODS.find(m => m.value === moodValue);

        try {
            // 1. Log to DB
            const { error } = await supabase
                .from("wellness_entries")
                .insert({
                    user_id: user.id,
                    type: "mood",
                    value: moodValue,
                    metadata: { label: mood?.label }
                });

            if (error) throw error;
            toast.success("Mood logged!");

            // 2. Get AI Feedback
            const userName = user?.user_metadata?.full_name || "friend";
            const aiResponse = await getMoodFeedback(mood?.label || "Neutral", userName);
            setFeedback(aiResponse);

        } catch (error: any) {
            console.error("Error logging mood:", error);
            toast.error(`Failed to log mood: ${error.message || "Unknown error"}`);
            setFeedback(mood?.feedback || "Stay positive!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-slate-800">Morning Check-in</h3>
                    <p className="text-sm text-slate-500">How are you feeling right now?</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;

                    return (
                        <button
                            key={mood.value}
                            onClick={() => handleMoodSelect(mood.value)}
                            disabled={isSubmitting}
                            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all w-full
                                ${isSelected ? `${mood.bg} ring-2 ring-offset-2 ring-${mood.color.split('-')[1]}-400` : 'hover:bg-slate-50'}
                            `}
                        >
                            <div className={`p-2 rounded-full ${mood.bg} w-10 h-10 flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${mood.color} ${isSelected ? 'animate-bounce' : ''}`} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium truncate w-full text-center ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                {mood.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {feedback && (
                <div className="mt-6 p-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                    <span className="font-semibold">LifeOS AI:</span> {feedback}
                </div>
            )}
        </div>
    );
}
