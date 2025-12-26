import { useEffect, useState } from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format, startOfDay, endOfDay, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

export function SleepSpendChart() {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [correlationMsg, setCorrelationMsg] = useState("Analyzing patterns...");

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const endDate = new Date();
            const startDate = subDays(endDate, 6); // Last 7 days including today
            const startStr = startOfDay(startDate).toISOString();
            const endStr = endOfDay(endDate).toISOString();

            // 1. Fetch Expenses
            const { data: transactions } = await supabase
                .from("transactions")
                .select("amount, date")
                .eq("user_id", user.id)
                .eq("type", "expense")
                .gte("date", startStr)
                .lte("date", endStr);

            // 2. Fetch Sleep
            const { data: sleepEntries } = await supabase
                .from("wellness_entries")
                .select("value, date, created_at") // value is minutes
                .eq("user_id", user.id)
                .eq("type", "sleep")
                .gte("date", startStr) // Ensure your wellness_entries has a 'date' column or use created_at
                .lte("date", endStr);

            // Process Data by Day
            const dailyData = [];
            for (let i = 0; i < 7; i++) {
                const d = subDays(endDate, 6 - i);
                const dateKey = format(d, 'yyyy-MM-dd');
                const dayName = format(d, 'EEE');

                // Sum Spend
                const dailySpend = transactions
                    ?.filter(t => t.date.startsWith(dateKey))
                    .reduce((sum, t) => sum + t.amount, 0) || 0;

                // Sum Sleep (Minutes -> Hours)
                // Note: sleepEntries might rely on 'date' column or 'created_at' substring
                const dailySleepMins = sleepEntries
                    ?.filter(s => (s.date === dateKey || s.created_at.startsWith(dateKey)))
                    .reduce((sum, s) => sum + s.value, 0) || 0;

                dailyData.push({
                    day: dayName,
                    fullDate: dateKey,
                    spend: dailySpend,
                    sleep: Number((dailySleepMins / 60).toFixed(1))
                });
            }

            setData(dailyData);
            analyzeCorrelation(dailyData);
            setLoading(false);
        };

        fetchData();
    }, [user]);

    const analyzeCorrelation = (chartData: any[]) => {
        // Simple heuristic: Count days with high spend (>1000) and low sleep (<6h)
        let patternCount = 0;
        let info = "";

        const highSpendDays = chartData.filter(d => d.spend > 1000).length;
        const lowSleepDays = chartData.filter(d => d.sleep < 6 && d.sleep > 0).length;

        chartData.forEach(d => {
            if (d.spend > 1000 && d.sleep < 6 && d.sleep > 0) patternCount++;
        });

        if (patternCount > 0) {
            info = `On ${patternCount} days, high spending correlated with lower sleep.`;
        } else if (lowSleepDays > 2) {
            info = "You've had multiple days with low sleep recently.";
        } else if (highSpendDays > 2) {
            info = "Spending has been active lately. Check your budget.";
        } else {
            info = "Your sleep and spending patterns look balanced.";
        }
        setCorrelationMsg(info);
    };

    if (loading) return <div className="h-[300px] flex items-center justify-center bg-white border rounded-xl"><Loader2 className="animate-spin text-slate-300" /></div>;

    // Check if empty
    const isEmpty = data.every(d => d.spend === 0 && d.sleep === 0);

    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Sleep vs. Spending</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 rounded-md">Last 7 Days</span>
            </div>

            {isEmpty ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-slate-400 text-sm">
                    <p>No enough data yet.</p>
                    <p className="text-xs mt-1">Track sleep & expenses to see insights.</p>
                </div>
            ) : (
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                            <YAxis yAxisId="left" orientation="left" stroke="#6366f1" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}h`} domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                                itemStyle={{ padding: 0 }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                            <Bar yAxisId="left" dataKey="spend" name="Spending (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                            <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sleep (h)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} connectNulls />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {!isEmpty && (
                <p className="text-xs text-center text-slate-500">
                    Analysis: <span className="font-medium text-slate-700">{correlationMsg}</span>
                </p>
            )}
        </div>
    );
}
