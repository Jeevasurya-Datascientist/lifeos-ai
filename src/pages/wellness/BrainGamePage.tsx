import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Game2048 } from "@/components/puzzles/Game2048";
import { SimonSays } from "@/components/puzzles/SimonSays";
import { SnakeGame } from "@/components/puzzles/SnakeGame";
import { TicTacToe } from "@/components/puzzles/TicTacToe";
import { VocalTraining } from "@/components/puzzles/VocalTraining";
import { OddOneOut } from "@/components/puzzles/OddOneOut";
import { WhackAMole } from "@/components/puzzles/WhackAMole";
import { SpeedMath } from "@/components/puzzles/SpeedMath";
import { NumberSlide } from "@/components/puzzles/NumberSlide";
import { MemoryMatch } from "@/components/puzzles/MemoryMatch";
import { ColorMatch } from "@/components/puzzles/ColorMatch";
import { Sudoku } from "@/components/puzzles/Sudoku";
import { SchulteTable } from "@/components/puzzles/SchulteTable";
import { WordScramble } from "@/components/puzzles/WordScramble";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";

// Game generic wrapper to ensure consistent layout/padding if needed
const GameWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-4xl mx-auto h-[80vh] min-h-[600px]">
        {children}
    </div>
);

// Configuration for games (Locked status, etc)
// Ideally this should be shared, but for now we reproduce the logic or passed via state?
// Let's keep logic simple: Check ID against known list.

export default function BrainGamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    // DEVELOPER TOGGLE
    const ENABLE_GATING = false;
    const isPro = !ENABLE_GATING || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'lifetime';

    // Free games list
    const FREE_GAMES = ['snake', 'tictactoe', 'whack-a-mole'];

    const renderGame = () => {
        switch (gameId) {
            case '2048': return <Game2048 />;
            case 'simon-says': return <SimonSays />;
            case 'snake': return <Card className="h-full p-6"><SnakeGame /></Card>;
            case 'tictactoe': return <Card className="h-full p-6"><TicTacToe /></Card>;
            case 'vocal-training': return <Card className="h-full p-6"><VocalTraining /></Card>;
            case 'odd-one-out': return <Card className="h-full p-6"><OddOneOut /></Card>;
            case 'whack-a-mole': return <Card className="h-full p-6"><WhackAMole /></Card>;
            case 'speed-math': return <SpeedMath />;
            case 'number-slide': return <NumberSlide />;
            case 'memory-match': return <MemoryMatch />;
            case 'color-match': return <ColorMatch />;
            case 'sudoku': return <Sudoku />;
            case 'schulte-table': return <SchulteTable />;
            case 'word-scramble': return <WordScramble />;
            default: return <div className="text-center text-muted-foreground mt-20">Game not found</div>;
        }
    };

    const isLocked = !isPro && !FREE_GAMES.includes(gameId || '');

    if (isLocked) {
        return (
            <div className="container py-8 max-w-7xl mx-auto min-h-screen flex flex-col">
                <Button variant="ghost" onClick={() => navigate('/brain-training')} className="w-fit mb-8 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Brain Gym
                </Button>

                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto">
                    <div className="p-4 bg-slate-100 rounded-full">
                        <Lock className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Pro Feature</h1>
                        <p className="text-muted-foreground">
                            This game is only available for Pro members. Upgrade your plan to unlock all brain training exercises.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <Button asChild size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                            <Link to="/subscription">
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade to Pro
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/brain-training')} className="w-full">
                            Back to Games
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine title for header
    const getTitle = () => {
        const titles: Record<string, string> = {
            '2048': '2048',
            'simon-says': 'Simon Says',
            'snake': 'Classic Snake',
            'tictactoe': 'Tic Tac Toe',
            'vocal-training': 'Vocal Training',
            'odd-one-out': 'Odd One Out',
            'whack-a-mole': 'Whack-a-Mole',
            'speed-math': 'Speed Math',
            'number-slide': 'Number Slide',
            'memory-match': 'Memory Match',
            'color-match': 'Color Match',
            'sudoku': 'Sudoku',
            'schulte-table': 'Schulte Table',
            'word-scramble': 'Word Scramble'
        };
        return titles[gameId || ''] || 'Brain Game';
    };

    return (
        <div className="container py-6 max-w-7xl mx-auto flex flex-col gap-6 min-h-screen">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/brain-training')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <h1 className="text-2xl font-bold">{getTitle()}</h1>
            </div>

            <div className="flex-1">
                <GameWrapper>
                    {renderGame()}
                </GameWrapper>
            </div>
        </div>
    );
}
