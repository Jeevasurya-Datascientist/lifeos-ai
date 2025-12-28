import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { addTransaction } from "@/lib/transactions";
// import { useQueryClient } from "@tanstack/react-query";

export function AddTransactionDialog() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
    // const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
    });

    const categories = {
        expense: ["Food", "Transport", "Shopping", "Bills", "Rent", "Health", "Entertainment", "Other"],
        income: ["Salary", "Freelance", "Gift", "Investment", "Other"],
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

            await addTransaction(user.id, {
                amount,
                type: activeTab,
                category: formData.category,
                description: formData.description,
                date: formData.date
            });

            toast.success(`${activeTab === "income" ? "Income" : "Expense"} added!`);
            setOpen(false);
            setFormData({
                amount: "",
                category: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
            });

        } catch (error: any) {
            toast.error(error.message || "Failed to add transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg p-0">
                    <PlusCircle className="w-8 h-8" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Enter the details of your expense or income below.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="expense" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expense">Expense</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <TabsContent value="expense" className="mt-0 space-y-4">
                            {/* Fields are same for both, just context changes */}
                        </TabsContent>
                        <TabsContent value="income" className="mt-0 space-y-4">
                        </TabsContent>

                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select required onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories[activeTab].map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input
                                placeholder="What was this for?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Adding..." : `Add ${activeTab === 'income' ? 'Income' : 'Expense'}`}
                        </Button>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
