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
import { Wallet, TrendingDown, Heart, Sparkles, Activity, Trophy, Gift, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Home() {
    const { user, signOut, profile } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number | null>(null);
    const [monthlySpend, setMonthlySpend] = useState(0);
    const [budget, setBudget] = useState(20000);
    const [wellnessScore, setWellnessScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            // ... (Keep existing fetch logic for simplicity of migration, can refactor later)
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const today = now.toISOString().split('T')[0];

            const walletPromise = supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
            const spendPromise = supabase.from("transactions").select("amount").eq("user_id", user.id).eq("type", "expense").gte("date", startOfMonth);
            const onboardingPromise = supabase.from("onboarding_responses").select("income_range").eq("user_id", user.id).maybeSingle();
            const wellnessPromise = supabase.from("wellness_entries").select("type, value").eq("user_id", user.id).eq("date", today);

            const [walletRes, spendRes, onboardingRes, wellnessRes] = await Promise.all([
                walletPromise, spendPromise, onboardingPromise, wellnessPromise
            ]);

            setBalance(walletRes.data?.balance ?? 0);
            setMonthlySpend(spendRes.data?.reduce((sum, t) => sum + t.amount, 0) || 0);

            if (onboardingRes.data?.income_range) {
                const lowerBound = parseInt(onboardingRes.data.income_range.split('-')[0].replace(/[^0-9]/g, '')) || 50000;
                setBudget(Math.floor(lowerBound * 0.4));
            }

            if (wellnessRes.data) {
                let sleepMinutes = 0;
                let waterMl = 0;
                wellnessRes.data.forEach(entry => {
                    if (entry.type === 'sleep') sleepMinutes += Number(entry.value);
                    if (entry.type === 'water') waterMl += Number(entry.value);
                });
                const sleepScore = Math.min((sleepMinutes / 420) * 50, 50);
                const waterScore = Math.min((waterMl / 2000) * 50, 50);
                setWellnessScore(Math.round(sleepScore + waterScore));
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleLogout = async () => { await signOut(); };
    const suggestion = getDailySuggestion(new Date().getHours(), balance || 0);
    const spendPercentage = Math.min((monthlySpend / budget) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
            {/* 1. Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-sm relative transition-all duration-300">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                        {t('hello')}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 animate-in fade-in">{user?.user_metadata?.full_name || "User"}</span>
                        <span className="inline-block animate-wave ml-2">👋</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                        {t('welcome')}
                        <span className="hidden md:inline-block h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Notifications />
                    <div onClick={() => navigate("/profile")} className="group relative cursor-pointer">
                        <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 to-fuchsia-500">
                            <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">{user?.phone ? user.phone.slice(-2) : "U"}</div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" />
                    </div>
                </div>
            </header>

            {/* 2. Hero Section (AI Focus & Quick Stats) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 group hover:shadow-indigo-900/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-20 opacity-20 bg-gradient-to-bl from-violet-500 to-transparent w-96 h-96 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 p-20 opacity-20 bg-gradient-to-tr from-blue-500 to-transparent w-96 h-96 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 pointer-events-none group-hover:opacity-30 transition-opacity"></div>

                    <div className="relative p-8 md:p-10 flex flex-col justify-between h-full min-h-[280px]">
                        <div className="space-y-6 max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-indigo-100 text-xs font-medium border border-white/10 backdrop-blur-md shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                <span className="uppercase tracking-wider">AI Insight</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-semibold leading-tight text-white drop-shadow-sm">
                                "{suggestion.text}"
                            </h2>
                            {suggestion.actionLabel && (
                                <Button
                                    onClick={() => toast.success("Action logged!")}
                                    className="bg-white/90 text-slate-900 hover:bg-white hover:scale-105 border-0 font-bold rounded-full px-6 py-6 shadow-xl transition-all"
                                >
                                    {suggestion.actionLabel} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="absolute right-6 bottom-6 hidden md:block opacity-10 group-hover:opacity-20 transition-opacity duration-700 transform scale-150">
                            <Activity className="w-48 h-48 rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Rewards Widget [NEW] */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-100 to-orange-50 p-1 border border-amber-100/50 shadow-lg shadow-amber-900/5 relative overflow-hidden group cursor-pointer" onClick={() => navigate("/games")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                    <div className="bg-white/60 backdrop-blur-xl h-full rounded-[20px] p-6 flex flex-col justify-between relative z-10 hover:bg-white/80 transition-colors">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg uppercase tracking-wider">Level 1</span>
                            </div>
                            <h3 className="text-slate-500 font-medium">LifeOS Points</h3>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-bold text-slate-800 tabular-nums tracking-tight">
                                    {profile?.points?.toLocaleString() || 0}
                                </span>
                                <span className="text-sm text-slate-400 font-medium">pts</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-500">
                                    <span>Next Reward</span>
                                    <span>500 pts</span>
                                </div>
                                <Progress value={((profile?.points || 0) / 500) * 100} className="h-2 bg-amber-100" indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500" />
                            </div>
                            <Button variant="ghost" className="w-full justify-between group-hover:bg-amber-100/50 text-amber-700 hover:text-amber-800">
                                Redeem Rewards <Gift className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Wallet Balance */}
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate("/transactions")}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${balance && balance > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {balance && balance > 0 ? "+ Active" : "Low Funds"}
                            </span>
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm">Total Balance</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                            {loading ? "..." : `₹${balance?.toLocaleString() ?? "0.00"}`}
                        </p>
                    </div>
                </div>

                {/* Monthly Spending */}
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate("/analytics")}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                {new Date().toLocaleString('default', { month: 'short' })}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-slate-500 font-medium text-sm">Monthly Spend</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <p className="text-3xl font-bold text-slate-900 tabular-nums">
                                        {loading ? "..." : `₹${monthlySpend.toLocaleString()}`}
                                    </p>
                                    <span className="text-xs text-slate-400 font-medium">/ ₹{(budget / 1000).toFixed(0)}k</span>
                                </div>
                            </div>
                            <div className="relative pt-2">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
                                    <div style={{ width: `${spendPercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${spendPercentage > 90 ? "bg-red-500" : "bg-rose-500"} transition-all duration-1000 ease-out`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wellness Score */}
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => navigate("/wellness")}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                                <Heart className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${wellnessScore >= 80 ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                                {wellnessScore >= 80 ? "Excellent" : wellnessScore >= 50 ? "Good" : "Focus Needed"}
                            </span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-slate-500 font-medium text-sm">Wellness Score</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                                    {loading ? "..." : wellnessScore}
                                </p>
                            </div>
                            <div className="flex gap-1 h-10 items-end pb-1">
                                {[20, 40, 60, 80, 100].map((step) => (
                                    <div key={step} className={`w-2.5 rounded-sm transition-all duration-500 ${wellnessScore >= step ? "bg-teal-500" : "bg-slate-200"}`} style={{ height: `${step}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white/50 backdrop-blur-sm rounded-3xl p-1 border border-white/60 shadow-sm">
                        <div className="bg-white rounded-[20px] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                                <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 -mr-2" onClick={() => navigate("/transactions")}>
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <TransactionsList limit={5} />
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
                        </div>
                        <QuickActions />
                    </section>

                    <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Bills</h3>
                        <UpcomingBills />
                    </section>
                </div>
            </div>

            <AddTransactionDialog />
        </div>
    );
}
