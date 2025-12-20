import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import { BalanceCard } from '@/components/BalanceCard';
import { AISuggestionCard } from '@/components/AISuggestionCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentTransactions } from '@/components/RecentTransactions';
import type { User, WalletBalance, AISuggestion, Transaction } from '@/types';
import { Button } from '@/components/ui/button';

interface HomeViewProps {
  user: User;
  balance: WalletBalance;
  suggestion: AISuggestion | null;
  transactions: Transaction[];
}

export function HomeView({ user, balance, suggestion, transactions }: HomeViewProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-5 pt-10"
      >
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="px-5 space-y-5">
        <BalanceCard balance={balance} />
        
        {suggestion && <AISuggestionCard suggestion={suggestion} />}
        
        <QuickActions />
        
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
