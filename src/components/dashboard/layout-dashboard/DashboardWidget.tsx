// src/components/dashboard/layout-dashboard/DashboardWidget.tsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DashboardWidgetType } from "./LayoutDashboard";

interface DashboardWidgetProps {
  id: string;
  type: DashboardWidgetType;
  title: string;
  category?: 'metric' | 'chart';
  children: React.ReactNode;
  isDragging?: boolean;
  enableDrag?: boolean; // New prop to control drag behavior
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  type,
  title,
  category,
  children,
  isDragging = false,
  enableDrag = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id: type,
    disabled: !enableDrag,
    data: {
      type: category || type,
      title: title,
    },
  });

  const style = {
    // Completely disable transform for non-draggable widgets
    transform: enableDrag && isCurrentlyDragging ? CSS.Translate.toString(transform) : 'none',
    opacity: 1,
    cursor: enableDrag ? (isCurrentlyDragging ? "grabbing" : "grab") : "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enableDrag ? listeners : {})}
      {...(enableDrag ? attributes : {})}
      className={`${
        enableDrag && (isDragging || isCurrentlyDragging) 
          ? "scale-105 shadow-lg border-2 border-blue-500" 
          : enableDrag ? "hover:shadow-md " : ""
      }`}
    >
      {children}
    </div>
  );
};
