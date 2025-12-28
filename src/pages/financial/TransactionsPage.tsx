import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { BudgetOverview } from "@/components/financial/BudgetOverview";
import { getAICompletion } from "@/lib/aiService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, TrendingUp, TrendingDown, Calendar, Zap, Bell } from "lucide-react";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function TransactionsPage() {
    const { user } = useAuth();
    const [monthlyStats, setMonthlyStats] = useState({ income: 0, expense: 0 });
    const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [showInsight, setShowInsight] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        fetchMonthlyStats();
        fetchUpcomingBills();

        const subscription = supabase
            .channel('transactions_page_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchMonthlyStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bill_reminders' }, fetchUpcomingBills)
            .subscribe();

        return () => { subscription.unsubscribe(); };
    }, [user]);

    const fetchUpcomingBills = async () => {
        const { data } = await supabase
            .from('bill_reminders')
            .select('*')
            .eq('user_id', user?.id)
            .gte('due_date', new Date().toISOString().split('T')[0]) // Future dates
            .order('due_date', { ascending: true })
            .limit(3);
        if (data) setUpcomingBills(data);
    };

    const fetchMonthlyStats = async () => {
        const start = startOfMonth(new Date()).toISOString();
        const end = endOfMonth(new Date()).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', user?.id)
            .gte('date', start)
            .lte('date', end);

        if (!error && data) {
            let income = 0;
            let expense = 0;
            data.forEach(t => {
                if (t.type === 'income') income += Number(t.amount);
                else if (t.type === 'expense') expense += Number(t.amount);
            });
            setMonthlyStats({ income, expense });
        }
    };

    const handleAnalyzeSpending = async () => {
        setIsAnalyzing(true);
        try {
            // 1. Fetch recent transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user?.id)
                .order('date', { ascending: false })
                .limit(30);

            if (!transactions || transactions.length === 0) {
                toast.info("Not enough transactions to analyze.");
                setIsAnalyzing(false);
                return;
            }

            // 2. Prepare Prompt
            const txSummary = transactions.map(t =>
                `- ${t.date}: ${t.description || t.category} (₹${t.amount})`
            ).join("\n");

            const messages = [
                {
                    role: "system" as const,
                    content: "You are an expert financial advisor using the 'LifeOS AI' persona. Analyze the user's last 30 transactions to find patterns. Provide a friendly, motivating response with:\n1. 📊 **Trend**: One key observation about their spending.\n2. 💡 **Action**: One specific, high-impact tip to save money this week.\nKeep it under 60 words and strictly actionable."
                },
                {
                    role: "user" as const,
                    content: `Here are my recent transactions:\n${txSummary}\n\nAnalyze my spending and guide me.`
                }
            ];

            // 3. Get AI Insight
            const insight = await getAICompletion(messages);
            setAiInsight(insight);
            setShowInsight(true);

        } catch (error) {
            console.error("AI Analysis Error:", error);
            toast.error("Failed to analyze spending.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Transactions</h1>
                    <p className="text-muted-foreground">Manage your income and expenses.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Monthly Summary Cards */}
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2 px-3">
                            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Income</p>
                                <p className="text-lg font-bold text-emerald-600">₹{monthlyStats.income.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex items-center gap-2 px-3">
                            <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Expense</p>
                                <p className="text-lg font-bold text-rose-600">₹{monthlyStats.expense.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleAnalyzeSpending}
                        disabled={isAnalyzing}
                        className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze Spending
                    </Button>
                </div>
            </header>

            {/* Budget Overview */}
            <BudgetOverview currentSpend={monthlyStats.expense} />

            {/* Upcoming Bills Section */}
            {upcomingBills.length > 0 && (
                <div className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-indigo-500" />
                            Upcoming Bills
                        </h3>
                        <Button variant="link" size="sm" className="text-indigo-600 h-auto p-0" onClick={() => navigate("/recharge")}>
                            Manage All
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {upcomingBills.map(bill => (
                            <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{bill.biller_name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(bill.due_date), 'MMM d')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{bill.amount}</p>
                                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-full">Due Soon</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {upcomingBills.length === 0 && (
                <div className="bg-indigo-50/50 rounded-xl border border-dashed border-indigo-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full shadow-sm text-indigo-500">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900">No Upcoming Bills</p>
                            <p className="text-xs text-indigo-600/80">Set reminders for Recharge, Rent, etc.</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700" onClick={() => navigate("/recharge")}>
                        Add Reminder
                    </Button>
                </div>
            )}

            <div className="grid gap-6">
                <TransactionsList limit={50} />
            </div>

            <AddTransactionDialog />

            {/* AI Insight Modal */}
            <Dialog open={showInsight} onOpenChange={setShowInsight}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            AI Financial Insight
                        </DialogTitle>
                        <DialogDescription>
                            Based on your last 30 transactions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-indigo-50 p-4 rounded-lg text-indigo-900 border border-indigo-100 text-sm leading-relaxed">
                        {aiInsight}
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowInsight(false)}>Message Received</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
