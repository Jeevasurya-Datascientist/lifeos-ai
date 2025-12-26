import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate("/");
            toast.success("Welcome back!");
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[100px] animate-pulse delay-1000" />

            <Card className="w-full max-w-md shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl text-white relative z-10">
                <CardHeader className="space-y-3 text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-2">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        Sign in to continue your journey
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <div className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></div>}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <p className="text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium transition-colors">
                            Create free account
                        </Link>
                    </p>
                </CardFooter>
                <div className="mt-8 text-center text-slate-400 text-xs flex flex-wrap justify-center gap-4">
                    <a href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                    <a href="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">Terms & Conditions</a>
                    <a href="/refund-policy" className="hover:text-emerald-400 transition-colors">Refund Policy</a>
                    <a href="/shipping-policy" className="hover:text-emerald-400 transition-colors">Shipping Policy</a>
                    <a href="/contact-us" className="hover:text-emerald-400 transition-colors">Contact Us</a>
                </div>
            </Card>
        </div>
    );
}
