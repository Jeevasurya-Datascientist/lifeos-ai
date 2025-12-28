import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Shield, Star, Sparkles, Infinity, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Types for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function SubscriptionPage() {
    const { user, refreshProfile } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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
            // Force authorization header to prevent stale session issues
            const { data: subscription, error } = await supabase.functions.invoke('create-razorpay-subscription', {
                body: { plan_id: planId },
                headers: {
                    Authorization: `Bearer ${await supabase.auth.getSession().then(({ data }) => data.session?.access_token || "")}`
                }
            });

            if (error) throw error;
            if (!subscription || !subscription.id) throw new Error("Failed to create subscription");

            // 2. Open Razorpay Checkout
            // NOTE: Replace 'YOUR_KEY_ID' with your actual Razorpay Key ID
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: subscription.id,
                name: "LifeOS AI",
                description: `${tierName} Subscription`,
                image: "https://lifeos-ai.com/logo.png", // Replace with valid logo URL
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

    const plans = [
        {
            name: "Daily",
            description: "24-Hour full access power pass",
            price: "₹9",
            period: "/day",
            features: [
                "Unlock All Features",
                "Try Premium Games",
                "Full AI Analysis",
                "Instant Activation"
            ],
            cta: "Get Daily Pass",
            gradient: "from-amber-200 to-yellow-100",
            border: "border-amber-200",
            buttonVariant: "outline" as const,
            icon: Zap,
            planId: "plan_daily_placeholder"
        },
        {
            name: "Weekly",
            description: "7-Day trial pass for full feature access",
            price: "₹49",
            period: "/week",
            features: [
                "Full Pro Access",
                "Brain Training Unlocked",
                "Advanced AI Models",
                "Cancel Anytime"
            ],
            cta: "Start 7-Day Pass",
            gradient: "from-blue-500/10 to-cyan-500/10",
            border: "border-blue-500/30",
            buttonVariant: "outline" as const,
            icon: Sparkles,
            planId: "plan_weekly_placeholder" // Replace with real Razorpay Plan ID
        },
        {
            name: "Student",
            description: "Affordable access for learners",
            price: billingCycle === 'monthly' ? "₹199" : "₹1,999",
            period: billingCycle === 'monthly' ? "/mo" : "/yr",
            save: billingCycle === 'yearly' ? "Save 16%" : null,
            features: [
                "Everything in Basic",
                "Unlimited Brain Training",
                "Career & Skill Tracking",
                "Basic AI Chat",
                "Study Focus Tools"
            ],
            cta: "Get Student Plan",
            gradient: "from-green-500/10 to-emerald-500/10",
            border: "border-green-500/30",
            buttonVariant: "default" as const,
            icon: Bot,
            popular: true,
            highlight: true,
            planId: "plan_student_placeholder" // Replace with real Razorpay Plan ID
        },
        {
            name: "Pro",
            description: "Maximum power for professionals",
            price: billingCycle === 'monthly' ? "₹699" : "₹6,999",
            period: billingCycle === 'monthly' ? "/mo" : "/yr",
            save: billingCycle === 'yearly' ? "Save 17%" : null,
            features: [
                "Everything in Student",
                "Priority AI Response (GPT-4)",
                "Detailed Financial Analytics",
                "Data Export & API Access",
                "Premium Support"
            ],
            cta: "Upgrade to Pro",
            gradient: "from-indigo-500/10 to-purple-500/10",
            border: "border-indigo-500/30",
            buttonVariant: "default" as const,
            icon: Crown,
            planId: "plan_RvuYWDWlwSbY00" // Existing ID
        }
    ];

    return (
        <div className="min-h-full py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12">

            {/* Header Section */}
            <div className="text-center space-y-6 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase tracking-wide text-xs">Unlock your potential</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                    Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Operating System</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                    Upgrade to LifeOS Pro to unlock the full power of AI automation, unlimited brain training, and premium insights.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-8">
                    <span className={cn("text-sm font-semibold transition-colors", billingCycle === 'monthly' ? "text-slate-900" : "text-slate-400")}>Monthly</span>
                    <Switch
                        checked={billingCycle === 'yearly'}
                        onCheckedChange={(c) => setBillingCycle(c ? 'yearly' : 'monthly')}
                        className="data-[state=checked]:bg-indigo-600"
                    />
                    <span className={cn("text-sm font-semibold transition-colors flex items-center gap-2", billingCycle === 'yearly' ? "text-slate-900" : "text-slate-400")}>
                        Yearly
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Save 17%</span>
                    </span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={cn(
                            "relative rounded-3xl p-8 transition-all duration-300",
                            "bg-white border",
                            plan.border,
                            plan.highlight ? "shadow-2xl scale-105 z-10 ring-4 ring-indigo-500/10" : "shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className={cn("absolute inset-0 rounded-3xl bg-gradient-to-br opacity-50 pointer-events-none", plan.gradient)} />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {plan.icon && <plan.icon className={cn("w-5 h-5", plan.name === 'Lifetime' ? "text-amber-500" : "text-indigo-600")} />}
                                    {plan.name}
                                </h3>
                                {plan.icon && plan.name === 'Lifetime' && <Infinity className="w-5 h-5 text-amber-500" />}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
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
                                    plan.name === 'Lifetime' ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25" :
                                        plan.highlight ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25" : ""
                                )}
                                variant={plan.buttonVariant}
                                disabled={loading === plan.name}
                                onClick={() => plan.planId && handleSubscribe(plan.planId, plan.name)}
                            >
                                {loading === plan.name ? 'Processing...' : plan.cta}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trust Section */}
            <div className="mt-16 text-center">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by Productivity Enthusiasts</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
                    {/* Placeholder Logos */}
                    <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-6 h-6" /> SecurePay</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Bot className="w-6 h-6" /> AI Powered</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Star className="w-6 h-6" /> 5-Star Rated</div>
                </div>
            </div>
        </div>
    );
}
