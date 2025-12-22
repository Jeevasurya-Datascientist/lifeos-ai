import { useState, useEffect } from "react";
import { Check, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const HABITS = [
    { id: "meditation", label: "Meditation (15m)", icon: "🧘" },
    { id: "reading", label: "Reading (30m)", icon: "📖" },
    { id: "no_sugar", label: "No Sugar", icon: "🚫" },
    { id: "gym", label: "Gym / Workout", icon: "💪" }
];

export function HabitTracker() {
    const { user } = useAuth();
    const [completedHabits, setCompletedHabits] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!user) return;

        const fetchHabits = async () => {
            const { data } = await supabase
                .from("wellness_entries")
                .select("metadata")
                .eq("user_id", user.id)
                .eq("type", "habit")
                .eq("date", today);

            if (data) {
                // Extract habit IDs from metadata
                const completed = data.map(entry => entry.metadata.habit_id);
                setCompletedHabits(completed);
            }
            setLoading(false);
        };

        fetchHabits();
    }, [user, today]);

    const toggleHabit = async (habitId: string) => {
        if (!user) {
            toast.error("Please login to track habits.");
            return;
        }

        const isCompleted = completedHabits.includes(habitId);

        // Optimistic Update
        let newCompleted;
        if (isCompleted) {
            newCompleted = completedHabits.filter(id => id !== habitId);
            setCompletedHabits(newCompleted);
            toast.info("Habit unchecked.");

            // Remove from DB
            // Note: This relies on Supabase potentially storing duplicates if we clicked multiple times unless we handle IDs. 
            // Ideally we delete by user_id, date, type, and specific metadata.
            // Since our schema is generic, deleting exactly might require fetching the ID first or using a specific stored procedure.
            // For MVP simplicity: We'll delete *all* entries for this habit today (safe assumption: you do it once).
            const { error } = await supabase
                .from("wellness_entries")
                .delete()
                .eq("user_id", user.id)
                .eq("type", "habit")
                .eq("date", today)
                .contains("metadata", { habit_id: habitId });

            if (error) console.error("Error removing habit:", error);

        } else {
            newCompleted = [...completedHabits, habitId];
            setCompletedHabits(newCompleted);
            toast.success("Habit completed! Keep it up!");

            // Add to DB
            const { error } = await supabase
                .from("wellness_entries")
                .insert({
                    user_id: user.id,
                    type: "habit",
                    value: 1, // Represents 'completed'
                    date: today,
                    metadata: { habit_id: habitId, label: HABITS.find(h => h.id === habitId)?.label }
                });

            if (error) {
                console.error("Error saving habit:", error);
                toast.error("Failed to save to cloud.");
                setCompletedHabits(completedHabits); // Revert
            }
        }
    };

    const completionRate = Math.round((completedHabits.length / HABITS.length) * 100);

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                    <Flame className={cn("w-5 h-5", completionRate === 100 ? "text-orange-500 fill-orange-500" : "text-slate-400")} />
                    Daily Habits
                </h3>
                {completionRate === 100 && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                        <Trophy className="w-3 h-3" /> All Done!
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {HABITS.map((habit) => {
                    const isDone = completedHabits.includes(habit.id);
                    return (
                        <button
                            key={habit.id}
                            onClick={() => toggleHabit(habit.id)}
                            disabled={loading}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium",
                                isDone
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 transform scale-105"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                            )}
                        >
                            <span>{habit.icon}</span>
                            <span>{habit.label}</span>
                            {isDone && <Check className="w-4 h-4 ml-1" />}
                        </button>
                    );
                })}
            </div>

            {/* Progress Bar Mini */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                />
            </div>
            <p className="text-xs text-center text-slate-400">
                {completionRate === 0 ? "Let's get started!" : completionRate === 100 ? "Perfect day!" : `${completedHabits.length}/${HABITS.length} completed`}
            </p>
        </div>
    );
}
