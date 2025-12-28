import { SleepTimer } from "@/components/wellness/SleepTimer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SleepPage() {
    const navigate = useNavigate();
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/wellness")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Wellness
            </Button>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Sleep Tracker 🌙</h1>
                <p className="text-slate-500">Track your sleep cycles and improve your rest.</p>
            </div>
            <SleepTimer />
        </div>
    );
}
