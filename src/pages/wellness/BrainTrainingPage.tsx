import { useState, useEffect } from "react";
import { SpeedMath } from "@/components/puzzles/SpeedMath";
import { NumberSlide } from "@/components/puzzles/NumberSlide";
import { MemoryMatch } from "@/components/puzzles/MemoryMatch";
import { ColorMatch } from "@/components/puzzles/ColorMatch";
import { Game2048 } from "@/components/puzzles/Game2048";
import { Sudoku } from "@/components/puzzles/Sudoku";
import { SchulteTable } from "@/components/puzzles/SchulteTable";
import { SimonSays } from "@/components/puzzles/SimonSays";
import { WordScramble } from "@/components/puzzles/WordScramble";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown } from "lucide-react";
import { BrainTrainingSettings, getThemeGradient } from "@/components/wellness/BrainTrainingSettings";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function BrainTrainingPage() {
    const [theme, setTheme] = useState(() => localStorage.getItem('brain_gym_theme') || 'default');
    const { profile } = useAuth();

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        localStorage.setItem('brain_gym_theme', newTheme);
    };

    const gradientClass = getThemeGradient(theme);

    // DEVELOPER TOGGLE: Set to TRUE to enable feature gating (locks games for free users). 
    // Set to FALSE to unlock everything for testing.
    const ENABLE_GATING = false;

    const isPro = !ENABLE_GATING || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'lifetime';

    const GameGate = ({ children, isFree = false }: { children: React.ReactNode, isFree?: boolean }) => {
        if (isFree || isPro) return <>{children}</>;

        return (
            <div className="relative group overflow-hidden rounded-xl border bg-slate-50">
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 p-6 text-center transition-all">
                    <div className="p-3 bg-white rounded-full shadow-lg">
                        <Lock className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-900">Pro Feature</h3>
                        <p className="text-sm text-slate-500">Upgrade to unlock this game</p>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
                        <Link to="/subscription">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade Now
                        </Link>
                    </Button>
                </div>
                <div className="opacity-50 pointer-events-none grayscale blur-sm">
                    {children}
                </div>
            </div>
        )
    }

    // Free Games: SpeedMath, MemoryMatch, Sudoku
    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <header className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className={`text-3xl font-bold bg-clip-text text-transparent ${gradientClass}`}>
                        Brain Gym 🧠
                    </h1>
                    <p className="text-muted-foreground">Train your cognitive skills with daily puzzles.</p>
                </div>
                <BrainTrainingSettings currentTheme={theme} onThemeChange={handleThemeChange} />
            </header>

            {!isPro && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-indigo-900">Free Plan Active</p>
                            <p className="text-xs text-indigo-700">You have access to 3 starter games. Unlock all games with Pro.</p>
                        </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                        <Link to="/subscription">View Plans</Link>
                    </Button>
                </div>
            )}

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white border w-full justify-start overflow-x-auto">
                    <TabsTrigger value="all">All Games</TabsTrigger>
                    <TabsTrigger value="memory">Memory</TabsTrigger>
                    <TabsTrigger value="focus">Focus</TabsTrigger>
                    <TabsTrigger value="logic">Logic</TabsTrigger>
                    <TabsTrigger value="language">Language</TabsTrigger>
                    <TabsTrigger value="Math">Math</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                    {/* Featured / Active Games */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                        {/* Free Games */}
                        <div className="min-h-[450px]"><GameGate isFree={true}><SpeedMath /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate isFree={true}><MemoryMatch /></GameGate></div>
                        <div className="min-h-[500px]"><GameGate isFree={true}><Sudoku /></GameGate></div>

                        {/* Locked Games */}
                        <div className="min-h-[450px]"><GameGate><SchulteTable /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><ColorMatch /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><SimonSays /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><NumberSlide /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><WordScramble /></GameGate></div>
                        <div className="min-h-[500px]"><GameGate><Game2048 /></GameGate></div>
                    </div>

                    {/* Coming Soon Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-700">Coming Soon</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60">
                            {[
                                'Chess', 'Checkers', 'Go', 'Mini Metro', 'Monument Valley', 'Civilization Lite',
                                'Crosswords', 'Word Connect', 'Scrabble', 'Vocabulary Builder', 'Sentence Correction',
                                'Simon Says', 'Memory Matrix', 'Flow Free', 'Brain Dots', 'Nonograms', 'Connect Numbers',
                                'Number Patterns', 'Math Rush', 'Percent Trainer'
                            ].map((game) => (
                                <Card key={game} className="bg-slate-50 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium text-slate-500">{game}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="memory">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="min-h-[450px]"><GameGate isFree={true}><MemoryMatch /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><SimonSays /></GameGate></div>
                    </div>
                </TabsContent>

                <TabsContent value="focus">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="min-h-[450px]"><GameGate><ColorMatch /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><SchulteTable /></GameGate></div>
                    </div>
                </TabsContent>

                <TabsContent value="logic">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="min-h-[500px]"><GameGate><Game2048 /></GameGate></div>
                        <div className="min-h-[500px]"><GameGate isFree={true}><Sudoku /></GameGate></div>
                        <div className="min-h-[450px]"><GameGate><NumberSlide /></GameGate></div>
                    </div>
                </TabsContent>

                <TabsContent value="language">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="min-h-[450px]"><GameGate><WordScramble /></GameGate></div>
                    </div>
                </TabsContent>

                <TabsContent value="Math">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="min-h-[450px]"><GameGate isFree={true}><SpeedMath /></GameGate></div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
