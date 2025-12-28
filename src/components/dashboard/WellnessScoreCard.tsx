import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Moon, Droplets } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function WellnessScoreCard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sleepMinutes, setSleepMinutes] = useState(0);
    const [waterIntake, setWaterIntake] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchWellnessData = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from("wellness_entries")
                .select("type, value")
                .eq("user_id", user.id)
                .eq("date", today);

            if (data) {
                let totalSleep = 0;
                let totalWater = 0;
                data.forEach(entry => {
                    if (entry.type === 'sleep') totalSleep += Number(entry.value);
                    if (entry.type === 'water') totalWater += Number(entry.value);
                });
                setSleepMinutes(totalSleep);
                setWaterIntake(totalWater);
            }
        };

        fetchWellnessData();

        const channel = supabase
            .channel('wellness_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'wellness_entries', filter: `user_id=eq.${user.id}` }, () => fetchWellnessData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const formatSleep = (mins: number) => {
        if (mins === 0) return "--";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatWater = (ml: number) => {
        if (ml === 0) return "--";
        const liters = (ml / 1000).toFixed(1);
        return `${liters}L`;
    };

    const getStatus = () => {
        if (sleepMinutes > 420 && waterIntake > 2000) return { label: "Excellent", color: "text-green-600 bg-green-50 border-green-200" };
        if (sleepMinutes > 360 || waterIntake > 1500) return { label: "Good", color: "text-rose-600 bg-white border-rose-200" };
        return { label: "Needs Focus", color: "text-orange-600 bg-orange-50 border-orange-200" };
    };

    const status = getStatus();

    return (
        <div className="p-4 md:p-6 bg-rose-50 border border-rose-100 rounded-xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-rose-800 flex items-center gap-2 text-sm md:text-base">
                    <Heart className="w-5 h-5" /> Wellness Check
                </h3>
                <span className={`text-[10px] md:text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
                    Today: {status.label}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="h-auto py-3 justify-start bg-white hover:bg-rose-100 border-rose-200 transition-all hover:scale-[1.02]"
                    onClick={() => navigate("/wellness/sleep")}
                >
                    <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                    <div className="text-left">
                        <span className="text-xs text-muted-foreground block">Sleep</span>
                        <span className="text-sm font-medium">{formatSleep(sleepMinutes)}</span>
                    </div>
                </Button>
                <Button
                    variant="outline"
                    className="h-auto py-3 justify-start bg-white hover:bg-cyan-100 border-cyan-200 transition-all hover:scale-[1.02]"
                    onClick={() => navigate("/wellness/water")}
                >
                    <Droplets className="w-4 h-4 mr-2 text-cyan-500" />
                    <div className="text-left">
                        <span className="text-xs text-muted-foreground block">Water</span>
                        <span className="text-sm font-medium">{formatWater(waterIntake)}</span>
                    </div>
                </Button>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground italic text-center mt-2">
                "Small habits make a big difference."
            </p>
        </div>
    );
}
