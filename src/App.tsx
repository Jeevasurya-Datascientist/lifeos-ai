
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/dashboard/Home";
import Login from "./pages/auth/Login";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import EmployerDashboard from "./pages/EmployerDashboard";
import RechargeBills from "./pages/services/RechargeBills";
import Plans from "./pages/subscription/Plans";
import Profile from "./pages/settings/Profile";
import AskLifeOS from "./pages/ai/AskLifeOS";
import { AppLayout } from "./components/layout/AppLayout";
import TransactionsPage from "./pages/financial/TransactionsPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import WellnessPage from "./pages/wellness/WellnessPage";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

import { LanguageProvider } from "./contexts/LanguageContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes (Wrapped in AppLayout via ProtectedRoute) */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
              <Route path="/recharge" element={<ProtectedRoute><RechargeBills /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ask-ai" element={<ProtectedRoute><AskLifeOS /></ProtectedRoute>} />

              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/wellness" element={<ProtectedRoute><WellnessPage /></ProtectedRoute>} />

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
