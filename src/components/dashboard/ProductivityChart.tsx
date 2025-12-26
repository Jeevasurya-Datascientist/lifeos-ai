import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { Loader2 } from "lucide-react";

export function ProductivityChart() {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const endDate = new Date();
            const startDate = subDays(endDate, 6);
            const startStr = startOfDay(startDate).toISOString();
            const endStr = endOfDay(endDate).toISOString();

            // Fetch Habits
            const { data: habitEntries } = await supabase
                .from("wellness_entries")
                .select("value, date, created_at")
                .eq("user_id", user.id)
                .eq("type", "habit")
                .gte("date", startStr)
                .lte("date", endStr);

            const dailyData = [];
            for (let i = 0; i < 7; i++) {
                const d = subDays(endDate, 6 - i);
                const dateKey = format(d, 'yyyy-MM-dd');
                const dayName = format(d, 'EEE');

                // Count completed habits
                // Assuming value=1 for completion, or just counting rows if value is inconsistent
                const count = habitEntries
                    ?.filter(h => (h.date === dateKey || h.created_at.startsWith(dateKey)))
                    .length || 0;

                dailyData.push({ day: dayName, count: count });
            }

            setData(dailyData);
            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="h-[200px] flex items-center justify-center border rounded-xl bg-slate-50"><Loader2 className="animate-spin text-slate-300" /></div>;

    const isEmpty = data.every(d => d.count === 0);

    return (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
            <h3 className="font-semibold text-slate-800">Weekly Habit Trace</h3>
            {isEmpty ? (
                <div className="h-[150px] flex items-center justify-center text-xs text-slate-400">
                    No habits tracked this week.
                </div>
            ) : (
                <div className="h-[150px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                                cursor={{ fill: "transparent" }}
                            />
                            <Bar dataKey="count" name="Habits Done" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <p className="text-xs text-center text-slate-500">
                {isEmpty ? "Start tracking habits to see trends." : "Consistency is key to productivity."}
            </p>
        </div>
    );
}
