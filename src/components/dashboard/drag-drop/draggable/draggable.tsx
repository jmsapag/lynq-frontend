import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableProps {
  children: React.ReactNode;
  id: string;
  type: "small-card" | "card" | "chart-card";
  className?: string;
}

export default function Draggable({
  children,
  id,
  type,
  className = "",
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
      data: {
        type: type,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Base styles for different card types
  const getTypeStyles = () => {
    switch (type) {
      case "small-card":
        return "w-32 h-24 bg-blue-100 border-blue-200";
      case "card":
        return "w-48 h-32 bg-green-100 border-green-200";
      case "chart-card":
        return "w-64 h-40 bg-purple-100 border-purple-200";
      default:
        return "w-48 h-32 bg-gray-100 border-gray-200";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${getTypeStyles()}
        border-2 rounded-lg p-4 cursor-grab active:cursor-grabbing
        shadow-lg
        ${isDragging ? "opacity-50 rotate-2 scale-105" : ""}
        ${className}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-xs font-medium text-gray-600 mb-1">
          {type.replace("-", " ").toUpperCase()}
        </div>
        {children}
      </div>
    </div>
  );
}
