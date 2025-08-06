// src/components/dashboard/layout-dashboard/LayoutSidebar.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { ChevronRightIcon, ChevronLeftIcon, Squares2X2Icon, ChartBarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetType } from "./LayoutDashboard";

// Removal Zone Component
const RemovalZone: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'widget-removal-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 border-dashed rounded-lg p-4 text-center transition-all
        ${isOver 
          ? 'border-red-400 bg-red-50' 
          : 'border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <TrashIcon className={`w-6 h-6 ${isOver ? 'text-red-600' : 'text-gray-400'}`} />
        <p className={`text-sm font-medium ${isOver ? 'text-red-600' : 'text-gray-500'}`}>
          {isOver ? 'Release to remove' : 'Drop here to remove'}
        </p>
        <p className="text-xs text-gray-400">
          Drag placed widgets here to remove them from the layout
        </p>
      </div>
    </div>
  );
};

interface LayoutSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isEditMode: boolean;
  allWidgets: Array<{
    id: string;
    type: DashboardWidgetType;
    title: string;
    category: 'metric' | 'chart';
  }>;
  placedWidgets: Set<DashboardWidgetType>;
  draggedWidget: DashboardWidgetType | null;
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  isOpen,
  onToggle,
  isEditMode,
  allWidgets,
  placedWidgets,
  draggedWidget,
}) => {
  const metricWidgets = allWidgets.filter(w => w.category === 'metric');
  const chartWidgets = allWidgets.filter(w => w.category === 'chart');

  // Don't render anything if not in edit mode
  if (!isEditMode) {
    return null;
  }

  return (
    <>
      {/* Sidebar - fixed position on the right */}
      <div className={`
        fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-80 translate-x-0' : 'w-80 translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Widget Library</h2>
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-73px)]">
          {/* Info Cards Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Squares2X2Icon className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-gray-900">Info Cards</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {metricWidgets.length}
              </span>
            </div>
            <div className="space-y-3">
              {metricWidgets.map(widget => {
                const isPlaced = placedWidgets.has(widget.type);
                return (
                  <div key={widget.id} className="group">
                    <DashboardWidget
                      id={widget.id}
                      type={widget.type}
                      title={widget.title}
                      category={widget.category}
                      enableDrag={true}
                      isDragging={draggedWidget === widget.type}
                    >
                      <div className={`
                        bg-white rounded-lg border p-3 hover:shadow-sm transition-all cursor-grab
                        ${isPlaced 
                          ? 'border-blue-500 bg-blue-50 hover:border-blue-600' 
                          : 'border-gray-200 hover:border-blue-300'
                        }
                      `}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500 font-medium">Metric Card</p>
                              {isPlaced && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                  Placed
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold mt-1">{widget.title}</p>
                            {isPlaced && (
                              <p className="text-xs text-blue-600 mt-1">Drag to remove</p>
                            )}
                          </div>
                          <div className={`
                            w-8 h-8 rounded flex items-center justify-center
                            ${isPlaced ? 'bg-blue-100' : 'bg-blue-50'}
                          `}>
                            <Squares2X2Icon className={`w-4 h-4 ${isPlaced ? 'text-blue-700' : 'text-blue-600'}`} />
                          </div>
                        </div>
                      </div>
                    </DashboardWidget>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChartBarIcon className="w-4 h-4 text-green-600" />
              <h3 className="font-medium text-gray-900">Charts</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {chartWidgets.length}
              </span>
            </div>
            <div className="space-y-3">
              {chartWidgets.map(widget => {
                const isPlaced = placedWidgets.has(widget.type);
                return (
                  <div key={widget.id} className="group">
                    <DashboardWidget
                      id={widget.id}
                      type={widget.type}
                      title={widget.title}
                      category={widget.category}
                      enableDrag={true}
                      isDragging={draggedWidget === widget.type}
                    >
                      <div className={`
                        bg-white rounded-lg border p-3 hover:shadow-sm transition-all cursor-grab
                        ${isPlaced 
                          ? 'border-green-500 bg-green-50 hover:border-green-600' 
                          : 'border-gray-200 hover:border-green-300'
                        }
                      `}>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 font-medium">Chart Widget</p>
                            {isPlaced && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                Placed
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold mt-1">{widget.title}</p>
                          {isPlaced && (
                            <p className="text-xs text-green-600 mt-1">Drag to remove</p>
                          )}
                          <div className={`
                            mt-2 h-12 rounded border flex items-center justify-center
                            ${isPlaced 
                              ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-200' 
                              : 'bg-gradient-to-r from-green-50 to-blue-50 border-gray-100'
                            }
                          `}>
                            <ChartBarIcon className={`w-5 h-5 ${isPlaced ? 'text-green-700' : 'text-green-600'}`} />
                          </div>
                        </div>
                      </div>
                    </DashboardWidget>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-1">How to use:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Drag widgets to layout zones to place them</li>
              <li>• Drag placed widgets back here to remove them</li>
              <li>• Blue/Green badges indicate placed widgets</li>
              <li>• Use layout selector to switch between layouts</li>
            </ul>
          </div>

          {/* Removal Zone */}
          <RemovalZone />
        </div>
      </div>

      {/* Toggle Button (when closed and in edit mode) */}
      {!isOpen && (
        <div className="flex items-center justify-center w-12 border-l border-gray-200 bg-gray-50">
          <button
            onClick={onToggle}
            className="p-3 hover:bg-gray-100 transition-colors rounded-md"
            title="Open Widget Library"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </>
  );
};
