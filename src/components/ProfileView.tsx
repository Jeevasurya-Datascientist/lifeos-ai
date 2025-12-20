import { motion } from 'framer-motion';
import { User, ChevronRight, Bell, Shield, HelpCircle, LogOut, Sparkles } from 'lucide-react';
import type { User as UserType } from '@/types';

interface ProfileViewProps {
  user: UserType;
}

const menuItems = [
  { icon: Bell, label: 'Notifications', description: 'Manage your alerts' },
  { icon: Shield, label: 'Privacy & Security', description: 'Your data is safe' },
  { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance' },
];

export function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 pt-10"
      >
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </motion.header>

      <div className="px-5 space-y-5">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-5 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.div>

        {/* Monthly Income */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{user.monthlyIncome.toLocaleString('en-IN')}
              </p>
            </div>
            <button className="text-primary text-sm font-medium">Edit</button>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated divide-y divide-border"
        >
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="p-2 bg-secondary rounded-xl">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          ))}
        </motion.div>

        {/* Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="gradient-hero rounded-2xl p-5 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6" />
            <span className="font-semibold">LifeOS Premium</span>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Get unlimited AI suggestions, advanced insights, and priority support.
          </p>
          <button className="w-full py-3 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-xl font-medium transition-colors">
            Coming Soon — ₹99/month
          </button>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full flex items-center justify-center gap-2 p-4 text-destructive font-medium"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </motion.button>
      </div>
    </div>
  );
}
