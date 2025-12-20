import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Onboarding } from '@/components/Onboarding';
import { HomeView } from '@/components/HomeView';
import { MoneyView } from '@/components/MoneyView';
import { AIView } from '@/components/AIView';
import { ProfileView } from '@/components/ProfileView';
import { BottomNav } from '@/components/BottomNav';
import { useLifeOS } from '@/hooks/useLifeOS';

type TabType = 'home' | 'money' | 'ai' | 'profile';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const {
    user,
    isOnboarded,
    transactions,
    currentSuggestion,
    saveUser,
    addTransaction,
    getWalletBalance,
    getRecentTransactions,
  } = useLifeOS();

  // Show loading state while checking onboarding status
  if (isOnboarded === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-12 h-12 gradient-primary rounded-2xl" />
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!isOnboarded || !user) {
    return (
      <Onboarding
        onComplete={(data) => {
          saveUser(data);
        }}
      />
    );
  }

  const balance = getWalletBalance();
  const recentTransactions = getRecentTransactions(5);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <HomeView
            key="home"
            user={user}
            balance={balance}
            suggestion={currentSuggestion}
            transactions={recentTransactions}
          />
        )}
        {activeTab === 'money' && (
          <MoneyView
            key="money"
            transactions={transactions}
            onAddTransaction={addTransaction}
          />
        )}
        {activeTab === 'ai' && (
          <AIView
            key="ai"
            suggestion={currentSuggestion}
            balance={balance}
            userName={user.name}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView key="profile" user={user} />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
