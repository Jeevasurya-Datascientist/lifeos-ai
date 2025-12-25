import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Type, Check, X, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const WORDS = [
    "FOCUS", "BRAIN", "LOGIC", "PUZZLE", "MEMORY", "SMART", "THINK", "SOLVE",
    "QUIZ", "GAME", "LEARN", "SKILL", "MIND", "REACT", "SPEED", "COUNT",
    "SHARP", "QUICK", "ALERT", "STUDY"
];

export function WordScramble() {
    const { user } = useAuth();
    const [currentWord, setCurrentWord] = useState("");
    const [scrambled, setScrambled] = useState("");
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState("");
    const [totalSolved, setTotalSolved] = useState(0);

    useEffect(() => {
        nextWord();
    }, []);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        if (!user) return;
        const { count } = await supabase
            .from('brain_training_scores')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('game_type', 'word_scramble');
        if (count !== null) setTotalSolved(count);
    };

    const shuffleWord = (word: string) => {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    };

    const nextWord = () => {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        // Ensure it's actually scrambled
        let scram = shuffleWord(word);
        while (scram === word) scram = shuffleWord(word);

        setCurrentWord(word);
        setScrambled(scram);
        setInput("");
        setMessage("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.toUpperCase() === currentWord) {
            setMessage("Correct!");
            setScore(s => s + 10);
            setStreak(s => s + 1);
            saveWin();
            setTimeout(() => nextWord(), 800);
        } else {
            setMessage("Try again");
            setStreak(0);
            // Shake effect could go here
        }
    };

    const saveWin = async () => {
        setTotalSolved(s => s + 1); // Optimistic update
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'word_scramble',
            score: 1,
            metadata: { date: new Date().toISOString() }
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Type className="w-5 h-5 text-teal-500" />
                        Word Scramble
                    </div>
                    <div className="text-sm font-normal text-muted-foreground">
                        Solved: {totalSolved}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Unscramble the word</p>
                    <div className="text-4xl font-black tracking-[0.2em] text-slate-700 uppercase">
                        {scrambled}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[240px] space-y-4">
                    <div className="space-y-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type answer..."
                            className="text-center text-lg uppercase font-bold tracking-widest"
                            autoFocus
                        />
                        {message && (
                            <p className={`text-center text-sm font-bold ${message === "Correct!" ? "text-green-500" : "text-red-500"}`}>
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" onClick={nextWord} title="Skip">
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button type="submit">Submit</Button>
                    </div>
                </form>

                {streak > 1 && (
                    <div className="text-xs font-bold text-orange-500 animate-pulse">
                        🔥 Streak: {streak}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
