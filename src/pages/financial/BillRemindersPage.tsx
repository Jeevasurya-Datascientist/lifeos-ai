import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Zap, Smartphone, CreditCard, Building, School, Fuel, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function BillRemindersPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState<any[]>([]);

    // Auto Fetch State
    const [fetchIdentifier, setFetchIdentifier] = useState("");
    const [fetchCategory, setFetchCategory] = useState("Mobile Prepaid");
    const [fetchedBill, setFetchedBill] = useState<any>(null);

    // Manual State
    const [manualData, setManualData] = useState({
        category: "Electricity",
        biller_name: "",
        amount: "",
        due_date: "",
        frequency: "monthly"
    });

    const categories = [
        { id: "Mobile Prepaid", icon: Smartphone, label: "Mobile Recharge" },
        { id: "Electricity", icon: Zap, label: "Electricity" },
        { id: "Credit Card", icon: CreditCard, label: "Credit Card" },
        { id: "Loan EMI", icon: Building, label: "Loan EMI" },
        { id: "LPG Gas", icon: Fuel, label: "LPG Cylinder" },
        { id: "Education Fees", icon: School, label: "School/College Fees" },
        { id: "Broadband", icon: Zap, label: "Broadband/Postpaid" }, // Reusing Zap/Wifi icon idea
    ];

    useEffect(() => {
        if (user) fetchReminders();
    }, [user]);

    const fetchReminders = async () => {
        const { data } = await supabase.from('bill_reminders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
        if (data) setReminders(data);
    };

    const handleAutoFetch = async () => {
        if (!fetchIdentifier) {
            toast.error("Please enter a valid number/ID");
            return;
        }
        setLoading(true);

        // SIMULATION: In a real app, this would call an Edge Function -> BBPS/NPCI API
        setTimeout(() => {
            setFetchedBill({
                biller_name: `${fetchCategory} Provider`,
                amount: Math.floor(Math.random() * 1000) + 100, // Random amount
                due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
                identifier: fetchIdentifier
            });
            setLoading(false);
            toast.success("Bill details fetched successfully!");
        }, 1500);
    };

    const saveAutoBill = async () => {
        if (!user || !fetchedBill) return;
        setLoading(true);
        const { error } = await supabase.from('bill_reminders').insert({
            user_id: user.id,
            category: fetchCategory,
            biller_name: fetchedBill.biller_name,
            amount: fetchedBill.amount,
            due_date: fetchedBill.due_date,
            identifier: fetchedBill.identifier,
            frequency: "monthly",
            auto_pay: true // Assuming auto-fetched implies intent for auto-tracking
        });

        if (error) toast.error("Failed to save reminder");
        else {
            toast.success("Bill reminder added!");
            setFetchedBill(null);
            setFetchIdentifier("");
            fetchReminders();
        }
        setLoading(false);
    };

    const saveManualBill = async () => {
        if (!user) return;
        setLoading(true);
        const { error } = await supabase.from('bill_reminders').insert({
            user_id: user.id,
            ...manualData,
            amount: parseFloat(manualData.amount) || 0
        });

        if (error) toast.error("Failed to save reminder");
        else {
            toast.success("Bill reminder added!");
            setManualData({ ...manualData, biller_name: "", amount: "", due_date: "" });
            fetchReminders();
        }
        setLoading(false);
    };

    const deleteReminder = async (id: string) => {
        await supabase.from('bill_reminders').delete().eq('id', id);
        toast.success("Reminder removed");
        fetchReminders();
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-24">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Services & Bills</h1>
                <p className="text-slate-500">Automate your payments and never miss a due date.</p>
            </header>

            <Tabs defaultValue="auto" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="auto">Auto Fetch (BBPS)</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                </TabsList>

                {/* AUTO FETCH TAB */}
                <TabsContent value="auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fetch Bill Details</CardTitle>
                            <CardDescription>Enter your details to fetch automatically via Bharat BillPay.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={fetchCategory} onValueChange={setFetchCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Consumer Number / Mobile</Label>
                                    <Input
                                        placeholder="e.g. 9876543210 or Consumer ID"
                                        value={fetchIdentifier}
                                        onChange={(e) => setFetchIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>

                            {!fetchedBill ? (
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAutoFetch} disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Fetch Bill"}
                                </Button>
                            ) : (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-slate-500">Biller</p>
                                            <p className="font-bold text-slate-900">{fetchedBill.biller_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Due Amount</p>
                                            <p className="font-bold text-xl text-indigo-600">₹{fetchedBill.amount}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2">
                                        <span className="text-slate-500">Due Date: {fetchedBill.due_date}</span>
                                        <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full text-xs">Verified</span>
                                    </div>
                                    <Button className="w-full" onClick={saveAutoBill} disabled={loading}>
                                        Set Reminder
                                    </Button>
                                    <Button variant="ghost" className="w-full text-slate-500" onClick={() => setFetchedBill(null)}>Cancel</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MANUAL TAB */}
                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Manual Reminder</CardTitle>
                            <CardDescription>Manually track bills not on BBPS.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={manualData.category}
                                        onValueChange={(v) => setManualData({ ...manualData, category: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Biller Name / Description</Label>
                                    <Input
                                        placeholder="e.g. House Rent, Local Gym"
                                        value={manualData.biller_name}
                                        onChange={(e) => setManualData({ ...manualData, biller_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={manualData.amount}
                                        onChange={(e) => setManualData({ ...manualData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={manualData.due_date}
                                        onChange={(e) => setManualData({ ...manualData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={saveManualBill} disabled={loading}>
                                <Plus className="w-4 h-4 mr-2" /> Add Reminder
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Active Reminders List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Active Reminders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reminders.map((reminder) => {
                        const Icon = categories.find(c => c.id === reminder.category)?.icon || Calendar;
                        return (
                            <div key={reminder.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 line-clamp-1">{reminder.biller_name}</p>
                                            <p className="text-xs text-slate-500">{reminder.category}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteReminder(reminder.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-2xl font-bold text-slate-800">₹{reminder.amount?.toLocaleString()}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reminder.auto_pay ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                                            {reminder.auto_pay ? "Auto-Pay" : "Manual"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                                        <Calendar className="w-4 h-4" />
                                        Due: {format(new Date(reminder.due_date), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {reminders.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No active reminders. Add one above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
