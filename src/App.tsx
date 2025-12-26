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
import SubscriptionPage from "./pages/financial/SubscriptionPage";
import TransactionsPage from "./pages/financial/TransactionsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import WellnessPage from "./pages/wellness/WellnessPage";
import BrainTrainingPage from "./pages/wellness/BrainTrainingPage";
import AskLifeOS from "./pages/ai/AskLifeOS";
import Profile from "./pages/settings/Profile";

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
              {/* Removed Recharge Route */}
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ask-ai" element={<ProtectedRoute><AskLifeOS /></ProtectedRoute>} />

              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />
              <Route path="/brain-training" element={<ProtectedRoute><BrainTrainingPage /></ProtectedRoute>} />

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
