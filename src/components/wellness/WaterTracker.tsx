import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplets, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function WaterTracker() {
    const { user } = useAuth();
    const GOAL = 3000; // ml
    const CUP_SIZE = 250; // ml
    const [intake, setIntake] = useState(0);
    const [lastDrinkTime, setLastDrinkTime] = useState<string | null>(null);

    // Load from Supabase on Mount
    useEffect(() => {
        if (!user) return;
        const fetchIntake = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from("wellness_entries")
                .select("value, created_at")
                .eq("user_id", user.id)
                .eq("type", "water")
                .eq("date", today);

            if (data && data.length > 0) {
                // Sum up all water entries for today
                const total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
                setIntake(total);
                // Get latest time
                const latest = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                setLastDrinkTime(latest.created_at);
            }
        };
        fetchIntake();
    }, [user]);

    const addWater = async () => {
        if (!user) {
            toast.error("Please login to track water.");
            return;
        }

        const newIntake = Math.min(intake + CUP_SIZE, GOAL + 2000);
        const now = new Date().toISOString();

        // Optimistic UI Update
        setIntake(newIntake);
        setLastDrinkTime(now);

        // Save to Supabase
        const { error } = await supabase.from("wellness_entries").insert({
            user_id: user.id,
            type: "water",
            value: CUP_SIZE, // Store the increment
            date: new Date().toISOString().split('T')[0]
        });

        if (error) {
            console.error("Failed to save water:", error);
            toast.error("Could not save to cloud.");
        } else {
            if (newIntake >= GOAL && intake < GOAL) {
                toast.success("🎉 Daily water goal reached! Saved to Cloud.");
            } else {
                toast.info(`Added ${CUP_SIZE}ml. Saved.`);
            }
        }
    };

    const getStatus = () => {
        const progress = (intake / GOAL) * 100;
        const currentHour = new Date().getHours();

        if (currentHour > 14 && progress < 30) {
            return { status: "Dehydrated", color: "text-red-500", icon: AlertTriangle, msg: "Urgent: Drink water now!" };
        }
        if (currentHour > 18 && progress < 60) {
            return { status: "Behind", color: "text-orange-500", icon: AlertTriangle, msg: "Catch up before bed." };
        }
        if (progress >= 100) {
            return { status: "Hydrated", color: "text-green-500", icon: CheckCircle2, msg: "Goal reached! Amazing." };
        }
        return { status: "On Track", color: "text-blue-500", icon: Droplets, msg: "Keep sipping regularly." };
    };

    const statusObj = getStatus();
    const progress = Math.min((intake / GOAL) * 100, 100);

    return (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800">
                        <Droplets className="w-5 h-5 text-blue-500" /> Water Intake
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>Goal: {GOAL}ml</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-blue-500 font-medium">Cloud Synced</span>
                    </div>
                </div>
                <div className={`flex flex-col items-end ${statusObj.color}`}>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <statusObj.icon className="w-3 h-3" /> {statusObj.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                        {lastDrinkTime ? `Last: ${format(new Date(lastDrinkTime), 'h:mm a')}` : 'No logs today'}
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-2xl font-bold text-slate-700">{intake}<span className="text-sm font-normal text-slate-400 ml-1">ml</span></span>
                    <span className="text-slate-400 flex items-end mb-1">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-blue-50 [&>div]:bg-blue-500" />
                <p className="text-xs text-slate-500 pt-1 text-center">{statusObj.msg}</p>
            </div>

            <Button
                onClick={addWater}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200"
            >
                <Plus className="w-4 h-4 mr-2" /> Add Cup ({CUP_SIZE}ml)
            </Button>
        </div>
    );
}
