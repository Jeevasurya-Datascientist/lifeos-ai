import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Transaction, ExpenseCategory } from '@/types';
import { EXPENSE_CATEGORIES } from '@/types';

interface MoneyViewProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export function MoneyView({ transactions, onAddTransaction }: MoneyViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const amountValue = parseInt(amount.replace(/,/g, ''), 10);
    if (!amount || isNaN(amountValue) || amountValue <= 0) return;

    onAddTransaction({
      type,
      amount: amountValue,
      category,
      description: description.trim(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('food');
    setShowAddModal(false);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue, 10).toLocaleString('en-IN');
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 pt-10"
      >
        <h1 className="text-2xl font-bold text-foreground">Money Manager</h1>
        <p className="text-sm text-muted-foreground">Track your income & expenses</p>
      </motion.header>

      {/* Summary Cards */}
      <div className="px-5 grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-success/10 rounded-lg">
              <ArrowDownLeft className="w-4 h-4 text-success" />
            </div>
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="text-xl font-bold text-success">
            ₹{totalIncome.toLocaleString('en-IN')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-elevated p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-destructive/10 rounded-lg">
              <ArrowUpRight className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
          <p className="text-xl font-bold text-destructive">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
        </motion.div>
      </div>

      {/* Transactions List */}
      <div className="px-5">
        <h3 className="font-semibold text-foreground mb-4">All Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-muted-foreground text-sm">No transactions yet</p>
            <p className="text-muted-foreground text-xs mt-1">Tap + to add your first one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => {
              const categoryData = EXPENSE_CATEGORIES.find(c => c.value === transaction.category);
              const isExpense = transaction.type === 'expense';

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-elevated p-4 flex items-center gap-3"
                >
                  <div className="text-2xl">{categoryData?.icon || '📦'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {transaction.description || categoryData?.label || 'Transaction'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`font-bold ${isExpense ? 'text-destructive' : 'text-success'}`}>
                    {isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString('en-IN')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowAddModal(true)}
        className="fixed right-5 bottom-24 gradient-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-foreground/50 z-50 flex items-end"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-card rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Add Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-destructive/10 text-destructive border-2 border-destructive'
                    : 'bg-secondary text-muted-foreground border-2 border-transparent'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-success/10 text-success border-2 border-success'
                    : 'bg-secondary text-muted-foreground border-2 border-transparent'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground block mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">₹</span>
                <Input
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="h-14 text-2xl font-bold pl-8 rounded-xl border-2 focus:border-primary"
                />
              </div>
            </div>

            {/* Category (for expenses) */}
            {type === 'expense' && (
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                        category === cat.value
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-secondary border-2 border-transparent'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs text-muted-foreground">{cat.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <label className="text-sm font-medium text-foreground block mb-2">Description (optional)</label>
              <Input
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12 rounded-xl border-2 focus:border-primary"
              />
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} size="xl" variant="hero" className="w-full">
              Add Transaction
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
