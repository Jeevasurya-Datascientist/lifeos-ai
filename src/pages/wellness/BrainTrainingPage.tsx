import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Gamepad2, Play, Lock, Crown, Zap, Grid3X3, Eye, Type, Calculator, Mic, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BrainTrainingSettings, getThemeGradient } from "@/components/wellness/BrainTrainingSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Trophy } from "lucide-react";

// Game Data Definition
interface GameDef {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    category: 'memory' | 'focus' | 'logic' | 'language' | 'math' | 'arcade';
    isPro: boolean;
    color: string;
}

const GAMES: GameDef[] = [
    // Arcade (Fun)
    {
        id: 'snake',
        title: 'Classic Snake',
        description: 'Navigate the snake to eat food and grow. Don\'t hit the walls!',
        icon: Gamepad2,
        category: 'arcade',
        isPro: false,
        color: 'text-green-500'
    },
    {
        id: 'vocal-training',
        title: 'Vocal Bird',
        description: 'Control the bird by singing! Pitch/Volume controls height.',
        icon: Mic,
        category: 'arcade',
        isPro: false,
        color: 'text-pink-500'
    },
    {
        id: 'odd-one-out',
        title: 'Odd One Out',
        description: 'Find the tile with the slightly different color. Be quick!',
        icon: Eye,
        category: 'arcade',
        isPro: false,
        color: 'text-indigo-500'
    },
    {
        id: 'whack-a-mole',
        title: 'Whack-a-Mole',
        description: 'Hit the moles before they disappear! Fast-paced fun.',
        icon: Hammer,
        category: 'arcade',
        isPro: false,
        color: 'text-amber-600'
    },
    {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        description: 'Challenge the AI in this classic strategy game. Can you win?',
        icon: Grid3X3,
        category: 'arcade',
        isPro: false,
        color: 'text-blue-500'
    },
    // Math
    {
        id: 'speed-math',
        title: 'Speed Math',
        description: 'Solve arithmetic problems as fast as you can within the time limit.',
        icon: Calculator,
        category: 'math',
        isPro: false,
        color: 'text-indigo-500'
    },
    // Logic
    {
        id: 'sudoku',
        title: 'Sudoku',
        description: 'Fill the grid so that every row, column, and Box contains digits 1-9.',
        icon: Grid3X3,
        category: 'logic',
        isPro: false,
        color: 'text-violet-500'
    },
    {
        id: '2048',
        title: '2048',
        description: 'Slide tiles to combine matching numbers and reach the 2048 tile.',
        icon: Brain,
        category: 'logic',
        isPro: true,
        color: 'text-orange-500'
    },
    {
        id: 'number-slide',
        title: 'Number Slide',
        description: 'Order the numbners by sliding the tiles into the correct position.',
        icon: Grid3X3,
        category: 'logic',
        isPro: true,
        color: 'text-cyan-500'
    },
    // Memory
    {
        id: 'memory-match',
        title: 'Memory Match',
        description: 'Flip cards to find matching pairs before time runs out.',
        icon: Brain,
        category: 'memory',
        isPro: false,
        color: 'text-pink-500'
    },
    {
        id: 'simon-says',
        title: 'Simon Says',
        description: 'Memorize and repeat the sequence of lights and sounds.',
        icon: Zap,
        category: 'memory',
        isPro: true,
        color: 'text-yellow-500'
    },
    // Focus
    {
        id: 'schulte-table',
        title: 'Schulte Table',
        description: 'Find numbers in ascending order as quickly as possible.',
        icon: Eye,
        category: 'focus',
        isPro: true,
        color: 'text-emerald-500'
    },
    {
        id: 'color-match',
        title: 'Stroop Test',
        description: 'Does the meaning match the ink color? Test your reaction time.',
        icon: Zap,
        category: 'focus',
        isPro: true,
        color: 'text-red-500'
    },
    // Language
    {
        id: 'word-scramble',
        title: 'Word Scramble',
        description: 'Unscramble the letters to form the correct word.',
        icon: Type,
        category: 'language',
        isPro: true,
        color: 'text-teal-500'
    }
];

export default function BrainTrainingPage() {
    const [theme, setTheme] = useState(() => localStorage.getItem('brain_gym_theme') || 'default');
    const { profile } = useAuth();
    const navigate = useNavigate();

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('brain_gym_theme', newTheme);
    };

    const gradientClass = getThemeGradient(theme);

    // DEVELOPER TOGGLE
    const ENABLE_GATING = false;
    const isPro = !ENABLE_GATING || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'lifetime';

    const getFilteredGames = (category: string) => {
        if (category === 'all') return GAMES;
        return GAMES.filter(g => g.category.toLowerCase() === category.toLowerCase());
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
            <header className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className={`text-3xl font-bold bg-clip-text text-transparent ${gradientClass}`}>
                        Brain Gym 🧠
                    </h1>
                    <p className="text-muted-foreground">Train your cognitive skills with daily puzzles.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/brain-training" className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full font-bold shadow-sm border border-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer">
                        <Trophy className="w-4 h-4" />
                        <span>{profile?.total_points || 0}</span>
                    </Link>
                    <BrainTrainingSettings currentTheme={theme} onThemeChange={handleThemeChange} />
                </div>
            </header>

            {!isPro && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-indigo-900">Free Plan Active</p>
                            <p className="text-xs text-indigo-700">Upgrade to unlock all premium brain training exercises.</p>
                        </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                        <Link to="/subscription">Unlock All</Link>
                    </Button>
                </div>
            )}

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white border w-full justify-start overflow-x-auto h-auto p-1">
                    <TabsTrigger value="all" className="px-4 py-2">All Games</TabsTrigger>
                    <TabsTrigger value="arcade" className="px-4 py-2 gap-2"><Gamepad2 className="w-4 h-4" /> Arcade</TabsTrigger>
                    <TabsTrigger value="memory" className="px-4 py-2">Memory</TabsTrigger>
                    <TabsTrigger value="focus" className="px-4 py-2">Focus</TabsTrigger>
                    <TabsTrigger value="logic" className="px-4 py-2">Logic</TabsTrigger>
                    <TabsTrigger value="language" className="px-4 py-2">Language</TabsTrigger>
                    <TabsTrigger value="math" className="px-4 py-2">Math</TabsTrigger>
                </TabsList>

                {['all', 'arcade', 'memory', 'focus', 'logic', 'language', 'math'].map((cat) => (
                    <TabsContent key={cat} value={cat} className="space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {getFilteredGames(cat).map((game) => {
                                const isLocked = !isPro && game.isPro;
                                return (
                                    <Card key={game.id} className="group relative overflow-hidden transition-all hover:shadow-lg border-muted/60 hover:border-primary/50">
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="bg-background/90 p-3 rounded-full shadow-sm">
                                                    <Lock className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <span className="font-bold text-xs bg-background/90 px-3 py-1 rounded-full shadow-sm">Pro Only</span>
                                            </div>
                                        )}

                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className={`p-3 rounded-xl bg-slate-50 ${game.color} group-hover:scale-110 transition-transform duration-300`}>
                                                    <game.icon className="w-6 h-6" />
                                                </div>
                                                {isLocked ? (
                                                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                )}
                                            </div>
                                            <CardTitle className="mt-4">{game.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                                {game.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className="w-full gap-2 group-hover:translate-x-1 transition-transform"
                                                variant={isLocked ? "outline" : "default"}
                                                onClick={() => navigate(`/brain-training/game/${game.id}`)}
                                            >
                                                {isLocked ? (
                                                    <>View Details</>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4 fill-current" /> Play Now
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
