import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { Database } from "@/types/database.types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/lib/transactions";
import { toast } from "sonner";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function TransactionsList({ limit = 5 }: { limit?: number }) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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
    }, [user, limit]);

    // Realtime Subscription
    useEffect(() => {
        if (!user) return;
        const subscription = supabase
            .channel('transactions_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTransactions((prev) => {
                            // Avoid duplicates if we already have it
                            if (prev.find(t => t.id === payload.new.id)) return prev;
                            return [payload.new as Transaction, ...prev].slice(0, limit);
                        });
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

    const handleDelete = async (id: string) => {
        if (!user) return;

        // Prevent double clicks
        if (deletingIds.has(id)) return;

        setDeletingIds(prev => new Set(prev).add(id));

        try {
            // Optimistic update: Temporarily remove from UI immediately
            // If it fails, we can add it back (or just fetch again)
            // But for deletion, usually fine to just hide it.
            // We'll wait for the actual DB call to confirm.

            await deleteTransaction(user.id, id);
            toast.success("Transaction deleted");

            // We don't need to manually remove from 'transactions' state here
            // because the Realtime subscription will handle the DELETE event.
            // However, to make it instant:
            setTransactions(prev => prev.filter(t => t.id !== id));

        } catch (error: any) {
            console.error(error);
            // Ignore "not found" which implies it's already deleted
            if (error.message && error.message.includes("not found")) {
                setTransactions(prev => prev.filter(t => t.id !== id));
                toast.success("Transaction deleted (sync)");
            } else {
                toast.error("Failed to delete");
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        }
    };

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
                    <div key={tx.id} className={`flex items-center justify-between group transition-opacity ${deletingIds.has(tx.id) ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{tx.category}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "dd MMM")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => handleDelete(tx.id)}
                                disabled={deletingIds.has(tx.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
