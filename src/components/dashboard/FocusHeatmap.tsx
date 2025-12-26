import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { Loader2 } from "lucide-react";

export function FocusHeatmap() {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const endDate = new Date();
            const startDate = subDays(endDate, 27); // Last 28 days
            const startStr = startOfDay(startDate).toISOString();
            const endStr = endOfDay(endDate).toISOString();

            const { data: habitEntries } = await supabase
                .from("wellness_entries")
                .select("date, created_at")
                .eq("user_id", user.id)
                .eq("type", "habit")
                .gte("date", startStr)
                .lte("date", endStr);

            const heatData = [];
            for (let i = 0; i < 28; i++) {
                const d = subDays(endDate, 27 - i);
                const dateKey = format(d, 'yyyy-MM-dd');
                const dayLabel = format(d, 'dd MMM');

                // Count completed habits per day
                const count = habitEntries
                    ?.filter(h => (h.date === dateKey || h.created_at.startsWith(dateKey)))
                    .length || 0;

                heatData.push({ day: dayLabel, count: count });
            }

            setData(heatData);
            setLoading(false);
        };

        fetchData();
    }, [user]);

    const getIntensityColor = (count: number) => {
        if (count >= 4) return "bg-indigo-600";
        if (count >= 3) return "bg-indigo-500";
        if (count >= 1) return "bg-indigo-300";
        return "bg-indigo-50"; // Empty/Very low
    };

    // Header labels for grid (just S M T W T F S repeating? No, heatmap usually is by date)
    // We'll just show the grid blocks.

    if (loading) return <div className="h-[200px] flex items-center justify-center border rounded-xl bg-white"><Loader2 className="animate-spin text-slate-300" /></div>;

    const isEmpty = data.every(d => d.count === 0);

    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Habit Consistency</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 rounded-md">Last 4 Weeks</span>
            </div>

            {isEmpty ? (
                <div className="h-[100px] flex flex-col items-center justify-center text-xs text-slate-400">
                    <p>No activity yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-2">
                    {data.map((d, i) => (
                        <TooltipProvider key={i}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`aspect-square rounded-md ${getIntensityColor(d.count)} hover:opacity-80 transition-opacity cursor-pointer`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-medium">{d.day}: {d.count} habits</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-indigo-50"></div>
                    <div className="w-3 h-3 rounded bg-indigo-300"></div>
                    <div className="w-3 h-3 rounded bg-indigo-500"></div>
                    <div className="w-3 h-3 rounded bg-indigo-600"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
