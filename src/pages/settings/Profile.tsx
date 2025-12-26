import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, LogOut, Download, Shield, RefreshCw, FileText, Truck, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { language, setLanguage } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [avatarSeed, setAvatarSeed] = useState(user?.id || "seed");

    const handleSave = async () => {
        setLoading(true);
        // Simulate save
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated successfully!");
        }, 1000);
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const handleExport = () => {
        toast.info("Exporting your data... Check your email.");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Profile & Settings</h1>
            </header>

            <div className="max-w-md mx-auto space-y-6">
                {/* Profile Card */}
                <Card>
                    <CardHeader className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => setAvatarSeed(Math.random().toString())}>
                            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCw className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-center">
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>{user?.phone}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                                    <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                                    <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                                    <SelectItem value="kn">Kannada (ಕನ್ನಡ)</SelectItem>
                                    <SelectItem value="ml">Malayalam (മലയാളം)</SelectItem>
                                    <SelectItem value="od">Odia (ଓଡ଼ିଆ)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* Settings Actions */}
                <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-auto py-3 bg-white" onClick={handleExport}>
                        <Download className="w-5 h-5 mr-3 text-slate-500" />
                        <div className="text-left">
                            <span className="block font-medium">Export Data</span>
                            <span className="text-xs text-muted-foreground">Get a copy of your financial data</span>
                        </div>
                    </Button>

                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1">Legal & Support</h3>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-slate-100" onClick={() => navigate('/privacy-policy')}>
                                <Shield className="w-4 h-4 mr-3 text-slate-500" />
                                <span className="text-sm text-slate-700">Privacy Policy</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-slate-100" onClick={() => navigate('/terms-and-conditions')}>
                                <FileText className="w-4 h-4 mr-3 text-slate-500" />
                                <span className="text-sm text-slate-700">Terms & Conditions</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-slate-100" onClick={() => navigate('/refund-policy')}>
                                <RefreshCw className="w-4 h-4 mr-3 text-slate-500" />
                                <span className="text-sm text-slate-700">Cancellation & Refund</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-slate-100" onClick={() => navigate('/shipping-policy')}>
                                <Truck className="w-4 h-4 mr-3 text-slate-500" />
                                <span className="text-sm text-slate-700">Shipping Policy</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 hover:bg-slate-100" onClick={() => navigate('/contact-us')}>
                                <Phone className="w-4 h-4 mr-3 text-slate-500" />
                                <span className="text-sm text-slate-700">Contact Us</span>
                            </Button>
                        </div>
                    </div>

                    <Button variant="destructive" className="w-full mt-6" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
                LifeOS AI v1.1.0 (Multilingual)
            </p>
        </div>
    );
}
