import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Smartphone, Tv, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RechargeBills() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Payment Mock State
    const [amount, setAmount] = useState("");
    const [number, setNumber] = useState("");

    const handlePayment = () => {
        if (!amount || !number) {
            toast.error("Please fill in all details");
            return;
        }
        setLoading(true);

        // Mock API Call
        setTimeout(() => {
            setLoading(false);
            toast.success("Payment Successful! Cashback: ₹10");
            navigate("/");
        }, 1500);
    };

    return (
        <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen bg-slate-50">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold">Recharge & Pay Bills</h1>
            </header>

            <Tabs defaultValue="mobile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="mobile" className="flex flex-col items-center gap-1 py-3 h-auto">
                        <Smartphone className="w-5 h-5" />
                        <span className="text-xs">Mobile</span>
                    </TabsTrigger>
                    <TabsTrigger value="dth" className="flex flex-col items-center gap-1 py-3 h-auto">
                        <Tv className="w-5 h-5" />
                        <span className="text-xs">DTH</span>
                    </TabsTrigger>
                    <TabsTrigger value="electricity" className="flex flex-col items-center gap-1 py-3 h-auto">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs">Electricity</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="mobile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mobile Recharge</CardTitle>
                            <CardDescription>Prepaid/Postpaid</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Mobile Number</Label>
                                <Input
                                    placeholder="+91"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="₹"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handlePayment} disabled={loading}>
                                {loading ? "Processing..." : "Pay Now"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dth">
                    <Card>
                        <CardHeader>
                            <CardTitle>DTH Recharge</CardTitle>
                            <CardDescription>Select Operator</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Subscriber ID</Label>
                                <Input
                                    placeholder="ID"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="₹"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handlePayment} disabled={loading}>
                                {loading ? "Processing..." : "Pay Now"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="electricity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Electricity Bill</CardTitle>
                            <CardDescription>Select Board</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Consumer Number</Label>
                                <Input
                                    placeholder="No."
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="₹"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handlePayment} disabled={loading}>
                                {loading ? "Processing..." : "Pay Bill"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
