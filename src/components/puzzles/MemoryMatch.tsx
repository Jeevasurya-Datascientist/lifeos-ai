import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, Star, Heart, Zap, Award, Smile, Sun, Cloud, Moon, Gamepad2, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const ICONS = [Star, Heart, Zap, Award, Smile, Sun, Cloud, Moon];

export function MemoryMatch() {
    const { user } = useAuth();
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [bestMoves, setBestMoves] = useState<number | null>(null);

    // Initialize Game
    useEffect(() => {
        loadBestScore();
    }, [user]); // Reload when user is available

    useEffect(() => {
        startNewGame();
    }, []);

    const loadBestScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'memory_match')
            .order('score', { ascending: true }) // Lower moves is better
            .limit(1)
            .single();
        if (data) setBestMoves(data.score);
    };

    const startNewGame = () => {
        const duplicatedIcons = [...ICONS, ...ICONS];
        const shuffled = duplicatedIcons
            .sort(() => Math.random() - 0.5)
            .map((Icon, index) => ({ id: index, Icon }));

        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setIsWon(false);
    };

    const handleCardClick = (id: number) => {
        if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            if (cards[first].Icon === cards[second].Icon) {
                setSolved(prev => [...prev, first, second]);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    useEffect(() => {
        if (cards.length > 0 && solved.length === cards.length) {
            setIsWon(true);
            saveScore(moves);
            if (bestMoves === null || moves < bestMoves) setBestMoves(moves);
        }
    }, [solved]);

    const saveScore = async (finalMoves: number) => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'memory_match',
            score: finalMoves, // Lower is better
            metadata: { date: new Date().toISOString() }
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-pink-500" />
                        Memory Match
                    </div>
                    {bestMoves && <div className="text-sm font-normal text-muted-foreground flex items-center gap-1"><Trophy className="w-3 h-3" /> Best: {bestMoves}</div>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
                {isWon ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold text-green-600">You Won! 🎉</h3>
                        <p>Moves: {moves}</p>
                        <Button onClick={startNewGame}>Play Again</Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {cards.map((card) => {
                                const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                                return (
                                    <button
                                        key={card.id}
                                        onClick={() => handleCardClick(card.id)}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center transition-all duration-300
                                            ${isFlipped
                                                ? "bg-pink-100 border-2 border-pink-300"
                                                : "bg-slate-800 text-slate-800 hover:bg-slate-700" // Face down
                                            }
                                        `}
                                        disabled={isFlipped}
                                    >
                                        {isFlipped && <card.Icon className="w-6 h-6 text-pink-500" />}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Moves: {moves}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
