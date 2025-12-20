import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import type { AISuggestion } from '@/types';

interface AISuggestionCardProps {
  suggestion: AISuggestion;
}

const iconMap = {
  tip: Lightbulb,
  warning: AlertTriangle,
  insight: TrendingUp,
};

const colorMap = {
  tip: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  insight: 'bg-success/10 text-success',
};

const borderMap = {
  tip: 'border-accent/30',
  warning: 'border-warning/30',
  insight: 'border-success/30',
};

export function AISuggestionCard({ suggestion }: AISuggestionCardProps) {
  const Icon = iconMap[suggestion.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`card-elevated p-5 border-2 ${borderMap[suggestion.type]}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${colorMap[suggestion.type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              AI Suggestion
            </span>
          </div>
          <p className="text-foreground font-medium leading-relaxed">
            {suggestion.message}
          </p>
        </div>
        {suggestion.actionable && (
          <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
