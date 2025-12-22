import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            phone: phone,
        });

        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            setStep("otp");
            toast.success("OTP sent!");
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (otp === "978945") {
            localStorage.setItem("lifeos_mock_auth", "true");
            toast.success("Mock Login Successful!");
            window.location.href = "/"; // Force reload to pick up mock auth
            return;
        }

        const { error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: otp,
            type: "sms",
        });

        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Logged in successfully!");
            navigate("/");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome to LifeOS</CardTitle>
                    <CardDescription>
                        {step === "phone" ? "Enter your mobile number to continue" : "Enter the OTP sent to your mobile"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "phone" ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <Input
                                type="tel"
                                placeholder="+91 9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep("phone")}
                                disabled={loading}
                            >
                                Change Number
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
