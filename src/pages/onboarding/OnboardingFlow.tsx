import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Bell, Globe, DollarSign, Activity, Target } from "lucide-react";

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        language: "en",
        incomeRange: "",
        fixedExpenses: "",
        biggestStress: "",
        monthlyGoal: "",
        notifications: false,
    });

    const nextStep = () => {
        setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSkip = () => {
        // Navigate to dashboard without saving optional data
        navigate("/");
    };

    const finishOnboarding = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Update Profile (Language)
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ language: formData.language })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // 2. Save Onboarding Responses
            const { error: responseError } = await supabase
                .from("onboarding_responses")
                .insert({
                    user_id: user.id,
                    income_range: formData.incomeRange || null,
                    fixed_expenses: formData.fixedExpenses ? parseFloat(formData.fixedExpenses) : null,
                    biggest_stress: formData.biggestStress || null,
                    monthly_goal: formData.monthlyGoal || null,
                });

            if (responseError) throw responseError;

            // 3. Save User Settings (Notifications)
            const { error: settingsError } = await supabase
                .from("user_settings")
                .insert({
                    user_id: user.id,
                    notifications_enabled: formData.notifications,
                    currency: "INR",
                });

            if (settingsError) {
                // It might already exist if created via trigger, so try update if insert fails
                await supabase
                    .from("user_settings")
                    .update({ notifications_enabled: formData.notifications })
                    .eq("user_id", user.id);
            }

            toast.success("Profile Setup Complete!");
            navigate("/");
        } catch (error: any) {
            console.error("Onboarding Error:", error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Mock Request for Notification Permission
    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    setFormData({ ...formData, notifications: true });
                    toast.success("Notifications enabled!");
                } else {
                    toast.error("Notifications denied.");
                }
            });
        }
    };

    const steps = [
        // Step 0: Language
        {
            title: "Select Language",
            description: "Choose your preferred language",
            icon: <Globe className="w-10 h-10 text-primary mb-4" />,
            content: (
                <Select value={formData.language} onValueChange={(val) => setFormData({ ...formData, language: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                        <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                        <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
        // Step 1: Income
        {
            title: "Monthly Income",
            description: "This helps us tailor your budget",
            icon: <DollarSign className="w-10 h-10 text-primary mb-4" />,
            content: (
                <Select value={formData.incomeRange} onValueChange={(val) => setFormData({ ...formData, incomeRange: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Income Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="<20k">Less than ₹20,000</SelectItem>
                        <SelectItem value="20k-50k">₹20,000 - ₹50,000</SelectItem>
                        <SelectItem value="50k-1L">₹50,000 - ₹1 Lakh</SelectItem>
                        <SelectItem value=">1L">More than ₹1 Lakh</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
        // Step 2: Fixed Expenses
        {
            title: "Fixed Expenses",
            description: "Rent, EMI, etc. (Approximate)",
            icon: <DollarSign className="w-10 h-10 text-primary mb-4" />,
            content: (
                <Input
                    type="number"
                    placeholder="₹ Amount"
                    value={formData.fixedExpenses}
                    onChange={(e) => setFormData({ ...formData, fixedExpenses: e.target.value })}
                />
            ),
        },
        // Step 3: Stress
        {
            title: "Biggest Stress",
            description: "What worries you the most?",
            icon: <Activity className="w-10 h-10 text-primary mb-4" />,
            content: (
                <Select value={formData.biggestStress} onValueChange={(val) => setFormData({ ...formData, biggestStress: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Stress Factor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="money">Money Management</SelectItem>
                        <SelectItem value="work">Work Pressure</SelectItem>
                        <SelectItem value="family">Family/Life Balance</SelectItem>
                        <SelectItem value="health">Health Issues</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
        // Step 4: Goal
        {
            title: "Monthly Goal",
            description: "One thing you want to achieve",
            icon: <Target className="w-10 h-10 text-primary mb-4" />,
            content: (
                <Input
                    type="text"
                    placeholder="e.g. Save ₹5000"
                    value={formData.monthlyGoal}
                    onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                />
            ),
        },
        // Step 5: Notifications
        {
            title: "Stay Updated",
            description: "Get daily insights and alerts",
            icon: <Bell className="w-10 h-10 text-primary mb-4" />,
            content: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span>Enable Notifications</span>
                        <Button variant={formData.notifications ? "default" : "outline"} onClick={requestNotificationPermission}>
                            {formData.notifications ? "Enabled" : "Enable"}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">We promise not to spam (max 1-2 alerts/day)</p>
                </div>
            ),
        },
    ];

    const currentStepData = steps[step];

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md h-[500px] flex flex-col justify-between transition-all duration-300">
                <CardHeader className="text-center flex flex-col items-center">
                    {currentStepData.icon}
                    <CardTitle>{currentStepData.title}</CardTitle>
                    <CardDescription>{currentStepData.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                    {currentStepData.content}
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-4">
                    {step === 0 ? (
                        <Button variant="ghost" onClick={handleSkip}>Skip</Button>
                    ) : (
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                    )}

                    {step === steps.length - 1 ? (
                        <Button onClick={finishOnboarding} disabled={loading}>
                            {loading ? "Finishing..." : "Finish"}
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
