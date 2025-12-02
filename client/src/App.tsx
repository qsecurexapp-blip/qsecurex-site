import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import FeaturesPage from "@/pages/features";
import PremiumPage from "@/pages/premium";
import AboutPage from "@/pages/about";
import DownloadPage from "@/pages/download";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import DashboardPage from "@/pages/dashboard";
import AdminPage from "@/pages/admin";
import CommunityPage from "@/pages/community";
import PurchasePage from "@/pages/purchase";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/">
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      </Route>
      <Route path="/features">
        <PublicLayout>
          <FeaturesPage />
        </PublicLayout>
      </Route>
      <Route path="/premium">
        <PublicLayout>
          <PremiumPage />
        </PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout>
          <AboutPage />
        </PublicLayout>
      </Route>
      <Route path="/download">
        <PublicLayout>
          <DownloadPage />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      </Route>
      <Route path="/community">
        <PublicLayout>
          <CommunityPage />
        </PublicLayout>
      </Route>
      <Route path="/terms">
        <PublicLayout>
          <TermsPage />
        </PublicLayout>
      </Route>
      <Route path="/privacy">
        <PublicLayout>
          <PrivacyPage />
        </PublicLayout>
      </Route>

      {/* Auth Pages */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />

      {/* Protected Pages */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/purchase">
        <ProtectedRoute>
          <DashboardLayout>
            <PurchasePage />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <DashboardLayout>
            <AdminPage />
          </DashboardLayout>
        </AdminRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
