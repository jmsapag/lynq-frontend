import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/dashboard";
import { SidebarWithState } from "./components/navigation/sidebar/sidebar-with-state.tsx";
import Header from "./components/navigation/header/header.tsx";
import { useSidebar } from "./hooks/useSidebar.ts";
import UsersPage from "./pages/profile.tsx";
import DevicesPage from "./pages/devices";
import { Footer } from "./components/navigation/footer/footer.tsx";
import HelpPage from "./pages/help.tsx";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import Comparison from "./pages/comparison.tsx";
import { PrivateRoute } from "./components/auth/privateRoutes.tsx";
import Landing from "./pages/landing.tsx";
import LoginPage from "./pages/login.tsx";
import RegisterPage from "./pages/register.tsx";
import ForgotPasswordPage from "./pages/forgot-password.tsx";
import ChangePasswordPage from "./pages/change-password.tsx";
import BusinessesPage from "./pages/businesses.tsx";
import ManageUsersPage from "./pages/manage-users.tsx";
import UserManagement from "./pages/user-management.tsx";
import Locations from "./pages/locations.tsx";
import RoleRedirect from "./components/auth/roleRedirect.tsx";
import { RoleRoute } from "./components/auth/roleRoute.tsx";
import ConnectionsPageWrapper from "./pages/connections-wrapper.tsx";
import Overview from "./pages/overview.tsx";
import ReportsPage from "./pages/reports.tsx";
import FaqPage from "./pages/faq.tsx";
import FreeTrialWrapper from "./pages/free-trial.tsx";
import SubscriptionFeed from "./pages/subscription-feed.tsx";
import SubscriptionPage from "./pages/subscription";
import SubscriptionSuccessPage from "./pages/subscription-success";
import SubscriptionFailPage from "./pages/subscription-fail";
import { useNavigate } from "react-router-dom";
import CustomizedPlan from "./pages/customized-plan.tsx";
import BillingPage from "./pages/billing";
import WalletPage from "./pages/wallet.tsx";
import NewPaymentMethodPage from "./pages/new-payment-method.tsx";
import { useAuthState } from "./hooks/auth/useAuthState";
import { SubscriptionStateBanner } from "./components/payments/SubscriptionStateBanner";
import AIPage from "./pages/ai.tsx";
import { AlertFeed } from "./pages/alert-feed.tsx";
import { AIAssistantFAB } from "./components/ai/AIAssistantFAB";

function AppLayoutWithState() {
  const {
    isOpen,
    isCollapsed,
    handleToggle,
    handleClose,
    handleToggleCollapse,
  } = useSidebar();

  const navigate = useNavigate();
  const location = useLocation();
  const { isBlocked } = useAuthState();

  useEffect(() => {
    // Don't redirect if already on a billing-related page or locations
    if (
      location.pathname.startsWith("/billing") ||
      location.pathname.startsWith("/subscription") ||
      location.pathname.startsWith("/locations")
    ) {
      return;
    }

    // Only redirect if blocked and not on allowed pages
    if (isBlocked) {
      navigate("/billing/subscription", { replace: true });
    }
  }, [isBlocked, location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-white text-black">
      <SidebarWithState
        isOpen={isOpen}
        isCollapsed={isCollapsed}
        onClose={handleClose}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileToggleClick={handleToggle} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onClick={() => isOpen && handleClose()}
        >
          <SubscriptionStateBanner />
          <Outlet />
        </main>
        <Footer />
      </div>
      {/* AI Assistant FAB - Available in all authenticated views */}
      <AIAssistantFAB />
    </div>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <HeroUIProvider>
      <ToastProvider placement="bottom-right" />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Landing />} />
          <Route path="/register/:token?" element={<RegisterPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/auth/change-password"
            element={<ChangePasswordPage />}
          />
          <Route path="/free-trial" element={<FreeTrialWrapper />} />

          {/* Subscription success/cancel - public pages that refresh token and redirect */}
          <Route
            path="/billing/subscription/success"
            element={<SubscriptionSuccessPage />}
          />
          <Route
            path="/billing/subscription/cancel"
            element={<SubscriptionFailPage />}
          />
          <Route
            path="/subscription/success"
            element={<Navigate to="/billing/subscription/success" replace />}
          />
          <Route
            path="/subscription/cancel"
            element={<Navigate to="/billing/subscription/cancel" replace />}
          />

          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<RoleRedirect />} />
            <Route element={<AppLayoutWithState />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="/profile" element={<UsersPage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/subscriptions" element={<SubscriptionFeed />} />
              <Route path="/alerts" element={<AlertFeed />} />
              <Route
                path="/subscriptions/customize"
                element={<CustomizedPlan />}
              />
              <Route
                path="/new-payment-method"
                element={<NewPaymentMethodPage />}
              />

              {/* LYNQ_TEAM only routes */}
              <Route element={<RoleRoute allowedRoles="LYNQ_TEAM" />}>
                <Route path="businesses" element={<BusinessesPage />} />
                <Route
                  path="business/:businessId/connections"
                  element={<ConnectionsPageWrapper />}
                />
                <Route path="manage/users" element={<ManageUsersPage />} />
              </Route>

              {/* ADMIN only routes */}
              <Route element={<RoleRoute allowedRoles="ADMIN" />}>
                <Route path="user-management" element={<UserManagement />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="locations" element={<Locations />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route
                  path="/billing/subscription"
                  element={<SubscriptionPage />}
                />
                <Route
                  path="/subscription"
                  element={<Navigate to="/billing/subscription" replace />}
                />
                <Route path="/ai" element={<AIPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HeroUIProvider>
  );
}

export default App;
