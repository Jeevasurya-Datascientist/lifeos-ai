import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Grid, Trophy, Play, RefreshCw, Timer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function SchulteTable() {
    const { user } = useAuth();
    const [grid, setGrid] = useState<number[]>([]);
    const [nextNum, setNextNum] = useState(1);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [size] = useState(5); // 5x5 Grid

    useEffect(() => {
        loadBestTime();
    }, [user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && startTime) {
            interval = setInterval(() => {
                setTimeElapsed((Date.now() - startTime) / 1000);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, startTime]);

    const loadBestTime = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'schulte_table')
            .order('score', { ascending: true }) // Lower time is better
            .limit(1)
            .single();
        if (data) setBestTime(data.score / 1000); // Store in ms, display in s
    };

    const startGame = () => {
        const nums = Array.from({ length: size * size }, (_, i) => i + 1);
        // Fisher-Yates shuffle
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        setGrid(nums);
        setNextNum(1);
        setTimeElapsed(0);
        setStartTime(Date.now());
        setIsPlaying(true);
    };

    const [wrongBtn, setWrongBtn] = useState<number | null>(null);


    const handleClick = (num: number) => {
        if (!isPlaying) return;

        if (num === nextNum) {
            if (num === size * size) {
                endGame();
            } else {
                setNextNum(n => n + 1);
            }
        } else {
            // Wrong click
            setWrongBtn(num);
            setTimeout(() => setWrongBtn(null), 300);
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        const finalTime = Date.now() - (startTime || 0); // ms
        setTimeElapsed(finalTime / 1000);

        if (bestTime === null || finalTime / 1000 < bestTime) {
            setBestTime(finalTime / 1000);
        }
        saveScore(finalTime);
    };

    const saveScore = async (ms: number) => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'schulte_table',
            score: ms, // Store milliseconds
            metadata: { date: new Date().toISOString() }
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Grid className="w-5 h-5 text-indigo-500" />
                        Schulte Table
                    </div>
                    {bestTime && (
                        <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Best: {bestTime.toFixed(2)}s
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                {!isPlaying && grid.length === 0 ? (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Find numbers 1 to 25 in ascending order as fast as you can. Keep your eyes on the center!</p>
                        <Button onClick={startGame} className="w-full">
                            <Play className="w-4 h-4 mr-2" /> Start Test
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between w-full max-w-[300px] text-sm font-mono">
                            <span>Next: <span className="font-bold text-lg">{nextNum <= 25 ? nextNum : 'Done'}</span></span>
                            <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {timeElapsed.toFixed(1)}s</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2 bg-slate-100 p-2 rounded-lg">
                            {grid.map((num) => {
                                const isClicked = num < nextNum;
                                return (
                                    <button
                                        key={num}
                                        onMouseDown={(e) => { e.preventDefault(); handleClick(num); }}
                                        className={`
                                            w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg font-bold rounded shadow-sm transition-all
                                            ${isClicked
                                                ? "bg-indigo-100 text-indigo-300 scale-95"
                                                : "bg-white hover:bg-indigo-50 text-slate-800 active:scale-90"
                                            }
                                        `}
                                        disabled={!isPlaying || isClicked}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        {!isPlaying && grid.length > 0 && (
                            <div className="text-center">
                                <p className="font-bold text-green-600 mb-2">Detailed Attention Focus!</p>
                                <Button size="sm" onClick={startGame} variant="outline">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
