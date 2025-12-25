import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Palette, Play, CheckCircle, XCircle, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = [
    { name: "RED", hex: "text-red-500" },
    { name: "BLUE", hex: "text-blue-500" },
    { name: "GREEN", hex: "text-green-500" },
    { name: "YELLOW", hex: "text-yellow-500" },
    { name: "PURPLE", hex: "text-purple-500" },
];

export function ColorMatch() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [highScore, setHighScore] = useState(0);
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
    const [mistakes, setMistakes] = useState(0);

    // Current Problem
    const [word, setWord] = useState(COLORS[0]);
    const [ink, setInk] = useState(COLORS[0]);
    const [doesMatch, setDoesMatch] = useState(true);

    useEffect(() => {
        loadHighScore();
    }, [user]);

    const loadHighScore = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('brain_training_scores')
            .select('score')
            .eq('user_id', user.id)
            .eq('game_type', 'color_match')
            .order('score', { ascending: false })
            .limit(1)
            .single();
        if (data) setHighScore(data.score);
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(30);
        setMistakes(0);
        generateProblem();
    };

    const generateProblem = () => {
        const isMatch = Math.random() > 0.5;
        const w = COLORS[Math.floor(Math.random() * COLORS.length)];
        let i = w;

        if (!isMatch) {
            // Find a different color
            do {
                i = COLORS[Math.floor(Math.random() * COLORS.length)];
            } while (i.name === w.name);
        }

        setWord(w);
        setInk(i);
        setDoesMatch(isMatch);
    };

    const handleAnswer = (answer: boolean) => {
        if (answer === doesMatch) {
            setScore(s => s + 10);
            setFeedback('correct');
        } else {
            setScore(s => Math.max(0, s - 5));
            setFeedback('wrong');
            setMistakes(m => m + 1);
        }
        setTimeout(() => setFeedback('none'), 200);
        generateProblem();
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing' && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('end');
            if (score > highScore) setHighScore(score);
            saveScore(score);
        }
        return () => clearInterval(interval);
    }, [gameState, timeLeft, score]);

    const saveScore = async (finalScore: number) => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'color_match',
            score: finalScore,
            metadata: {
                date: new Date().toISOString(),
                mistakes: mistakes
            }
        });
    };

    return (
        <Card className={`h-full flex flex-col transition-colors duration-200 ${feedback === 'wrong' ? 'bg-red-50 border-red-200' : feedback === 'correct' ? 'bg-green-50 border-green-200' : ''}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-orange-500" />
                        Stroop Test
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
                {gameState === 'start' ? (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">Does the <b>Meaning</b> match the <b>Ink Color</b>?</p>
                        <div className="flex justify-center gap-2 text-sm text-muted-foreground mb-4">
                            <Trophy className="w-4 h-4" /> High Score: {highScore}
                        </div>
                        <Button onClick={startGame} className="w-full">
                            <Play className="w-4 h-4 mr-2" /> Start Game
                        </Button>
                    </div>
                ) : gameState === 'end' ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-bold">Time's Up!</h3>
                        <p className="text-3xl font-bold text-primary">{score}</p>
                        <p className="text-sm text-muted-foreground">Mistakes: {mistakes}</p>
                        <Button onClick={startGame}>Play Again</Button>
                    </div>
                ) : (
                    <div className="w-full space-y-8">
                        <div className="flex justify-between font-mono text-sm">
                            <span>Score: {score}</span>
                            <span className={timeLeft < 10 ? "text-red-500 font-bold" : ""}>00:{timeLeft.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="h-32 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-slate-100">
                            <h2 className={`text-5xl font-black ${ink.hex}`}>
                                {word.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-16 border-2 hover:bg-green-50 hover:border-green-200"
                                onClick={() => handleAnswer(true)}
                            >
                                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                                MATCH
                            </Button>
                            <Button
                                variant="outline"
                                className="h-16 border-2 hover:bg-red-50 hover:border-red-200"
                                onClick={() => handleAnswer(false)}
                            >
                                <XCircle className="w-6 h-6 text-red-500 mr-2" />
                                NO MATCH
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
