import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const awardPoints = async (userId: string, points: number, reason: string) => {
    try {
        // 1. Fetch current points
        const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", userId)
            .single();

        if (fetchError) throw fetchError;

        const currentPoints = profile?.points || 0;
        const newPoints = currentPoints + points;

        // 2. Update points
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ points: newPoints })
            .eq("id", userId);

        if (updateError) throw updateError;

        // 3. Rate Limit / Anti-Cheat (Optional for now, but good practice)
        // We could log this transaction in a 'points_history' table if we had one.

        // 4. Show Success Toast
        toast.success(`🏆 +${points} Points!`, {
            description: reason,
            duration: 3000,
        });

        return { success: true, newPoints };

    } catch (error) {
        console.error("Error awarding points:", error);
        toast.error("Failed to save progress");
        return { success: false };
    }
};
