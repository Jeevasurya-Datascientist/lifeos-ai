import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Coordinate = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2; // ms decrease per food eaten

export function SnakeGame() {
    const { user } = useAuth();
    const [snake, setSnake] = useState<Coordinate[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Coordinate>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const directionRef = useRef<Direction>('RIGHT'); // Ref to avoid closure stale state in interval
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load of high score
    useEffect(() => {
        loadHighScore();
    }, [user]);

    const loadHighScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'snake')
            .order('score', { ascending: false })
            .limit(1)
            .single();
        if (data) setHighScore(data.score ?? 0);
    };

    const saveScore = async (finalScore: number) => {
        if (!user) return;

        // 1. Save High Score
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'snake',
            score: finalScore,
            metadata: { date: new Date().toISOString() }
        });

        if (finalScore > highScore) {
            setHighScore(finalScore);
        }

        // 2. Award Coins (Rewards System)
        // 1 Coin per 5 points
        const coinsEarned = Math.floor(finalScore / 5);
        if (coinsEarned > 0) {
            const { error } = await supabase.from('user_rewards').insert({
                user_id: user.id,
                amount: coinsEarned,
                source: 'game_snake',
                description: `Scored ${finalScore} in Snake`
            });

            if (!error) {
                toast.success(`+${coinsEarned} Coins Earned! 🪙`, {
                    description: "Great job! Keep playing to earn more.",
                    duration: 3000,
                });
            }
        }
    };

    const generateFood = useCallback((): Coordinate => {
        return {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    }, []);

    const startGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        setDirection('RIGHT');
        directionRef.current = 'RIGHT';
        setScore(0);
        setSpeed(INITIAL_SPEED);
        setIsGameOver(false);
        setIsPlaying(true);
    };

    const gameOver = () => {
        setIsPlaying(false);
        setIsGameOver(true);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        saveScore(score);
    };

    const moveSnake = useCallback(() => {
        if (isGameOver) return;

        setSnake(prevSnake => {
            const head = prevSnake[0];
            const newHead = { ...head };

            switch (directionRef.current) {
                case 'UP': newHead.y -= 1; break;
                case 'DOWN': newHead.y += 1; break;
                case 'LEFT': newHead.x -= 1; break;
                case 'RIGHT': newHead.x += 1; break;
            }

            // Check collision with walls
            if (
                newHead.x < 0 ||
                newHead.x >= GRID_SIZE ||
                newHead.y < 0 ||
                newHead.y >= GRID_SIZE
            ) {
                gameOver();
                return prevSnake;
            }

            // Check collision with self
            if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                gameOver();
                return prevSnake;
            }

            const newSnake = [newHead, ...prevSnake];

            // Check collision with food
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 1);
                setFood(generateFood());
                setSpeed(s => Math.max(50, s - SPEED_INCREMENT));
                // Don't pop the tail, so it grows
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [food, generateFood, isGameOver]);

    // Game Loop
    useEffect(() => {
        if (isPlaying && !isGameOver) {
            gameLoopRef.current = setInterval(moveSnake, speed);
        } else {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, isGameOver, moveSnake, speed]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying) return;
            switch (e.key) {
                case 'ArrowUp':
                    if (directionRef.current !== 'DOWN') changeDirection('UP');
                    break;
                case 'ArrowDown':
                    if (directionRef.current !== 'UP') changeDirection('DOWN');
                    break;
                case 'ArrowLeft':
                    if (directionRef.current !== 'RIGHT') changeDirection('LEFT');
                    break;
                case 'ArrowRight':
                    if (directionRef.current !== 'LEFT') changeDirection('RIGHT');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);

    const changeDirection = (newDir: Direction) => {
        setDirection(newDir);
        directionRef.current = newDir;
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🐍</span>
                        Classic Snake
                    </div>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-4">
                        <span className="font-mono text-lg font-bold text-primary">Score: {score}</span>
                        <span className="flex items-center gap-1 text-xs"><Trophy className="w-3 h-3 text-yellow-500" /> {highScore}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-0 gap-4">

                {/* Game Board */}
                <div
                    className="relative bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden"
                    style={{
                        width: 'min(100%, 450px)',
                        aspectRatio: '1/1',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                    }}
                >
                    {!isPlaying && !isGameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                            <Button onClick={startGame} size="lg" className="gap-2">
                                <Play className="w-5 h-5" /> Start Game
                            </Button>
                            <p className="mt-4 text-sm text-muted-foreground">Use Arrow Keys to Move</p>
                        </div>
                    )}

                    {isGameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                            <h3 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h3>
                            <p className="text-lg mb-6">Score: {score}</p>
                            <Button onClick={startGame} variant="outline" className="gap-2">
                                <RotateCcw className="w-4 h-4" /> Play Again
                            </Button>
                        </div>
                    )}

                    {/* Render Grid Cells purely for logic, but visually we just render items */}
                    {/* Actually, grid layout is better for exact positioning */}
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);

                        const isSnakeHead = snake[0].x === x && snake[0].y === y;
                        const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
                        const isFood = food.x === x && food.y === y;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "w-full h-full transition-all duration-75",
                                    isSnakeHead && "bg-green-500 rounded-sm z-10",
                                    isSnakeBody && "bg-green-500/70 rounded-sm",
                                    isFood && "bg-red-500 rounded-full scale-75 animate-pulse",
                                    // Optional: Checkerboard pattern
                                    (x + y) % 2 === 0 ? "bg-card/50" : "bg-card/30"
                                )}
                            />
                        );
                    })}
                </div>

                {/* Mobile/Touch Controls */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] md:hidden">
                    <div />
                    <Button variant="outline" size="icon" onPointerDown={(e) => { e.preventDefault(); if (directionRef.current !== 'DOWN') changeDirection('UP'); }}>
                        <ChevronUp className="h-6 w-6" />
                    </Button>
                    <div />
                    <Button variant="outline" size="icon" onPointerDown={(e) => { e.preventDefault(); if (directionRef.current !== 'RIGHT') changeDirection('LEFT'); }}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button variant="outline" size="icon" onPointerDown={(e) => { e.preventDefault(); if (directionRef.current !== 'UP') changeDirection('DOWN'); }}>
                        <ChevronDown className="h-6 w-6" />
                    </Button>
                    <Button variant="outline" size="icon" onPointerDown={(e) => { e.preventDefault(); if (directionRef.current !== 'LEFT') changeDirection('RIGHT'); }}>
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
