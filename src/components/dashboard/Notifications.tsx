import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function Notifications() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<{ title: string, msg: string, type: 'urgent' | 'info' }[]>([]);
    const [unread, setUnread] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkAlerts = async () => {
            const newAlerts: typeof alerts = [];

            // 1. Check Bills
            const { data: bills } = await supabase
                .from("bills")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_paid", false)
                .lt("due_date", new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()); // Due in 5 days

            if (bills && bills.length > 0) {
                newAlerts.push({
                    title: "Bill Due Soon",
                    msg: `You have ${bills.length} bill(s) due this week.`,
                    type: 'urgent'
                });
            }

            // 2. Check Overspending (Mock Logic: > 2000 today)
            const today = new Date().toISOString().split("T")[0];
            const { data: todayTx } = await supabase
                .from("transactions")
                .select("amount")
                .eq("user_id", user.id)
                .eq("type", "expense")
                .eq("date", today);

            const todaySpend = todayTx?.reduce((sum, t) => sum + t.amount, 0) || 0;
            if (todaySpend > 2000) {
                newAlerts.push({
                    title: "Overspending Alert 🚨",
                    msg: `You've spent ₹${todaySpend} today. Careful!`,
                    type: 'urgent'
                });
            }

            setAlerts(newAlerts);
            setUnread(newAlerts.length > 0);
        };
        checkAlerts();
    }, [user]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unread && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <div className="space-y-2">
                    {alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">No new notifications.</p>
                    ) : (
                        alerts.map((alert, idx) => (
                            <div key={idx} className={`text-sm p-2 rounded ${alert.type === 'urgent' ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                                <p className={`font-medium ${alert.type === 'urgent' ? 'text-red-700' : ''}`}>{alert.title}</p>
                                <p className="text-xs text-muted-foreground">{alert.msg}</p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
