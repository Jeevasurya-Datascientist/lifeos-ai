import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useCallback } from "react";

export function useGameRewards() {
    const { user, refreshProfile } = useAuth();

    const saveGameScore = useCallback(async (gameId: string, score: number, conversionRate: number = 0.2) => {
        if (!user) return;

        try {
            // 1. Save Score History / High Score logic
            // We'll just insert every game for now, can be optimized later to only top scores
            const { error: scoreError } = await supabase.from('brain_training_scores').insert({
                user_id: user.id,
                game_type: gameId,
                score: score,
                metadata: { date: new Date().toISOString() }
            });

            if (scoreError) {
                console.error("Error saving score:", scoreError);
                return;
            }

            // 2. Award Coins
            // Default rate 0.2 means 1 coin per 5 points.
            // Ensure at least 1 coin if score is sufficient, but 0 if score is too low.
            const coinsEarned = Math.floor(score * conversionRate);

            if (coinsEarned > 0) {
                const { error: rewardError } = await supabase.from('user_rewards').insert({
                    user_id: user.id,
                    amount: coinsEarned,
                    source: `game_${gameId}`,
                    description: `Scored ${score} in ${gameId}`
                });

                if (!rewardError) {
                    toast.success(`+${coinsEarned} Coins Earned! 🪙`, {
                        description: `Great job! You scored ${score}.`,
                        duration: 3000,
                    });
                    // Refresh global profile state
                    await refreshProfile();
                }
            }
        } catch (error) {
            console.error("Unexpected error in saveGameScore:", error);
        }
    }, [user, refreshProfile]);

    return { saveGameScore };
}
