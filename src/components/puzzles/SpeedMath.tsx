import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer, Trophy, RefreshCw } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function SpeedMath() {
    const { user } = useAuth();
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState("+");
    const [result, setResult] = useState("");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const generateProblem = () => {
        const ops = ["+", "-", "*"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const n1 = Math.floor(Math.random() * 12) + 1;
        const n2 = Math.floor(Math.random() * 12) + 1;
        setNum1(n1);
        setNum2(n2);
        setOperator(op);
        setResult("");
    };

    const startGame = () => {
        setIsActive(true);
        setScore(0);
        setTimeLeft(30);
        generateProblem();
    };

    // Load High Score
    useEffect(() => {
        if (!user) return;
        const loadHighScore = async () => {
            const { data } = await supabase
                .from('brain_training_scores')
                .select('score')
                .eq('user_id', user.id)
                .eq('game_type', 'speed_math')
                .order('score', { ascending: false })
                .limit(1)
                .single();
            if (data) setHighScore(data.score);
        };
        loadHighScore();
    }, [user]);

    // Game Timer & End Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            if (score > highScore) {
                setHighScore(score);
            }
            saveScore(score);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, score, highScore]);

    const saveScore = async (finalScore: number) => {
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'speed_math',
            score: finalScore,
            metadata: { date: new Date().toISOString() }
        });
    };

    const [isWrong, setIsWrong] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let correct;
        switch (operator) {
            case "+": correct = num1 + num2; break;
            case "-": correct = num1 - num2; break;
            case "*": correct = num1 * num2; break;
            default: correct = 0;
        }

        if (parseInt(result) === correct) {
            setScore(score + 10);
            setIsWrong(false);
            generateProblem();
        } else {
            setIsWrong(true);
            setWrongAttempts(w => w + 1);
            setScore(s => Math.max(0, s - 5)); // Penalty
            setTimeout(() => setIsWrong(false), 500);
            setResult(""); // Clear input on wrong? Or keep it? Let's clear to force retry. Actually user can just edit. Let's clear.
        }
    };

    return (
        <Card className="text-center h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5 text-indigo-500" />
                    Speed Math
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!isActive && timeLeft === 0 ? (
                    <div className="space-y-4">
                        <p className="text-xl font-bold">Game Over!</p>
                        <p>Score: {score}</p>
                        <Button onClick={startGame}>Play Again</Button>
                    </div>
                ) : !isActive ? (
                    <div className="space-y-4">
                        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> High: {highScore}</span>
                        </div>
                        <p>Solve as many as you can in 30s!</p>
                        <Button onClick={startGame}>Start Game</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-between text-sm font-medium text-slate-500">
                            <span>Score: {score}</span>
                            <span className={`${timeLeft < 10 ? "text-red-500" : ""}`}>Time: {timeLeft}s</span>
                        </div>

                        <div className="text-4xl font-bold font-mono tracking-wider">
                            {num1} {operator} {num2} = ?
                        </div>

                        <Input
                            type="number"
                            value={result}
                            onChange={(e) => setResult(e.target.value)}
                            autoFocus
                            className={`text-center text-xl transition-all ${isWrong ? "border-red-500 bg-red-50 animate-shake" : ""}`}
                            placeholder="Answer"
                        />
                        <Button type="submit" className="w-full">Submit</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
