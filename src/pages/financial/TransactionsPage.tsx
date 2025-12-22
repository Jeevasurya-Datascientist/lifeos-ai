import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { BudgetOverview } from "@/components/financial/BudgetOverview";
import { getAICompletion } from "@/lib/aiService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function TransactionsPage() {
    const { user } = useAuth();
    const [monthlySpend, setMonthlySpend] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [showInsight, setShowInsight] = useState(false);

    useEffect(() => {
        if (!user) return;

        fetchMonthlySpend();

        const subscription = supabase
            .channel('transactions_page_spend')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
                () => {
                    // Re-fetch total to ensure accuracy (simplest for aggregates)
                    fetchMonthlySpend();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const fetchMonthlySpend = async () => {
        const start = startOfMonth(new Date()).toISOString();
        const end = endOfMonth(new Date()).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user?.id)
            .eq('type', 'expense')
            .gte('date', start)
            .lte('date', end);

        if (!error && data) {
            const total = data.reduce((sum, t) => sum + Number(t.amount), 0);
            setMonthlySpend(total);
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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Transactions</h1>
                    <p className="text-muted-foreground">Manage your income and expenses.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleAnalyzeSpending}
                        disabled={isAnalyzing}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analyze Spending
                    </Button>
                    <AddTransactionDialog />
                </div>
            </header>

            {/* Budget Overview */}
            <BudgetOverview currentSpend={monthlySpend} />

            <div className="grid gap-6">
                <TransactionsList limit={50} />
            </div>

            {/* AI Insight Modal */}
            <Dialog open={showInsight} onOpenChange={setShowInsight}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            AI Financial Insight
                        </DialogTitle>
                        <DialogDescription>
                            Based on your last 20 transactions.
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
