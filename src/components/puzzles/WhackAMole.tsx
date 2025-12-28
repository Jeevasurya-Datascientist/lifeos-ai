import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Trophy, Play, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRewards } from "@/hooks/useGameRewards";
import { toast } from "sonner";

export function WhackAMole() {
    const { user } = useAuth();
    const { saveGameScore } = useGameRewards();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
    const [activeMole, setActiveMole] = useState<number | null>(null);

    // Game loop ref
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setMoles(Array(9).fill(false));
        nextMole();

        // Timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    gameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const nextMole = () => {
        if (!isPlaying && timeLeft <= 0) return; // Safety check

        // Clear previous
        setMoles(Array(9).fill(false));
        setActiveMole(null);

        // Random delay before pop up
        const delay = Math.random() * 500 + 200; // 200-700ms gap

        timeoutRef.current = setTimeout(() => {
            if (timeLeft <= 0) return;

            const newIndex = Math.floor(Math.random() * 9);
            setActiveMole(newIndex);

            const newMoles = Array(9).fill(false);
            newMoles[newIndex] = true;
            setMoles(newMoles);

            // Hide after some time if not clicked
            const hideTime = Math.max(500, 1000 - score * 10); // Gets faster

            timeoutRef.current = setTimeout(() => {
                nextMole();
            }, hideTime);

        }, delay);
    };

    const handleWhack = (index: number) => {
        if (!isPlaying || index !== activeMole) return;

        // Success!
        setScore(s => s + 10);
        setActiveMole(null); // Hide immediately
        setMoles(Array(9).fill(false));

        // Trigger next immediately
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        nextMole();
    };

    const gameOver = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        saveScore();
    };

    const saveScore = async () => {
        // Rate 0.2: 100 score = 20 coins
        await saveGameScore('whack-a-mole', score, 0.2);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Hammer className="w-5 h-5 text-amber-600" />
                        Whack-a-Mole
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`} />
                            <span className="font-mono font-bold text-lg">{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-mono font-bold text-lg">{score} points</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-4">

                {!isPlaying ? (
                    <div className="text-center space-y-4">
                        {score > 0 ? (
                            <>
                                <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                                <p className="text-lg text-muted-foreground mb-4">Final Score: {score}</p>
                            </>
                        ) : (
                            <p className="text-lg text-muted-foreground mb-4">Hit the lighted circles as fast as you can!</p>
                        )}
                        <Button size="lg" onClick={startGame} className="gap-2 bg-amber-600 hover:bg-amber-700">
                            <Play className="w-4 h-4" />
                            {score > 0 ? "Play Again" : "Start Game"}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 w-full max-w-md aspect-square">
                        {moles.map((isActive, i) => (
                            <button
                                key={i}
                                onPointerDown={(e) => { e.preventDefault(); handleWhack(i); }} // fast response
                                className={cn(
                                    "w-full h-full rounded-2xl transition-all duration-75 relative overflow-hidden shadow-inner",
                                    "bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700",
                                    isActive && "cursor-pointer"
                                )}
                            >
                                <div
                                    className={cn(
                                        "absolute inset-0 flex items-center justify-center transition-all duration-100 transform translate-y-full",
                                        isActive && "translate-y-0"
                                    )}
                                >
                                    {/* Mole visual */}
                                    <div className="w-3/4 h-3/4 bg-amber-500 rounded-full border-4 border-amber-700 shadow-xl relative">
                                        {/* EYES */}
                                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-black rounded-full" />
                                        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-black rounded-full" />
                                        {/* NOSE */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-3 bg-pink-300 rounded-full" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
