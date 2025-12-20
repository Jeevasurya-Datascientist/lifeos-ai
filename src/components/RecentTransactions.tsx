import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { Transaction } from '@/types';
import { EXPENSE_CATEGORIES } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getCategory = (categoryValue: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === categoryValue) || {
      value: categoryValue,
      label: categoryValue,
      icon: '📦',
    };
  };

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-elevated p-5"
      >
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No transactions yet</p>
          <p className="text-muted-foreground text-xs mt-1">Add your first expense or income</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-elevated p-5"
    >
      <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const category = getCategory(transaction.category);
          const isExpense = transaction.type === 'expense';

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {transaction.description || category.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {isExpense ? (
                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                ) : (
                  <ArrowDownLeft className="w-4 h-4 text-success" />
                )}
                <span className={`font-semibold ${isExpense ? 'text-destructive' : 'text-success'}`}>
                  {isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
