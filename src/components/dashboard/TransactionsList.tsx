import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Database } from "@/types/database.types";
import { format } from "date-fns";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function TransactionsList({ limit = 5 }: { limit?: number }) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false })
                .limit(limit);

            if (data) setTransactions(data);
            setLoading(false);
        };

        fetchTransactions();

        // Realtime Subscription
        const subscription = supabase
            .channel('transactions_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTransactions((prev) => [payload.new as Transaction, ...prev].slice(0, limit));
                    } else if (payload.eventType === 'DELETE') {
                        setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setTransactions((prev) => prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t)));
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };

    }, [user, limit]);

    if (loading) return <div className="text-sm text-muted-foreground">Loading transactions...</div>;

    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No recent transactions.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p - 2 rounded - full ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} `}>
                                {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{tx.category}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "dd MMM")}</p>
                            </div>
                        </div>
                        <span className={`text - sm font - semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'} `}>
                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
