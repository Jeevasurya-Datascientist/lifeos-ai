import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OnboardingProps {
  onComplete: (data: { name: string; monthlyIncome: number }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      setError('');
      setStep(2);
    } else {
      const incomeValue = parseInt(income.replace(/,/g, ''), 10);
      if (!income || isNaN(incomeValue) || incomeValue <= 0) {
        setError('Please enter a valid income');
        return;
      }
      onComplete({ name: name.trim(), monthlyIncome: incomeValue });
    }
  };

  const handleIncomeChange = (value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      // Format with Indian number system
      const formatted = parseInt(numericValue, 10).toLocaleString('en-IN');
      setIncome(formatted);
    } else {
      setIncome('');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 gradient-primary rounded-xl">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">LifeOS AI</span>
        </motion.div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-primary" />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Step {step} of 2</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                What should we call you?
              </h1>
              <p className="text-muted-foreground mb-8">
                Let's get to know each other better.
              </p>
              <div className="space-y-4">
                <Input
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="h-14 text-lg rounded-xl border-2 focus:border-primary"
                  autoFocus
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Hi {name}! 👋
              </h1>
              <p className="text-muted-foreground mb-8">
                What's your monthly income? This helps us give you better suggestions.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                    ₹
                  </span>
                  <Input
                    placeholder="50,000"
                    value={income}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    className="h-14 text-lg pl-8 rounded-xl border-2 focus:border-primary"
                    autoFocus
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm"
                  >
                    {error}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  🔒 Your data stays private and secure on your device.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="p-6 pb-10">
        <Button onClick={handleNext} size="xl" variant="hero" className="w-full">
          {step === 1 ? 'Continue' : 'Get Started'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
