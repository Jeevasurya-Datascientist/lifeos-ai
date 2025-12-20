import { useState, useEffect } from 'react';
import type { User, Transaction, WalletBalance, AISuggestion } from '@/types';

const STORAGE_KEYS = {
  USER: 'lifeos_user',
  TRANSACTIONS: 'lifeos_transactions',
  ONBOARDED: 'lifeos_onboarded',
};

const AI_SUGGESTIONS: Omit<AISuggestion, 'id' | 'createdAt'>[] = [
  { message: "Skip food delivery today. You'll save ₹280.", type: 'tip', actionable: true },
  { message: "Your electricity bill is due in 3 days.", type: 'warning', actionable: true },
  { message: "You've spent 40% less on transport this week. Great job!", type: 'insight', actionable: false },
  { message: "Consider cooking at home tonight. Save ₹350.", type: 'tip', actionable: true },
  { message: "Your spending is on track this month.", type: 'insight', actionable: false },
  { message: "Mobile recharge due tomorrow. ₹299.", type: 'warning', actionable: true },
];

export function useLifeOS() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const savedOnboarded = localStorage.getItem(STORAGE_KEYS.ONBOARDED);

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    setIsOnboarded(savedOnboarded === 'true');

    // Generate daily suggestion
    const randomSuggestion = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
    setCurrentSuggestion({
      ...randomSuggestion,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }, []);

  // Save user to localStorage
  const saveUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    setIsOnboarded(true);
  };

  // Add transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  };

  // Calculate wallet balance
  const getWalletBalance = (): WalletBalance => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(
      t => new Date(t.date) >= startOfMonth
    );

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBudget = user?.monthlyIncome || 0;

    return {
      total: monthlyBudget + income,
      spent: expenses,
      remaining: monthlyBudget + income - expenses,
      monthlyBudget,
    };
  };

  // Get recent transactions
  const getRecentTransactions = (limit = 5) => {
    return transactions.slice(0, limit);
  };

  // Get spending by category
  const getSpendingByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return categoryTotals;
  };

  return {
    user,
    transactions,
    isOnboarded,
    currentSuggestion,
    saveUser,
    addTransaction,
    getWalletBalance,
    getRecentTransactions,
    getSpendingByCategory,
  };
}
