import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import { SidebarWithState } from "./components/navigation/sidebar/sidebar-with-state.tsx";
import Header from "./components/navigation/header/header.tsx";
import { useSidebar } from "./hooks/useSidebar.ts";
import UsersPage from "./pages/users";
import DevicesPage from "./pages/devices";
import { Footer } from "./components/navigation/footer/footer.tsx";
import HelpPage from "./pages/help.tsx";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import Comparison from "./pages/comparison.tsx";

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
          <Route path="/" element={<AppLayoutWithState />}>
            <Route index element={<Dashboard />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastProvider />
    </HeroUIProvider>
  );
}

export default App;
