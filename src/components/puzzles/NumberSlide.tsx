import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Grid3X3, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function NumberSlide() {
    const { user } = useAuth();
    // 3x3 grid, 0 represents the empty space
    const [grid, setGrid] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    const [isSolved, setIsSolved] = useState(false);
    const [wins, setWins] = useState(0);

    useEffect(() => {
        if (!user) return;
        const loadWins = async () => {
            const { count } = await supabase
                .from('brain_training_scores')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('game_type', 'number_slide');
            if (count !== null) setWins(count);
        };
        loadWins();
    }, [user]);

    const saveWin = async () => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'number_slide',
            score: 1, // 1 for win
            metadata: { date: new Date().toISOString() }
        });
        setWins(prev => prev + 1);
    };

    const checkWin = (currentGrid: number[]) => {
        const winning = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        return currentGrid.every((val, index) => val === winning[index]);
    };

    const shuffle = () => {
        // Simple shuffle ensuring validity is tricky, so we simulate random valid moves
        let tempGrid = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        let emptyIdx = 8;

        for (let i = 0; i < 100; i++) {
            const moves = getValidMoves(emptyIdx);
            const move = moves[Math.floor(Math.random() * moves.length)];

            // Swap
            tempGrid[emptyIdx] = tempGrid[move];
            tempGrid[move] = 0;
            emptyIdx = move;
        }
        setGrid(tempGrid);
        setIsSolved(false);
    };

    const getValidMoves = (emptyIndex: number) => {
        const moves = [];
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;

        if (row > 0) moves.push(emptyIndex - 3); // Up
        if (row < 2) moves.push(emptyIndex + 3); // Down
        if (col > 0) moves.push(emptyIndex - 1); // Left
        if (col < 2) moves.push(emptyIndex + 1); // Right
        return moves;
    };

    const handleMove = (index: number) => {
        if (isSolved) return;

        const emptyIndex = grid.indexOf(0);
        const validMoves = getValidMoves(emptyIndex);

        if (validMoves.includes(index)) {
            const newGrid = [...grid];
            newGrid[emptyIndex] = newGrid[index];
            newGrid[index] = 0;
            setGrid(newGrid);

            if (checkWin(newGrid)) {
                setIsSolved(true);
                saveWin();
            }
        }
    };

    useEffect(() => {
        // Shuffle on mount
        shuffle();
    }, []);

    return (
        <Card className="text-center h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-teal-500" />
                    Number Slide
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                    Solved: {wins} times
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-6">
                    {grid.map((num, i) => (
                        <button
                            key={i}
                            onClick={() => handleMove(i)}
                            className={`
                                h-16 w-16 text-xl font-bold rounded-lg transition-all
                                ${num === 0
                                    ? 'bg-transparent cursor-default'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm active:scale-95'
                                }
                                ${isSolved && num !== 0 ? 'bg-green-100 text-green-700' : ''}
                            `}
                        >
                            {num !== 0 ? num : ''}
                        </button>
                    ))}
                </div>

                {isSolved ? (
                    <div className="space-y-4">
                        <p className="text-green-600 font-bold">Solved! 🎉</p>
                        <Button onClick={shuffle} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                        </Button>
                    </div>
                ) : (
                    <Button onClick={shuffle} variant="ghost" size="sm" className="text-muted-foreground">
                        <RotateCcw className="w-4 h-4 mr-2" /> Shuffle
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
