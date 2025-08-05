// src/components/dashboard/layout-dashboard/DashboardWidget.tsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DashboardWidgetType } from "./LayoutDashboard";

interface DashboardWidgetProps {
  id: string;
  type: DashboardWidgetType;
  title: string;
  children: React.ReactNode;
  isDragging?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  type,
  title,
  children,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id: type,
    data: {
      type: type,
      title: title,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isCurrentlyDragging ? 0.5 : 1,
    cursor: isCurrentlyDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${
        isDragging || isCurrentlyDragging 
          ? "scale-105 shadow-lg border-2 border-blue-500" 
          : "hover:shadow-md"
      }`}
    >
      {children}
    </div>
  );
};
