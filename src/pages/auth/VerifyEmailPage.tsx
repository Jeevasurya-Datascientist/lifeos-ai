import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-3xl" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/30 blur-3xl" />
            </div>

            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-md relative z-10">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <MailCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        Check your inbox
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Once verified, you can sign in to access your dashboard.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <Link to="/login">
                            Back to Login
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full">
                        <Link to="/">
                            Resend Email
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
