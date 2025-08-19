import React from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { ChevronDownIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layouts";

interface LayoutSelectorProps {
  currentLayout: DashboardLayout;
  availableLayouts: DashboardLayout[];
  onLayoutChange: (layout: DashboardLayout) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  availableLayouts,
  onLayoutChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="flat"
            color="default"
            size="sm"
            startContent={<Squares2X2Icon className="w-4 h-4" />}
            endContent={<ChevronDownIcon className="w-3 h-3" />}
            className="min-w-0"
          >
            <span className="hidden sm:inline"></span>
            <span className="sm:hidden">Layout</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Layout Selection"
          selectionMode="single"
          selectedKeys={[currentLayout.id]}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            const selectedLayout = availableLayouts.find(
              (layout) => layout.id === selectedKey,
            );
            if (selectedLayout) {
              onLayoutChange(selectedLayout);
            }
          }}
        >
          {availableLayouts.map((layout) => (
            <DropdownItem
              key={layout.id}
              description={layout.description}
              className="py-2"
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{layout.name}</div>
                  {layout.isDefault && (
                    <span className="text-xs text-blue-600 font-medium">
                      Default
                    </span>
                  )}
                </div>
                {currentLayout.id === layout.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
