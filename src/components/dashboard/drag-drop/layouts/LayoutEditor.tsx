import React, { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { LayoutType, DroppedItems, WidgetItem } from './types';
import { LAYOUT_SCHEMAS } from './schemas';
import { LayoutRenderer } from './LayoutRenderer';
import { LayoutSelector } from './LayoutSelector';
import Droppable from '../droppable/droppable';
import Draggable from '../draggable/draggable';

interface LayoutEditorProps {
  initialLayout?: LayoutType;
  initialItems?: DroppedItems;
  onSave?: (layout: LayoutType, items: DroppedItems) => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  initialLayout = 'grid',
  initialItems = {},
  onSave
}) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(initialLayout);
  const [droppedItems, setDroppedItems] = useState<DroppedItems>(initialItems);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Widgets disponibles para el ejemplo
  const availableItems: WidgetItem[] = [
    {
      id: 'analytics-1',
      type: 'small-card',
      content: {
        icon: '📊',
        title: 'Analytics Overview',
        description: 'Métricas principales del sistema',
        data: { value: 1234, trend: '+12%' }
      }
    },
    {
      id: 'users-1',
      type: 'small-card',
      content: {
        icon: '👥',
        title: 'Usuarios Activos',
        description: 'Cantidad de usuarios en línea',
        data: { value: 89, trend: '+5%' }
      }
    },
    {
      id: 'revenue-chart',
      type: 'chart-card',
      content: {
        icon: '📈',
        title: 'Gráfico de Ingresos',
        description: 'Evolución mensual de ingresos',
        data: { chartType: 'line', period: 'monthly' }
      }
    },
    {
      id: 'tasks-card',
      type: 'card',
      content: {
        icon: '📋',
        title: 'Lista de Tareas',
        description: 'Tareas pendientes y completadas',
        data: { pending: 5, completed: 23 }
      }
    },
    {
      id: 'notifications',
      type: 'card',
      content: {
        icon: '🔔',
        title: 'Notificaciones',
        description: 'Alertas y mensajes recientes',
        data: { unread: 3 }
      }
    },
    {
      id: 'performance',
      type: 'chart-card',
      content: {
        icon: '⚡',
        title: 'Rendimiento Sistema',
        description: 'Métricas de performance en tiempo real',
        data: { cpu: 45, memory: 67, network: 23 }
      }
    }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const draggedItem = availableItems.find(item => item.id === active.id);
      const currentSchema = LAYOUT_SCHEMAS[currentLayout];
      const targetZone = currentSchema.zones.find(zone => zone.id === over.id);
      
      // Verificar si la zona acepta este tipo de item
      if (targetZone && draggedItem && 
          (targetZone.acceptedTypes?.includes(draggedItem.type) || !targetZone.acceptedTypes)) {
        
        setDroppedItems(prev => {
          const newItems = { ...prev };
          
          // Remover de todas las zonas primero
          Object.keys(newItems).forEach(zoneId => {
            newItems[zoneId] = newItems[zoneId]?.filter(id => id !== active.id) || [];
          });
          
          // Agregar a la zona destino
          if (!newItems[over.id as string]) {
            newItems[over.id as string] = [];
          }
          newItems[over.id as string] = [...newItems[over.id as string], active.id as string];
          
          return newItems;
        });
      }
    } else if (!over) {
      // Si se suelta fuera de cualquier zona, remover de todas las zonas
      setDroppedItems(prev => {
        const newItems = { ...prev };
        Object.keys(newItems).forEach(zoneId => {
          newItems[zoneId] = newItems[zoneId]?.filter(id => id !== active.id) || [];
        });
        return newItems;
      });
    }
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setCurrentLayout(newLayout);
    setShowLayoutSelector(false);
    
    // Filtrar items que no son compatibles con el nuevo layout
    const newSchema = LAYOUT_SCHEMAS[newLayout];
    const validZoneIds = newSchema.zones.map(zone => zone.id);
    
    setDroppedItems(prev => {
      const filtered: DroppedItems = {};
      Object.keys(prev).forEach(zoneId => {
        if (validZoneIds.includes(zoneId)) {
          filtered[zoneId] = prev[zoneId];
        }
      });
      return filtered;
    });
  };

  const isItemDropped = (itemId: string) => {
    return Object.values(droppedItems).some(items => items?.includes(itemId));
  };

  const handleSave = () => {
    onSave?.(currentLayout, droppedItems);
    alert('Layout guardado correctamente!');
  };

  const currentSchema = LAYOUT_SCHEMAS[currentLayout];

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-100">
        {/* Header del Editor */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Editor de Layout</h1>
              <p className="text-sm text-gray-600">
                Layout actual: <span className="font-medium">{currentSchema.name}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLayoutSelector(!showLayoutSelector)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Cambiar Layout
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Panel Lateral - Widgets Disponibles */}
          <div className="w-80 bg-white border-r shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Widgets Disponibles</h3>
              
              <Droppable id="available-widgets" acceptedTypes={['small-card', 'card', 'chart-card']}>
                <div className="space-y-3 min-h-[300px] p-2">
                  {availableItems.filter(item => !isItemDropped(item.id)).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Todos los widgets están en uso</p>
                      <p className="text-xs mt-1">Arrastra elementos aquí para removerlos</p>
                    </div>
                  ) : (
                    availableItems.filter(item => !isItemDropped(item.id)).map(item => (
                      <Draggable key={item.id} id={item.id} type={item.type}>
                        <div>
                          <div className="text-lg">{item.content.icon}</div>
                          <div className="text-xs font-medium">{item.content.title}</div>
                          <div className="text-xs text-gray-500">{item.content.description}</div>
                        </div>
                      </Draggable>
                    ))
                  )}
                </div>
              </Droppable>
            </div>
          </div>

          {/* Área Principal */}
          <div className="flex-1">
            {showLayoutSelector ? (
              <div className="p-6">
                <LayoutSelector
                  currentLayout={currentLayout}
                  onLayoutChange={handleLayoutChange}
                />
              </div>
            ) : (
              <div className="h-screen overflow-auto">
                <LayoutRenderer
                  schema={currentSchema}
                  droppedItems={droppedItems}
                  availableItems={availableItems}
                  isEditMode={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};
