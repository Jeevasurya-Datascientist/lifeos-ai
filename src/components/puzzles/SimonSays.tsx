import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Radio, Play, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRewards } from "@/hooks/useGameRewards";

const COLORS = [
    { id: 0, color: "bg-red-500", active: "bg-red-400 shadow-[0_0_20px_rgba(248,113,113,0.8)]" },
    { id: 1, color: "bg-blue-500", active: "bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)]" },
    { id: 2, color: "bg-green-500", active: "bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]" },
    { id: 3, color: "bg-yellow-500", active: "bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]" }
];

export function SimonSays() {
    const { user } = useAuth();
    const { saveGameScore } = useGameRewards();
    const [sequence, setSequence] = useState<number[]>([]);
    const [playingIdx, setPlayingIdx] = useState(0); // Player's progress in current turn
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [activeBtn, setActiveBtn] = useState<number | null>(null);
    const [score, setScore] = useState(0); // Current level - 1
    const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'lost'>('idle');
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        loadHighScore();
    }, [user]);

    const loadHighScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'simon_says')
            .order('score', { ascending: false })
            .limit(1)
            .single();
        if (data) setHighScore(data.score);
    };

    const startGame = () => {
        setSequence([]);
        setScore(0);
        setGameStatus('playing');
        setIsPlayerTurn(false);
        addToSequence([]);
    };

    const addToSequence = (currentSeq: number[]) => {
        const nextColor = Math.floor(Math.random() * 4);
        const newSeq = [...currentSeq, nextColor];
        setSequence(newSeq);
        setPlayingIdx(0);
        setTimeout(() => playSequence(newSeq), 500);
    };

    const playSequence = async (seq: number[]) => {
        setIsPlayerTurn(false);
        for (let i = 0; i < seq.length; i++) {
            await flashButton(seq[i]);
            await new Promise(r => setTimeout(r, 300)); // Gap between flashes
        }
        setIsPlayerTurn(true);
    };

    const flashButton = (id: number) => {
        return new Promise<void>(resolve => {
            setActiveBtn(id);
            // Play sound here ideally
            setTimeout(() => {
                setActiveBtn(null);
                resolve();
            }, 400); // Flash duration
        });
    };

    const handleBtnClick = async (id: number) => {
        if (!isPlayerTurn || gameStatus !== 'playing') return;

        flashButton(id); // Visual feedback

        if (id === sequence[playingIdx]) {
            if (playingIdx === sequence.length - 1) {
                // Completed sequence
                setScore(s => s + 1);
                setIsPlayerTurn(false);
                setTimeout(() => addToSequence(sequence), 1000);
            } else {
                setPlayingIdx(i => i + 1);
            }
        } else {
            // Wrong
            setGameStatus('lost');
            if (score > highScore) setHighScore(score);
            saveScore(score);
        }
    };

    const saveScore = async (finalScore: number) => {
        // Rate 0.5: Level 10 = 5 Coins
        await saveGameScore('simon_says', finalScore, 0.5);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-purple-500" />
                        Simon Says
                    </div>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                        <span>Score: {score}</span>
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {highScore}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
                {gameStatus === 'idle' ? (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Repeat the pattern of lights. It gets longer every turn!</p>
                        <Button onClick={startGame} className="w-full">
                            <Play className="w-4 h-4 mr-2" /> Start Game
                        </Button>
                    </div>
                ) : gameStatus === 'lost' ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold text-red-500">Game Over</h3>
                        <p>You reached Level {score}</p>
                        <Button onClick={startGame}>Try Again</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 w-[240px] aspect-square">
                        {COLORS.map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleBtnClick(btn.id)}
                                className={`
                                    rounded-2xl transition-all duration-100 ease-in-out
                                    ${activeBtn === btn.id ? btn.active : btn.color}
                                    ${activeBtn === btn.id ? 'scale-95' : 'hover:opacity-90'}
                                `}
                            />
                        ))}
                    </div>
                )}
                {gameStatus === 'playing' && (
                    <div className="h-6 text-sm font-medium text-slate-500">
                        {isPlayerTurn ? "Your Turn" : "Watch..."}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
