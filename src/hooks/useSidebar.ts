import { useState, useCallback } from "react";

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    handleOpen,
    handleClose,
    handleToggle,
  };
};
