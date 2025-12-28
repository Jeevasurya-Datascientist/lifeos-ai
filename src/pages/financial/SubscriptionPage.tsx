import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Shield, Star, Sparkles, Infinity, Bot, GraduationCap, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function SubscriptionPage() {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const handleSubscribe = async (planId: string, tierName: string) => {
        if (!user) return;
        setLoading(tierName);

        try {
            // 1. Create Subscription via Edge Function
            const { data: subscription, error } = await supabase.functions.invoke('create-razorpay-subscription', {
                body: { plan_id: planId },
                headers: {
                    Authorization: `Bearer ${await supabase.auth.getSession().then(({ data }) => data.session?.access_token || "")}`
                }
            });

            if (error) throw error;
            if (!subscription || !subscription.id) throw new Error("Failed to create subscription");

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: subscription.id,
                name: "LifeOS AI",
                description: `${tierName} Subscription`,
                image: "https://lifeos-ai.com/logo.png",
                handler: async function (response: any) {
                    toast.success(`Subscription Successful! ID: ${response.razorpay_subscription_id}`);

                    // 3. Update DB
                    await supabase.from('profiles').update({
                        subscription_tier: tierName.toLowerCase(),
                        stripe_subscription_id: response.razorpay_subscription_id,
                        razorpay_subscription_id: response.razorpay_subscription_id
                    }).eq('id', user.id);

                    await refreshProfile();
                    window.location.href = '/subscription?status=success';
                },
                prefill: {
                    name: user.email?.split('@')[0],
                    email: user.email,
                    contact: user.phone || ""
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error: any) {
            console.error("Subscription Error:", error);
            if (error.message?.includes("401")) {
                toast.error("Session expired or unauthorized. Please sign out and log in again.");
            } else if (error.message?.includes("Missing Razorpay Keys")) {
                toast.error("System configuration error: Payment keys missing.");
            } else {
                toast.error(error.message || "Failed to initiate subscription. Please try again.");
            }
        } finally {
            setLoading(null);
        }
    };

    const flexPlans = [
        {
            name: "Daily Plan",
            description: "24-Hour full access.",
            price: "₹12",
            originalPrice: "₹24",
            period: "/day",
            features: [
                "Full AI Analysis",
                "Unlock All Games",
                "Instant Activation"
            ],
            cta: "Get Daily Pass",
            gradient: "from-amber-200 to-yellow-100",
            border: "border-amber-200",
            buttonVariant: "outline" as const,
            icon: Zap,
            planId: "plan_daily_new"
        },
        {
            name: "Monthly Plan",
            description: "Most popular choice.",
            price: "₹99",
            originalPrice: "₹150",
            period: "/mo",
            features: [
                "Everything in Daily",
                "Progress Tracking",
                "Cancel Anytime"
            ],
            cta: "Start Monthly",
            gradient: "from-blue-500/10 to-cyan-500/10",
            border: "border-blue-500/30",
            buttonVariant: "default" as const,
            icon: Sparkles,
            popular: true,
            planId: "plan_monthly_new"
        },
        {
            name: "Yearly Plan",
            description: "Best value for long term.",
            price: "₹999",
            originalPrice: "₹1200",
            period: "/yr",
            save: "Save 30%",
            features: [
                "All Pro Features",
                "Priority Support",
                "Early Access to New Features"
            ],
            cta: "Go Yearly",
            gradient: "from-indigo-500/10 to-purple-500/10",
            border: "border-indigo-500/30",
            buttonVariant: "outline" as const,
            icon: Crown,
            planId: "plan_yearly_new"
        }
    ];

    const rolePlans = [
        {
            name: "Student",
            description: "Essential tools for learners.",
            price: "₹49",
            period: "/mo",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            icon: GraduationCap,
            features: ["Study Focus Tools", "Career Roadmap", "Exam Stress Management"],
            planId: "plan_student_basic"
        },
        {
            name: "Professional",
            description: "Power tools for career growth.",
            price: "₹199",
            period: "/mo",
            bg: "bg-slate-50",
            border: "border-slate-200",
            icon: Briefcase,
            features: ["Advanced Analytics", "Meeting AI Assistant", "Financial Forecasting"],
            planId: "plan_pro_basic"
        }
    ];

    return (
        <div className="min-h-full py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-16">

            {/* Header Section */}
            <div className="text-center space-y-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase tracking-wide text-xs">Unlock your potential</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Access Level</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                    Flexible plans designed for everyone.
                </p>
            </div>

            {/* Main Time-Based Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {flexPlans.map((plan) => (
                    <div
                        key={plan.name}
                        className={cn(
                            "relative rounded-3xl p-8 transition-all duration-300",
                            "bg-white border",
                            plan.border,
                            plan.popular ? "shadow-2xl scale-105 z-10 ring-4 ring-indigo-500/10" : "shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                Most Popular
                            </div>
                        )}
                        {plan.save && (
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                {plan.save}
                            </div>
                        )}

                        <div className={cn("absolute inset-0 rounded-3xl bg-gradient-to-br opacity-50 pointer-events-none", plan.gradient)} />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <plan.icon className="w-5 h-5 text-indigo-600" />
                                    {plan.name}
                                </h3>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    <span className="text-lg text-slate-400 font-medium line-through decoration-slate-400/50">{plan.originalPrice}</span>
                                    <span className="text-slate-500 font-medium text-sm">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="h-px w-full bg-slate-100" />

                            <ul className="space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                                        <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-green-600">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={cn("w-full h-12 rounded-xl font-bold text-base transition-all",
                                    plan.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25" : ""
                                )}
                                variant={plan.buttonVariant}
                                disabled={loading === plan.name}
                                onClick={() => handleSubscribe(plan.planId, plan.name)}
                            >
                                {loading === plan.name ? 'Processing...' : plan.cta}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Specialized Role Plans */}
            <div className="max-w-4xl mx-auto pt-8 border-t border-slate-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Tailored for You</h2>
                    <p className="text-slate-500">Specialized plans with exclusive features for your role.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {rolePlans.map((plan) => (
                        <div key={plan.name} className={cn("p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-all cursor-pointer bg-white", plan.border)}>
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", plan.bg)}>
                                <plan.icon className="w-8 h-8 text-slate-700" />
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-1">
                                <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500">{plan.description}</p>
                                <div className="text-sm font-semibold text-slate-900 pt-1">
                                    {plan.price} <span className="text-slate-400 font-normal">{plan.period}</span>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => handleSubscribe(plan.planId, plan.name)} className="shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-900">
                                Select
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Section */}
            <div className="mt-16 text-center">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
                    <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-6 h-6" /> SecurePay</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Bot className="w-6 h-6" /> AI Powered</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Star className="w-6 h-6" /> 5-Star Rated</div>
                </div>
            </div>
        </div>
    );
}
