import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { WalletBalance } from '@/types';

interface BalanceCardProps {
  balance: WalletBalance;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const spentPercentage = balance.total > 0 ? (balance.spent / balance.total) * 100 : 0;
  const isOverspending = spentPercentage > 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-hero rounded-3xl p-6 text-primary-foreground"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-foreground/20 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium opacity-90">This Month</span>
        </div>
        <div className="flex items-center gap-1 text-sm opacity-80">
          <TrendingUp className="w-4 h-4" />
          <span>Balance</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm opacity-70 mb-1">Available Balance</p>
        <p className="text-4xl font-bold tracking-tight">
          ₹{balance.remaining.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2 opacity-80">
          <span>Spent</span>
          <span>{Math.round(spentPercentage)}%</span>
        </div>
        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isOverspending ? 'bg-warning' : 'bg-primary-foreground'
            }`}
          />
        </div>
      </div>

      {/* Income / Expense summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 bg-success/20 rounded-lg">
            <ArrowDownLeft className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-xs opacity-70">Income</p>
            <p className="font-semibold">₹{balance.monthlyBudget.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="p-1.5 bg-destructive/20 rounded-lg">
            <ArrowUpRight className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <p className="text-xs opacity-70">Spent</p>
            <p className="font-semibold">₹{balance.spent.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
