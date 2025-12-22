import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Crown } from "lucide-react";
import { toast } from "sonner";

export default function Plans() {
    const navigate = useNavigate();

    const handleSubscribe = (plan: string) => {
        toast.loading(`Processing ${plan} subscription...`);
        setTimeout(() => {
            toast.dismiss();
            toast.success(`Welcome to ${plan}!`);
            navigate("/");
        }, 2000);
    };

    return (
        <div className="p-4 min-h-screen bg-slate-50">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" /> Premium Plans
                </h1>
            </header>

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Pro Plan */}
                <Card className="border-2 border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                        Recommended
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Pro</CardTitle>
                        <CardDescription>Everything you need for smarter living</CardDescription>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">₹99</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> <span>Daily AI Planning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> <span>Spend Prediction</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> <span>Smart Alerts</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubscribe("Pro")}>
                            Subscribe Now
                        </Button>
                    </CardFooter>
                </Card>

                {/* Max Plan */}
                <Card className="border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-amber-700">Max</CardTitle>
                        <CardDescription>The ultimate AI life assistant</CardDescription>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">₹299</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" /> <span>Everything in Pro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" /> <span>Priority AI Response</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-amber-600" /> <span>Monthly Life Summary</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => handleSubscribe("Max")}>
                            Go Max
                        </Button>
                    </CardFooter>
                </Card>

                {/* Free Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Free</CardTitle>
                        <CardDescription>Basic features to get started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 opacity-75">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-slate-500" /> <span>Basic Money Awareness</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-slate-500" /> <span>Limited AI Suggestions</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
