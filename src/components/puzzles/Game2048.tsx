import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { awardPoints } from "@/lib/rewards";

export function Game2048() {
    const { user } = useAuth();
    const [board, setBoard] = useState<number[]>(Array(16).fill(0));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        loadHighScore();
    }, [user]);

    const loadHighScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', '2048')
            .order('score', { ascending: false })
            .limit(1)
            .single();
        if (data) setHighScore(data.score);
    };

    const initGame = () => {
        const newBoard = Array(16).fill(0);
        addTile(newBoard);
        addTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setHasWon(false);
    };

    const addTile = (currentBoard: number[]) => {
        const emptyIndices = currentBoard.map((val, idx) => val === 0 ? idx : -1).filter(idx => idx !== -1);
        if (emptyIndices.length === 0) return;
        const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        currentBoard[idx] = Math.random() < 0.9 ? 2 : 4;
    };

    // Logic for 2048 Movement
    const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (gameOver) return;

        let newBoard = [...board];
        let moved = false;
        let points = 0;

        const getRow = (r: number) => [r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3];
        const getCol = (c: number) => [c, c + 4, c + 8, c + 12];
        const lines = [];

        // Define lines based on direction
        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) lines.push(getRow(i));
        } else {
            for (let i = 0; i < 4; i++) lines.push(getCol(i));
        }

        for (const line of lines) {
            let values = line.map(idx => newBoard[idx]);
            if (direction === 'right' || direction === 'down') values.reverse();

            // Compress
            let compressed = values.filter(v => v !== 0);

            // Merge
            for (let i = 0; i < compressed.length - 1; i++) {
                if (compressed[i] === compressed[i + 1]) {
                    compressed[i] *= 2;
                    points += compressed[i];
                    compressed[i + 1] = 0;
                }
            }

            // Re-compress after merge
            compressed = compressed.filter(v => v !== 0);

            // Pad with zeros
            while (compressed.length < 4) compressed.push(0);

            if (direction === 'right' || direction === 'down') compressed.reverse();

            // Check if changed
            for (let i = 0; i < 4; i++) {
                if (newBoard[line[i]] !== compressed[i]) {
                    newBoard[line[i]] = compressed[i];
                    moved = true;
                }
            }
        }

        if (moved) {
            addTile(newBoard);
            setBoard(newBoard);
            setScore(s => {
                const newScore = s + points;
                if (newScore > highScore) setHighScore(newScore);
                return newScore;
            });
            checkGameOver(newBoard);

            // Check for Win (2048 Tile)
            if (newBoard.includes(2048) && !hasWon && user) {
                setHasWon(true);
                awardPoints(user.id, 50, "Reached 2048 Tile! 🧠");
            }
        }
    }, [board, gameOver, highScore]);

    // Handle Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") { e.preventDefault(); move('up'); }
            if (e.key === "ArrowDown") { e.preventDefault(); move('down'); }
            if (e.key === "ArrowLeft") { e.preventDefault(); move('left'); }
            if (e.key === "ArrowRight") { e.preventDefault(); move('right'); }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [move]);

    const checkGameOver = async (currentBoard: number[]) => {
        // Init logic already handles full board?
        if (!currentBoard.includes(0)) {
            // Check for possible merges
            let canMove = false;
            for (let i = 0; i < 16; i++) {
                // Check right
                if (i % 4 !== 3 && currentBoard[i] === currentBoard[i + 1]) canMove = true;
                // Check down
                if (i < 12 && currentBoard[i] === currentBoard[i + 4]) canMove = true;
            }
            if (!canMove) {
                setGameOver(true);
                saveScore(score);
            }
        }
    };

    const saveScore = async (finalScore: number) => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: '2048',
            score: finalScore,
            metadata: { date: new Date().toISOString() }
        });
    };

    // Check for 2048 tile win
    useEffect(() => {
        if (board.includes(2048) && !gameOver) {
            // Optional: only if not already awarded in this session? 
            // For now, simpler: user gets points if they hit 2048. 
            // But valid moves might keep 2048 on board. 
            // Let's award on GAME OVER if they have 2048, or exactly when it appears?
            // Better: Game Over check is safest or a specific "hasWon" flag.
        }
    }, [board, gameOver]);

    // Better place: inside move function or checkGameOver


    // Colors for tiles
    const getTileColor = (val: number) => {
        switch (val) {
            case 2: return "bg-gray-100 text-gray-800";
            case 4: return "bg-orange-100 text-orange-800";
            case 8: return "bg-orange-200 text-orange-800";
            case 16: return "bg-orange-300 text-orange-900";
            case 32: return "bg-orange-400 text-white";
            case 64: return "bg-orange-500 text-white";
            case 128: return "bg-yellow-400 text-white";
            case 256: return "bg-yellow-500 text-white shadow-lg";
            case 512: return "bg-yellow-600 text-white shadow-lg";
            case 1024: return "bg-yellow-700 text-white shadow-xl";
            case 2048: return "bg-yellow-800 text-white shadow-xl border-2 border-yellow-400";
            default: return "bg-gray-200";
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-500 text-white rounded px-1.5 py-0.5 text-sm font-bold">2048</span>
                        Goal: 2048
                    </div>
                    <div className="flex flex-col items-end text-sm font-normal text-muted-foreground">
                        <span>Score: <span className="font-bold text-foreground">{score}</span></span>
                        <span className="text-xs">High: {highScore}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="relative bg-gray-300 p-2 rounded-xl">
                    <div className="grid grid-cols-4 gap-2 w-[280px] h-[280px]">
                        {board.map((val, i) => (
                            <div
                                key={i}
                                className={`
                                    rounded-lg flex items-center justify-center font-bold text-2xl transition-all duration-100
                                    ${val === 0 ? "bg-gray-200" : getTileColor(val)}
                                `}
                            >
                                {val !== 0 && val}
                            </div>
                        ))}
                    </div>
                    {gameOver && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                            <h3 className="text-3xl font-bold mb-2">Game Over</h3>
                            <Button onClick={initGame}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
                        </div>
                    )}
                </div>

                {/* Mobile controls */}
                <div className="md:hidden grid grid-cols-3 gap-2">
                    <div></div>
                    <Button variant="outline" size="icon" onClick={() => move('up')}><ArrowUp /></Button>
                    <div></div>
                    <Button variant="outline" size="icon" onClick={() => move('left')}><ArrowLeft /></Button>
                    <Button variant="outline" size="icon" onClick={() => move('down')}><ArrowDown /></Button>
                    <Button variant="outline" size="icon" onClick={() => move('right')}><ArrowRight /></Button>
                </div>

                <div className="hidden md:flex gap-4 text-xs text-muted-foreground">
                    Use Arrow Keys to Move
                    <Button variant="ghost" size="sm" className="h-6" onClick={initGame}><RefreshCw className="mr-1 h-3 w-3" /> Restart</Button>
                </div>
            </CardContent>
        </Card>
    );
}
