import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { Notifications } from "@/components/dashboard/Notifications";
import { getDailySuggestion } from "@/lib/suggestion-engine";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wallet, TrendingDown, Heart, Sparkles, Activity } from "lucide-react";

export default function Home() {
    const { user, signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number | null>(null);
    const [monthlySpend, setMonthlySpend] = useState(0);
    const [budget, setBudget] = useState(20000); // Default fallback
    const [wellnessScore, setWellnessScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const today = now.toISOString().split('T')[0];

            // 1. Fetch Wallet
            const walletPromise = supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", user.id)
                .maybeSingle();

            // 2. Fetch Monthly Spend
            const spendPromise = supabase
                .from("transactions")
                .select("amount")
                .eq("user_id", user.id)
                .eq("type", "expense")
                .gte("date", startOfMonth);

            // 3. Fetch Budget (from onboarding income or settings)
            const onboardingPromise = supabase
                .from("onboarding_responses")
                .select("income_range, fixed_expenses")
                .eq("user_id", user.id)
                .maybeSingle();

            // 4. Fetch Wellness for Today
            const wellnessPromise = supabase
                .from("wellness_entries")
                .select("type, value")
                .eq("user_id", user.id)
                .eq("date", today);

            const [walletRes, spendRes, onboardingRes, wellnessRes] = await Promise.all([
                walletPromise,
                spendPromise,
                onboardingPromise,
                wellnessPromise
            ]);

            // Set Balance
            setBalance(walletRes.data?.balance ?? 0);

            // Set Spend
            const totalSpend = spendRes.data?.reduce((sum, t) => sum + t.amount, 0) || 0;
            setMonthlySpend(totalSpend);

            // Set Budget (Simple Logic: Income lower bound * 0.4 or default 20k)
            if (onboardingRes.data?.income_range) {
                // Example range: "50000-100000". Take 50000.
                const lowerBound = parseInt(onboardingRes.data.income_range.split('-')[0].replace(/[^0-9]/g, '')) || 50000;
                setBudget(Math.floor(lowerBound * 0.4)); // Assume 40% for discretionary spend
            }

            // Calculate Wellness Score
            if (wellnessRes.data) {
                let sleepMinutes = 0;
                let waterMl = 0;
                wellnessRes.data.forEach(entry => {
                    if (entry.type === 'sleep') sleepMinutes += Number(entry.value);
                    if (entry.type === 'water') waterMl += Number(entry.value);
                });

                // Scoring Logic:
                // Sleep: 420m (7h) = 50 points
                // Water: 2000ml = 50 points
                const sleepScore = Math.min((sleepMinutes / 420) * 50, 50);
                const waterScore = Math.min((waterMl / 2000) * 50, 50);
                setWellnessScore(Math.round(sleepScore + waterScore));
            }

            setLoading(false);
        };

        fetchData();

        // Realtime Subscriptions could be added here similar to TransactionsList
        // For MVP dashboard, fetch on mount is acceptable, or use a context.
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const suggestion = getDailySuggestion(new Date().getHours(), balance || 0);

    // Derived UI values
    const spendPercentage = Math.min((monthlySpend / budget) * 100, 100);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* 1. Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {t('hello')}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{user?.user_metadata?.full_name || user?.phone || "User"}</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">{t('welcome')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Notifications />
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-600" onClick={handleLogout}>
                        {t('logout')}
                    </Button>
                    <div onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 cursor-pointer hover:scale-105 transition-transform">
                        {user?.phone ? user.phone.slice(-2) : "U"}
                    </div>
                </div>
            </header>

            {/* 2. Hero Section (AI Focus) */}
            <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
                <div className="absolute top-0 right-0 p-12 opacity-10 bg-gradient-to-bl from-purple-500 to-transparent w-64 h-64 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-12 opacity-10 bg-gradient-to-tr from-blue-500 to-transparent w-64 h-64 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium border border-white/10 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3" /> AI Suggestion
                        </div>
                        <h2 className="text-2xl md:text-3xl font-medium leading-tight text-indigo-50">
                            "{suggestion.text}"
                        </h2>
                        {suggestion.actionLabel && (
                            <Button
                                onClick={() => toast.success("Action logged!")}
                                className="bg-white text-slate-900 hover:bg-indigo-50 border-0 font-semibold"
                            >
                                {suggestion.actionLabel}
                            </Button>
                        )}
                    </div>
                    {/* Decorative Icon */}
                    <div className="hidden md:block opacity-80">
                        <Activity className="w-24 h-24 text-indigo-500/30" />
                    </div>
                </div>
            </section>

            {/* 3. Metrics Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance */}
                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/transactions")}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {balance && balance > 0 ? "Active" : "add money"}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500">Total Balance</h3>
                        <p className="text-3xl font-bold text-slate-800 tracking-tight">
                            {loading ? "..." : `₹${balance?.toLocaleString() ?? "0.00"}`}
                        </p>
                    </div>
                </div>

                {/* Monthly Spend */}
                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/analytics")}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">This Month</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500">Spending</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-slate-800">
                                {loading ? "..." : `₹${monthlySpend.toLocaleString()}`}
                            </p>
                            <span className="text-xs text-slate-400">/ ₹{(budget / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${spendPercentage > 90 ? "bg-red-500" : "bg-rose-500"}`}
                                style={{ width: `${spendPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Wellness */}
                <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/wellness")}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                            <Heart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                            {wellnessScore >= 80 ? "Excellent" : wellnessScore >= 50 ? "Good" : "Needs Focus"}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500">Wellness Score</h3>
                        <div className="flex items-center gap-4">
                            <p className="text-3xl font-bold text-slate-800">
                                {loading ? "..." : wellnessScore}
                            </p>
                            <div className="flex gap-1 h-8 items-end">
                                {/* Simple visualization of score */}
                                {[20, 40, 60, 80, 100].map((step) => (
                                    <div
                                        key={step}
                                        className={`w-2 rounded-sm transition-all duration-500 ${wellnessScore >= step ? "bg-teal-500" : "bg-slate-200"}`}
                                        style={{ height: `${step}%` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => navigate("/transactions")}>
                                View All
                            </Button>
                        </div>
                        <TransactionsList limit={5} />
                    </section>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
                        <QuickActions />
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Upcoming Bills</h3>
                        <UpcomingBills />
                    </section>
                </div>
            </div>

            <AddTransactionDialog />
        </div>
    );
}
