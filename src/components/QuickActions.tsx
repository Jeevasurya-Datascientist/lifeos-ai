import { motion } from 'framer-motion';
import { Smartphone, Zap, Tv, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickActions = [
  { icon: Smartphone, label: 'Mobile', sublabel: 'Recharge', color: 'bg-primary/10 text-primary' },
  { icon: Zap, label: 'Electricity', sublabel: 'Pay Bill', color: 'bg-warning/10 text-warning' },
  { icon: Tv, label: 'DTH', sublabel: 'Recharge', color: 'bg-success/10 text-success' },
];

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-elevated p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onClick={() => onActionClick?.(action.label.toLowerCase())}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={`p-3 rounded-xl ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.sublabel}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
