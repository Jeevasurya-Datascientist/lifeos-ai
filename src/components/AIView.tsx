import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AISuggestion, WalletBalance } from '@/types';

interface AIViewProps {
  suggestion: AISuggestion | null;
  balance: WalletBalance;
  userName: string;
}

const DAILY_INSIGHTS = [
  {
    time: 'Morning',
    icon: '☀️',
    message: 'Check your pending bills before starting the day.',
    type: 'tip' as const,
  },
  {
    time: 'Afternoon',
    icon: '🌤️',
    message: 'You usually spend on food around this time. Consider home-cooked meals.',
    type: 'insight' as const,
  },
  {
    time: 'Evening',
    icon: '🌙',
    message: 'Review today\'s spending and plan for tomorrow.',
    type: 'tip' as const,
  },
];

export function AIView({ suggestion, balance, userName }: AIViewProps) {
  const spentPercentage = balance.total > 0 ? (balance.spent / balance.total) * 100 : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const idealSpendingPace = (currentDay / daysInMonth) * 100;
  const spendingStatus = spentPercentage > idealSpendingPace ? 'ahead' : 'on-track';

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 pt-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 gradient-primary rounded-xl">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Advisor</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your personal money awareness assistant
        </p>
      </motion.header>

      <div className="px-5 space-y-5">
        {/* Main Suggestion */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-hero rounded-3xl p-6 text-primary-foreground"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Today's Focus</span>
            </div>
            <p className="text-xl font-semibold leading-relaxed mb-4">
              {suggestion.message}
            </p>
            <Button variant="secondary" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Get New Tip
            </Button>
          </motion.div>
        )}

        {/* Spending Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-5"
        >
          <h3 className="font-semibold text-foreground mb-4">Spending Status</h3>
          <div className={`p-4 rounded-xl ${spendingStatus === 'on-track' ? 'bg-success/10' : 'bg-warning/10'}`}>
            <div className="flex items-center gap-3">
              {spendingStatus === 'on-track' ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-warning" />
              )}
              <div>
                <p className={`font-medium ${spendingStatus === 'on-track' ? 'text-success' : 'text-warning'}`}>
                  {spendingStatus === 'on-track' ? 'You\'re on track!' : 'Spending ahead of pace'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {spendingStatus === 'on-track'
                    ? `Great job ${userName}, keep it up!`
                    : `Consider reducing expenses for the rest of the month.`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-5"
        >
          <h3 className="font-semibold text-foreground mb-4">Daily Check-ins</h3>
          <div className="space-y-3">
            {DAILY_INSIGHTS.map((insight, index) => (
              <motion.div
                key={insight.time}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50"
              >
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{insight.time}</p>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-muted rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> LifeOS AI provides general awareness suggestions only. 
              This is not financial, investment, or medical advice. Always consult qualified professionals 
              for important decisions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
