import { supabase } from "./supabase";

export type TransactionInput = {
    amount: number;
    type: "income" | "expense";
    category: string;
    description?: string;
    date: string;
};

export const addTransaction = async (userId: string, tx: TransactionInput) => {
    // 1. Get current wallet balance SAFELY
    const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

    if (walletFetchError) throw new Error("Could not fetch wallet balance");

    // If no wallet exists, we treat balance as 0. 
    // We will create it during the update step (upsert) or explicitly insert now.
    // Upsert is safer.
    const currentBalance = wallet?.balance || 0;
    const newBalance = tx.type === "income"
        ? currentBalance + tx.amount
        : currentBalance - tx.amount;

    // 2. Insert Transaction
    const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        ...tx
    });

    if (txError) throw txError;

    // 3. Update or Create Wallet
    if (wallet) {
        const { error: updateError } = await supabase
            .from("wallets")
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq("user_id", userId);

        if (updateError) throw new Error("Failed to update wallet balance");
    } else {
        const { error: insertError } = await supabase
            .from("wallets")
            .insert({
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString()
            });

        if (insertError) throw new Error("Failed to create wallet");
    }

    return { success: true };
};

export const deleteTransaction = async (userId: string, transactionId: string) => {
    // 1. Fetch the transaction to know amount/type
    // 1. Fetch the transaction to know amount/type
    const { data: tx, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .maybeSingle();

    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        throw new Error(fetchError.message);
    }

    if (!tx) {
        console.error("Transaction Lookup Failed:");
        console.error("- Transaction ID:", transactionId);
        console.error("- Current User:", userId);
        console.error("- Result:", tx);
        throw new Error("Transaction not found (it may have been deleted already)");
    }

    console.log("Found transaction to delete:", tx);

    // 2. Fetch current wallet
    const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

    if (walletFetchError) throw new Error("Could not fetch wallet balance");

    // 3. Calculate new balance (Reverse the transaction)
    // If it was INCOME, we SUBTRACT. If it was EXPENSE, we ADD.
    const currentBalance = wallet?.balance || 0;
    const reversalAmount = tx.amount;
    const newBalance = tx.type === "income"
        ? currentBalance - reversalAmount
        : currentBalance + reversalAmount;

    // 4. Delete Transaction
    const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

    if (deleteError) throw deleteError;

    // 5. Update Wallet
    const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

    if (walletUpdateError) {
        // Fallback to insert if update failed (unlikely here since we fetched it, but for safety)
        const { error: insertError } = await supabase
            .from("wallets")
            .insert({
                user_id: userId,
                balance: newBalance,
                updated_at: new Date().toISOString()
            });
        if (insertError) throw insertError;
    }

    return { success: true };
};
