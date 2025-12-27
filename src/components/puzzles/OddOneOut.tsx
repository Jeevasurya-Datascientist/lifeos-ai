import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Eye, Trophy, RefreshCcw } from "lucide-react";

export function OddOneOut() {
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);

    // Game State
    const [gridSize, setGridSize] = useState(2);
    const [baseColor, setBaseColor] = useState({ hue: 0, sat: 80, light: 50 });
    const [oddTileIndex, setOddTileIndex] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsPlaying(false);
        }
        return () => clearInterval(timer);
    }, [isPlaying, timeLeft]);

    const startGame = () => {
        setLevel(1);
        setScore(0);
        setTimeLeft(60);
        setIsPlaying(true);
        generateLevel(1);
    };

    const generateLevel = (currentLevel: number) => {
        // Calculate Difficulty
        // Grid size increases every 3 levels? Cap at say 8x8.
        const size = Math.min(8, Math.floor(currentLevel / 3) + 2);
        setGridSize(size);

        // Color difference decreases (Harder)
        // Delta L works well.
        // Level 1: Delta 30. Level 50: Delta 2.
        // Formula: Max(2, 30 - currentLevel * 0.5)

        const hue = Math.floor(Math.random() * 360);
        setBaseColor({
            hue,
            sat: 80,
            light: 50
        });

        setOddTileIndex(Math.floor(Math.random() * (size * size)));
    };

    const handleTileClick = (index: number) => {
        if (!isPlaying) return;

        if (index === oddTileIndex) {
            // Correct
            setScore(s => s + 1);
            setLevel(l => {
                const next = l + 1;
                generateLevel(next);
                return next;
            });
            // Bonus time every 5 levels?
            if (level % 5 === 0) setTimeLeft(t => t + 5);
        } else {
            // Wrong (- time penalty)
            setTimeLeft(t => Math.max(0, t - 2));
            // Shake effect?
        }
    };

    // Calculate odd color based on level
    const opacityDiff = Math.max(0.02, 0.4 - (level * 0.01)); // Method 2: Opacity difference
    // Actually HSL lightness is safer.
    const lightnessDiff = Math.max(2, 20 - (level * 0.4));

    const baseColorString = `hsl(${baseColor.hue}, ${baseColor.sat}%, ${baseColor.light}%)`;
    // Odd color is lighter
    const oddColorString = `hsl(${baseColor.hue}, ${baseColor.sat}%, ${baseColor.light + lightnessDiff}%)`;

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-500" />
                        Odd One Out
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}`} />
                            <span className="font-mono font-bold text-lg">{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-mono font-bold text-lg">{score}</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-0">

                {!isPlaying ? (
                    <div className="text-center space-y-4">
                        {score > 0 ? (
                            <>
                                <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
                                <p className="text-lg text-muted-foreground mb-4">You reached Level {level}</p>
                            </>
                        ) : (
                            <p className="text-lg text-muted-foreground mb-4">Find the slightly different colored tile as fast as you can!</p>
                        )}
                        <Button size="lg" onClick={startGame} className="gap-2">
                            {score > 0 ? <RefreshCcw className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {score > 0 ? "Play Again" : "Start Game"}
                        </Button>
                    </div>
                ) : (
                    <div
                        className="bg-white p-2 rounded-xl shadow-sm transition-all duration-300"
                        style={{
                            width: 'min(100%, 500px)',
                            aspectRatio: '1/1',
                            display: 'grid',
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gap: '8px'
                        }}
                    >
                        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleTileClick(i)}
                                className="w-full h-full rounded-md shadow-sm transition-transform active:scale-95 duration-75"
                                style={{
                                    backgroundColor: i === oddTileIndex ? oddColorString : baseColorString
                                }}
                            />
                        ))}
                    </div>
                )}

                {isPlaying && (
                    <p className="mt-4 text-muted-foreground text-sm font-medium">Level {level}</p>
                )}

            </CardContent>
        </Card>
    );
}
