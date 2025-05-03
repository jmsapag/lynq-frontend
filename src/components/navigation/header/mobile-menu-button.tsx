import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface MobileMenuButtonProps {
  onClick: () => void;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden rounded-md p-2 text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
      aria-label="Open sidebar"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
};
