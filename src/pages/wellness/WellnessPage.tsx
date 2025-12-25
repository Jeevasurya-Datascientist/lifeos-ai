import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { HabitTracker } from "@/components/wellness/HabitTracker";
import { WellnessScoreCard } from "@/components/dashboard/WellnessScoreCard";
import { SleepTimer } from "@/components/wellness/SleepTimer";
import { WaterTracker } from "@/components/wellness/WaterTracker";
import { BreathingExercise } from "@/components/wellness/BreathingExercise";
import { MoodTracker } from "@/components/wellness/MoodTracker";

export default function WellnessPage() {
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <header className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">Health & Wellness</h1>
                <p className="text-muted-foreground">Track your physical and mental well-being.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Score & Water & Breathing & Mood */}
                <div className="lg:col-span-1 space-y-6">
                    <WellnessScoreCard />

                    <MoodTracker />
                    <BreathingExercise />
                    <WaterTracker />

                </div>

                {/* Right Column: Sleep Tracker & Habits */}
                <div className="lg:col-span-2 space-y-6">
                    <SleepTimer />
                    <HabitTracker />
                </div>
            </div>
        </div>
    );
}
