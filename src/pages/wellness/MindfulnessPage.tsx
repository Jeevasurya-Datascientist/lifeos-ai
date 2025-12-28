import { MoodTracker } from "@/components/wellness/MoodTracker";
import { BreathingExercise } from "@/components/wellness/BreathingExercise";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MindfulnessPage() {
    const navigate = useNavigate();
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/wellness")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Wellness
            </Button>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Mindfulness 🧘‍♀️</h1>
                <p className="text-slate-500">Track your mood and take a moment to breathe.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <MoodTracker />
                <BreathingExercise />
            </div>
        </div>
    );
}
