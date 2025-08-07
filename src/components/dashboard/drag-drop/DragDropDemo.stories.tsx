import type { Meta, StoryObj } from '@storybook/react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import Draggable from './draggable/draggable';
import Droppable from './droppable/droppable';

const DragDropDemo = () => {
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({
    'available-items': [],
    'drop-zone-1': [],
    'drop-zone-2': [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDroppedItems(prev => {
        const newItems = { ...prev };
        
        // Remove from all zones first
        Object.keys(newItems).forEach(zoneId => {
          newItems[zoneId] = newItems[zoneId].filter(id => id !== active.id);
        });
        
        // Add to target zone (only if it's a valid drop zone)
        if (newItems[over.id as string] !== undefined) {
          newItems[over.id as string] = [...newItems[over.id as string], active.id as string];
        }
        
        return newItems;
      });
    } else if (!over) {
      // If dropped outside any drop zone, remove from all zones (return to available items)
      setDroppedItems(prev => {
        const newItems = { ...prev };
        Object.keys(newItems).forEach(zoneId => {
          newItems[zoneId] = newItems[zoneId].filter(id => id !== active.id);
        });
        return newItems;
      });
    }
  };

  const availableItems = [
    { id: 'small-1', type: 'small-card' as const, content: { icon: '📊', title: 'Analytics' } },
    { id: 'card-1', type: 'card' as const, content: { icon: '📈', title: 'Sales Chart' } },
    { id: 'chart-1', type: 'chart-card' as const, content: { icon: '📉', title: 'Revenue Graph' } },
    { id: 'small-2', type: 'small-card' as const, content: { icon: '👥', title: 'Users' } },
    { id: 'card-2', type: 'card' as const, content: { icon: '🔔', title: 'Notifications' } },
  ];

  const isItemDropped = (itemId: string) => {
    return Object.values(droppedItems).some(items => items.includes(itemId));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-8 p-8 min-h-screen bg-gray-50">
        {/* Available Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Widgets</h3>
          <Droppable id="available-items" acceptedTypes={['small-card', 'card', 'chart-card']}>
            <div className="space-y-4 min-h-[200px]">
              {availableItems.filter(item => !isItemDropped(item.id)).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>All widgets in use</p>
                  <p className="text-sm mt-1">Drag items here to remove from dashboard</p>
                </div>
              ) : (
                availableItems.filter(item => !isItemDropped(item.id)).map(item => (
                  <Draggable key={item.id} id={item.id} type={item.type}>
                    <div>
                      <div className="text-2xl">{item.content.icon}</div>
                      <div className="text-sm font-medium">{item.content.title}</div>
                    </div>
                  </Draggable>
                ))
              )}
            </div>
          </Droppable>
        </div>

        {/* Drop Zones */}
        <div className="flex-1 space-y-6">
          <h3 className="text-lg font-semibold">Dashboard Layout</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium mb-2">Left Panel</h4>
              <Droppable id="drop-zone-1" acceptedTypes={['small-card', 'card', 'chart-card']}>
                <div className="space-y-2">
                  {droppedItems['drop-zone-1'].length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Drop widgets here</p>
                      <p className="text-sm mt-1">Left dashboard panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {droppedItems['drop-zone-1'].map(itemId => {
                        const item = availableItems.find(i => i.id === itemId);
                        return item ? (
                          <Draggable key={itemId} id={item.id} type={item.type} className="w-full">
                            <div>
                              <div className="text-lg">{item.content.icon}</div>
                              <div className="text-xs font-medium">{item.content.title}</div>
                            </div>
                          </Draggable>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </Droppable>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Right Panel</h4>
              <Droppable id="drop-zone-2" acceptedTypes={['small-card', 'card', 'chart-card']}>
                <div className="space-y-2">
                  {droppedItems['drop-zone-2'].length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>Drop widgets here</p>
                      <p className="text-sm mt-1">Right dashboard panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {droppedItems['drop-zone-2'].map(itemId => {
                        const item = availableItems.find(i => i.id === itemId);
                        return item ? (
                          <Draggable key={itemId} id={item.id} type={item.type} className="w-full">
                            <div>
                              <div className="text-lg">{item.content.icon}</div>
                              <div className="text-xs font-medium">{item.content.title}</div>
                            </div>
                          </Draggable>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </Droppable>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

const meta: Meta = {
  title: 'Dashboard/DragDrop/Complete Demo',
  component: DragDropDemo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveDashboard: Story = {
  render: () => <DragDropDemo />,
};
