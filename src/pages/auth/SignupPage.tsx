import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket, User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            navigate("/");
        }
    }, [user, authLoading, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user && !data.session) {
                // Email confirmation required
                toast.success("Account created! Please verify your email.");
                navigate("/verify-email");
            } else {
                // Auto login or no verification
                toast.success("Welcome to LifeOS AI!");
                // Navigation handled by useEffect
            }

        } catch (error: any) {
            console.error("Signup error:", error);
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse delay-1000" />

            <Card className="w-full max-w-md shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl text-white relative z-10">
                <CardHeader className="space-y-3 text-center pb-8 pt-8">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-2">
                        <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        Start your journey to financial freedom
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all border-0" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <div className="flex items-center">Get Started <ArrowRight className="ml-2 w-4 h-4" /></div>}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium transition-colors">
                            Sign in
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
