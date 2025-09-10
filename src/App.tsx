import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import { SidebarWithState } from "./components/navigation/sidebar/sidebar-with-state.tsx";
import Header from "./components/navigation/header/header.tsx";
import { useSidebar } from "./hooks/useSidebar.ts";
import UsersPage from "./pages/profile.tsx";
import DevicesPage from "./pages/devices";
import { Footer } from "./components/navigation/footer/footer.tsx";
import HelpPage from "./pages/help.tsx";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
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

function AppLayoutWithState() {
  const { isOpen, handleToggle, handleClose } = useSidebar();

  return (
    <div className="flex h-screen bg-white text-black">
      <SidebarWithState isOpen={isOpen} onClose={handleClose} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileToggleClick={handleToggle} />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onClick={() => isOpen && handleClose()}
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <HeroUIProvider>
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

              {/* LYNQ_TEAM only routes */}
              <Route element={<RoleRoute allowedRoles="LYNQ_TEAM" />}>
                <Route path="devices" element={<DevicesPage />} />
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
                <Route path="locations" element={<Locations />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastProvider />
    </HeroUIProvider>
  );
}

export default App;
