import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Password reset link sent!");
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[100px] animate-pulse delay-1000" />

            <Card className="w-full max-w-md shadow-2xl border-white/10 bg-white/5 backdrop-blur-xl text-white relative z-10">
                <CardHeader className="space-y-3 text-center pb-6 pt-8">
                    {!submitted && (
                        <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-2">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    )}
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                        {submitted ? "Check your email" : "Reset Password"}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        {submitted
                            ? "We've sent a password reset link to your email address."
                            : "Enter your email to receive a reset link"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {submitted ? (
                        <div className="flex flex-col items-center space-y-6 py-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white">
                                <Link to="/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
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
                            <Button
                                type="submit"
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!submitted && (
                    <CardFooter className="flex justify-center pb-8">
                        <Link to="/login" className="flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
