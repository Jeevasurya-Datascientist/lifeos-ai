import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Pages
import Home from "./pages/dashboard/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/auth/UpdatePasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import EmployerDashboard from "./pages/EmployerDashboard";
// import RechargeBills from "./pages/services/RechargeBills"; // Removed
import BillRemindersPage from "./pages/financial/BillRemindersPage";
import SubscriptionPage from "./pages/financial/SubscriptionPage";
import TransactionsPage from "./pages/financial/TransactionsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import WellnessPage from "./pages/wellness/WellnessPage";
import BrainTrainingPage from "./pages/wellness/BrainTrainingPage";
import BrainGamePage from "./pages/wellness/BrainGamePage";
import DailyNewsPage from "./pages/career/DailyNewsPage";
import CareerPage from "./pages/career/CareerPage";
import AskLifeOS from "./pages/ai/AskLifeOS";
import Profile from "./pages/settings/Profile";
import NotesPage from "./pages/features/NotesPage";
import WakeUpRoutine from "./pages/wellness/WakeUpRoutine";
import SleepPage from "./pages/wellness/SleepPage";
import WaterPage from "./pages/wellness/WaterPage";
import HabitsPage from "./pages/wellness/HabitsPage";
import MindfulnessPage from "./pages/wellness/MindfulnessPage";
import JournalPage from "./pages/wellness/JournalPage";

// Legal Pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import ContactUs from "./pages/legal/ContactUs";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import RefundPolicy from "./pages/legal/RefundPolicy";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/update-password" element={<UpdatePasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Legal Routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Protected Routes (Wrapped in AppLayout via ProtectedRoute) */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
              <Route path="/recharge" element={<ProtectedRoute><BillRemindersPage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ask-ai" element={<ProtectedRoute><AskLifeOS /></ProtectedRoute>} />

              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
              <Route path="/brain-training" element={<ProtectedRoute><BrainTrainingPage /></ProtectedRoute>} />
              <Route path="/brain-training" element={<ProtectedRoute><BrainTrainingPage /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
              <Route path="/wellness/routine" element={<ProtectedRoute><WakeUpRoutine /></ProtectedRoute>} />
              <Route path="/wellness/sleep" element={<ProtectedRoute><SleepPage /></ProtectedRoute>} />
              <Route path="/wellness/water" element={<ProtectedRoute><WaterPage /></ProtectedRoute>} />
              <Route path="/wellness/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
              <Route path="/wellness/mindfulness" element={<ProtectedRoute><MindfulnessPage /></ProtectedRoute>} />
              <Route path="/wellness/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
              <Route path="/brain-training/game/:gameId" element={<ProtectedRoute><BrainGamePage /></ProtectedRoute>} />
              <Route path="/career/news" element={<ProtectedRoute><DailyNewsPage /></ProtectedRoute>} />
              <Route path="/career" element={<ProtectedRoute><CareerPage /></ProtectedRoute>} />

              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              {/* Employer Dashboard - Protected */}
              <Route
                path="/employer-dashboard"
                element={
                  <ProtectedRoute>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
