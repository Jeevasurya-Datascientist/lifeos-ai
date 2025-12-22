import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";

interface BudgetOverviewProps {
    currentSpend: number;
}

export function BudgetOverview({ currentSpend }: BudgetOverviewProps) {
    const { user } = useAuth();
    const [budget, setBudget] = useState<number>(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [tempBudget, setTempBudget] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchBudget();
    }, [user]);

    const fetchBudget = async () => {
        try {
            const { data } = await supabase
                .from('user_settings')
                .select('monthly_budget')
                .eq('user_id', user?.id)
                .single();
            if (data) setBudget(data.monthly_budget || 0);
        } catch (error) {
            console.error('Error fetching budget:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const newBudget = parseFloat(tempBudget);
        if (isNaN(newBudget) || newBudget < 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        try {
            const { error } = await supabase
                .from('user_settings')
                .update({ monthly_budget: newBudget })
                .eq('user_id', user?.id);

            if (error) throw error;

            setBudget(newBudget);
            setIsDialogOpen(false);
            toast.success("Budget updated!");
        } catch (error) {
            console.error('Error updating budget:', error);
            toast.error("Failed to update budget");
        }
    };

    const percentage = budget > 0 ? Math.min((currentSpend / budget) * 100, 100) : 0;
    const isOverBudget = currentSpend > budget && budget > 0;

    return (
        <>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <div className="w-32 h-32 rounded-full bg-indigo-500 blur-3xl"></div>
                </div>

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-lg font-medium text-slate-200 flex items-center gap-2">
                        Monthly Budget
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setTempBudget(budget.toString());
                            setIsDialogOpen(true);
                        }}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-3xl font-bold tracking-tight">
                                ₹{currentSpend.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Spent of <span className="font-medium text-slate-300">₹{budget.toLocaleString()}</span> limit
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-2xl font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {Math.round(percentage)}%
                            </p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">used</p>
                        </div>
                    </div>

                    <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Monthly Budget</DialogTitle>
                        <DialogDescription>
                            Enter your spending limit for the month. We'll track your progress.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Monthly Limit (₹)</label>
                        <Input
                            value={tempBudget}
                            onChange={(e) => setTempBudget(e.target.value)}
                            type="number"
                            placeholder="e.g. 20000"
                            className="text-lg"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Budget</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
