import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle } from "lucide-react";
import { Database } from "@/types/database.types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Bill = Database["public"]["Tables"]["bills"]["Row"];

export function UpcomingBills() {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchBills = async () => {
            const { data } = await supabase
                .from("bills")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_paid", false)
                .order("due_date", { ascending: true })
                .limit(3);

            if (data) setBills(data);
            setLoading(false);
        };

        fetchBills();
    }, [user]);

    const markAsPaid = async (id: string) => {
        const { error } = await supabase.from("bills").update({ is_paid: true }).eq("id", id);
        if (!error) {
            setBills(bills.filter(b => b.id !== id));
            toast.success("Bill marked as paid!");
        }
    };

    if (loading) return <div className="text-sm text-muted-foreground">Loading bills...</div>;

    if (bills.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Upcoming Bills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">No pending bills! 🎉</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Upcoming Bills
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">{bill.title}</p>
                            <p className="text-xs text-red-500">Due {format(new Date(bill.due_date), "dd MMM")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">₹{bill.amount}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markAsPaid(bill.id)}>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
