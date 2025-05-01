import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/dashboard";
import { SidebarWithState } from "./components/layout/sidebar";
import Header from "./components/layout/header";

function AppLayoutWithState() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <SidebarWithState isOpen={isMobileOpen} setIsOpen={closeMobileSidebar} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileToggleClick={handleMobileToggle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<AppLayoutWithState />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
