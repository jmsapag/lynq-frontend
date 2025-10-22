import { useState, useCallback, useEffect } from "react";

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  handleToggle: () => void;
  handleClose: () => void;
  handleToggleCollapse: () => void;
}

export const useSidebar = (): SidebarState => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const handleToggle = useCallback(() => {
    setIsOpen((prev: boolean) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isOpen,
    isCollapsed,
    handleToggle,
    handleClose,
    handleToggleCollapse,
  };
};
