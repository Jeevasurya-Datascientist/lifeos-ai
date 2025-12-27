import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, RefreshCcw, X, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Player = 'X' | 'O' | null;
type Winner = 'X' | 'O' | 'DRAW' | null;

export function TicTacToe() {
    const { user } = useAuth();
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true); // User is always X (starts first mostly, or alternating)
    const [winner, setWinner] = useState<Winner>(null);
    const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
    const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
    const [isAiThinking, setIsAiThinking] = useState(false);

    // Load stats (optional, maybe just session stats for now for simplicity, or load from DB if we tracked it)
    // For now, let's just keep session stats for simplicity unless requested. 
    // Actually, let's load total wins from DB to be consistent with other games using 'score' as wins.

    useEffect(() => {
        loadHighScore();
    }, [user]);

    const loadHighScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'tictactoe_wins')
            .order('score', { ascending: false })
            .limit(1)
            .single();
        if (data) setScore(prev => ({ ...prev, wins: data.score ?? 0 }));
    };

    const saveWin = async () => {
        if (!user) return;
        const newWins = score.wins + 1;
        setScore(prev => ({ ...prev, wins: newWins }));

        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'tictactoe_wins',
            score: newWins, // Cumulative wins as "score" for leaderboard
            metadata: { date: new Date().toISOString() }
        });
    };

    const checkWinner = (squares: Player[]): Winner => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a] as Winner;
            }
        }
        return squares.every(sq => sq !== null) ? 'DRAW' : null;
    };

    const handleClick = (i: number) => {
        if (board[i] || winner || isAiThinking) return;

        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);

        const win = checkWinner(newBoard);
        if (win) {
            handleGameEnd(win);
        } else {
            setIsXNext(false);
            setIsAiThinking(true);
            setTimeout(() => makeAiMove(newBoard), 500); // Small delay for realism
        }
    };

    const makeAiMove = (currentBoard: Player[]) => {
        let moveIndex = -1;

        if (difficulty === 'easy') {
            // Random move
            const available = currentBoard.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
            if (available.length > 0) {
                moveIndex = available[Math.floor(Math.random() * available.length)];
            }
        } else {
            // Minimax (Impossible AI)
            moveIndex = getBestMove(currentBoard);
        }

        if (moveIndex !== -1) {
            const newBoard = [...currentBoard];
            newBoard[moveIndex] = 'O';
            setBoard(newBoard);

            const win = checkWinner(newBoard);
            if (win) {
                handleGameEnd(win);
            } else {
                setIsXNext(true);
            }
        }
        setIsAiThinking(false);
    };

    const handleGameEnd = (result: Winner) => {
        setWinner(result);
        if (result === 'X') {
            saveWin();
        } else if (result === 'O') {
            setScore(prev => ({ ...prev, losses: prev.losses + 1 }));
        } else {
            setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsXNext(true);
        setIsAiThinking(false);
    };

    // --- Minimax Logic ---
    const getBestMove = (squares: Player[]): number => {
        let bestScore = -Infinity;
        let move = -1;

        // Loop through available spots
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = 'O';
                const score = minimax(squares, 0, false);
                squares[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    };

    const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
        const result = checkWinner(squares);
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'DRAW') return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'O';
                    const score = minimax(squares, depth + 1, false);
                    squares[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'X';
                    const score = minimax(squares, depth + 1, true);
                    squares[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⭕</span>
                        Tic Tac Toe
                    </div>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> Wins: {score.wins}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-6 p-0">

                {/* Status / Turn Indicator */}
                <div className="flex items-center gap-2 mb-2">
                    {winner ? (
                        <div className={cn(
                            "text-xl font-bold px-4 py-2 rounded-full",
                            winner === 'X' ? "bg-green-500/20 text-green-500" :
                                winner === 'O' ? "bg-red-500/20 text-red-500" :
                                    "bg-yellow-500/20 text-yellow-500"
                        )}>
                            {winner === 'X' ? 'You Won! 🎉' : winner === 'O' ? 'AI Won 🤖' : 'Draw 🤝'}
                        </div>
                    ) : (
                        <div className="text-lg text-muted-foreground flex items-center gap-2">
                            {isAiThinking ? (
                                <span className="animate-pulse">AI thinking...</span>
                            ) : (
                                <span>Your Turn (X)</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-3 gap-2 bg-secondary/50 p-2 rounded-xl">
                    {board.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            disabled={!!cell || !!winner || isAiThinking}
                            className={cn(
                                "w-20 h-20 sm:w-24 sm:h-24 bg-card rounded-lg flex items-center justify-center text-4xl shadow-sm transition-all hover:bg-card/80 disabled:hover:bg-card",
                                !cell && !winner && "hover:scale-[0.98]",
                                cell === 'X' ? "text-blue-500" : "text-rose-500"
                            )}
                        >
                            {cell === 'X' && <X className="w-12 h-12" strokeWidth={2.5} />}
                            {cell === 'O' && <Circle className="w-10 h-10" strokeWidth={3} />}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 items-center">
                    <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
                        <Button
                            variant={difficulty === 'easy' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setDifficulty('easy'); resetGame(); }}
                            className="text-xs"
                        >
                            Easy
                        </Button>
                        <Button
                            variant={difficulty === 'hard' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => { setDifficulty('hard'); resetGame(); }}
                            className="text-xs"
                        >
                            Hard
                        </Button>
                    </div>

                    <Button onClick={resetGame} variant="outline" size="sm" className="gap-2">
                        <RefreshCcw className="w-3 h-3" /> Reset
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
