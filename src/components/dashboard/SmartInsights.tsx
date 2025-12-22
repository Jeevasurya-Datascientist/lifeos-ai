import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export function SmartInsights() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        currentMonthSpent: 0,
        lastMonthSpent: 0,
        pctChange: 0,
        prediction: 0,
        daysInMonth: 30
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchInsights = async () => {
            const now = new Date();
            const startCurrent = startOfMonth(now).toISOString();
            const endCurrent = endOfMonth(now).toISOString();

            const lastMonthDate = subMonths(now, 1);
            const startLast = startOfMonth(lastMonthDate).toISOString();
            const endLast = endOfMonth(lastMonthDate).toISOString();

            // Fetch Current Month
            const { data: currentData } = await supabase
                .from("transactions")
                .select("amount")
                .eq("user_id", user.id)
                .eq("type", "expense")
                .gte("date", startCurrent)
                .lte("date", endCurrent);

            // Fetch Last Month
            const { data: lastData } = await supabase
                .from("transactions")
                .select("amount")
                .eq("user_id", user.id)
                .eq("type", "expense")
                .gte("date", startLast)
                .lte("date", endLast);

            if (currentData && lastData) {
                const currentSum = currentData.reduce((acc, curr) => acc + curr.amount, 0);
                const lastSum = lastData.reduce((acc, curr) => acc + curr.amount, 0);

                // Calculate Projection
                const dayOfMonth = now.getDate();
                const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); // Days in current month
                const avgDaily = dayOfMonth > 0 ? currentSum / dayOfMonth : 0;
                const predicted = Math.round(avgDaily * totalDays);

                // Calculate % Change vs Last Month
                let pct = 0;
                if (lastSum > 0) {
                    pct = Math.round(((currentSum - lastSum) / lastSum) * 100);
                } else if (currentSum > 0) {
                    pct = 100;
                }

                setStats({
                    currentMonthSpent: currentSum,
                    lastMonthSpent: lastSum,
                    pctChange: pct,
                    prediction: predicted,
                    daysInMonth: totalDays
                });
            }
            setLoading(false);
        };

        fetchInsights();

        // Realtime Subscription
        const channel = supabase
            .channel('insights_transactions')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
                () => fetchInsights()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return (
            <Card className="bg-indigo-50 border-indigo-100 h-full flex items-center justify-center min-h-[140px]">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </Card>
        );
    }

    const isSpendingMore = stats.pctChange > 0;

    return (
        <Card className="bg-indigo-50 border-indigo-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-500" /> Smart Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vs Last Month</span>
                    <span className={`flex items-center font-medium ${isSpendingMore ? 'text-red-500' : 'text-green-600'}`}>
                        {isSpendingMore ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(stats.pctChange)}% {isSpendingMore ? 'Higher' : 'Lower'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Predicted End</span>
                    <span className="flex items-center text-indigo-600 font-bold">
                        ~₹{stats.prediction.toLocaleString()}
                    </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs text-indigo-800 italic">
                    {stats.currentMonthSpent > stats.lastMonthSpent
                        ? "You've already spent more than last month. Time to check the budget!"
                        : "Great job! You are spending less than last month so far."}
                </div>
            </CardContent>
        </Card>
    );
}
