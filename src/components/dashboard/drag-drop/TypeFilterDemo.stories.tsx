import type { Meta, StoryObj } from '@storybook/react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import Draggable from './draggable/draggable';
import Droppable from './droppable/droppable';

const TypeFilterDemo = () => {
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({
    'available-items': [],
    'small-widgets-zone': [],
    'large-widgets-zone': [],
    'chart-zone': [],
    'mixed-zone': [],
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
      const draggedItem = availableItems.find(item => item.id === active.id);
      const dropZone = dropZones.find(zone => zone.id === over.id);
      
      // Check if the drop zone accepts this type of item
      if (dropZone && draggedItem && dropZone.acceptedTypes.includes(draggedItem.type)) {
        setDroppedItems(prev => {
          const newItems = { ...prev };
          
          // Remove from all zones first
          Object.keys(newItems).forEach(zoneId => {
            newItems[zoneId] = newItems[zoneId].filter(id => id !== active.id);
          });
          
          // Add to target zone
          newItems[over.id as string] = [...newItems[over.id as string], active.id as string];
          
          return newItems;
        });
      }
    } else if (!over) {
      // If dropped outside any drop zone, remove from all zones
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
    { id: 'small-1', type: 'small-card' as const, content: { icon: '📊', title: 'Analytics', desc: 'Small widget' } },
    { id: 'small-2', type: 'small-card' as const, content: { icon: '👥', title: 'Users', desc: 'Small widget' } },
    { id: 'small-3', type: 'small-card' as const, content: { icon: '⚡', title: 'Speed', desc: 'Small widget' } },
    { id: 'card-1', type: 'card' as const, content: { icon: '📈', title: 'Sales Chart', desc: 'Regular card' } },
    { id: 'card-2', type: 'card' as const, content: { icon: '🔔', title: 'Notifications', desc: 'Regular card' } },
    { id: 'card-3', type: 'card' as const, content: { icon: '📋', title: 'Tasks', desc: 'Regular card' } },
    { id: 'chart-1', type: 'chart-card' as const, content: { icon: '📉', title: 'Revenue Graph', desc: 'Large chart' } },
    { id: 'chart-2', type: 'chart-card' as const, content: { icon: '📊', title: 'Data Viz', desc: 'Large chart' } },
  ];

  const dropZones = [
    {
      id: 'small-widgets-zone',
      title: 'Small Widgets Only',
      description: 'Only accepts small-card types',
      acceptedTypes: ['small-card' as const],
      className: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'large-widgets-zone',
      title: 'Regular Cards Only',
      description: 'Only accepts card types',
      acceptedTypes: ['card' as const],
      className: 'bg-green-50 border-green-200',
    },
    {
      id: 'chart-zone',
      title: 'Charts Only',
      description: 'Only accepts chart-card types',
      acceptedTypes: ['chart-card' as const],
      className: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'mixed-zone',
      title: 'Mixed Zone',
      description: 'Accepts all types',
      acceptedTypes: ['small-card' as const, 'card' as const, 'chart-card' as const],
      className: 'bg-gray-50 border-gray-200',
    },
  ];

  const isItemDropped = (itemId: string) => {
    return Object.values(droppedItems).some(items => items.includes(itemId));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-6 min-h-screen bg-gray-100">
        {/* Available Items */}
        <div className="w-80 space-y-4">
          <h3 className="text-lg font-semibold">Available Widgets</h3>
          <Droppable id="available-items" acceptedTypes={['small-card', 'card', 'chart-card']}>
            <div className="space-y-3 min-h-[300px] p-2">
              {availableItems.filter(item => !isItemDropped(item.id)).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>All widgets in use</p>
                  <p className="text-sm mt-1">Drag items here to return them</p>
                </div>
              ) : (
                availableItems.filter(item => !isItemDropped(item.id)).map(item => (
                  <Draggable key={item.id} id={item.id} type={item.type}>
                    <div>
                      <div className="text-xl">{item.content.icon}</div>
                      <div className="text-xs font-medium">{item.content.title}</div>
                      <div className="text-xs text-gray-500">{item.content.desc}</div>
                    </div>
                  </Draggable>
                ))
              )}
            </div>
          </Droppable>
        </div>

        {/* Drop Zones Grid */}
        <div className="flex-1 space-y-6">
          <h3 className="text-lg font-semibold">Specialized Drop Zones</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {dropZones.map(zone => (
              <div key={zone.id}>
                <h4 className="text-md font-medium mb-2">{zone.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                <Droppable 
                  id={zone.id} 
                  acceptedTypes={zone.acceptedTypes}
                >
                  {droppedItems[zone.id].length === 0 ? (
                    <div className="text-center text-gray-500 py-8 min-h-[200px] flex flex-col items-center justify-center">
                      <p>Drop {zone.acceptedTypes.join(' or ')} here</p>
                      <div className="text-xs mt-2 space-y-1">
                        {zone.acceptedTypes.map(type => (
                          <div key={type} className="bg-white px-2 py-1 rounded inline-block mr-1">
                            {type.replace('-', ' ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 min-h-[200px] p-4">
                      {droppedItems[zone.id].map(itemId => {
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
                </Droppable>
              </div>
            ))}
          </div>

          {/* Type Legend */}
          <div className="mt-8 p-4 bg-white rounded-lg border">
            <h4 className="font-medium mb-3">Widget Types</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Small Card - Compact widgets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span>Card - Regular widgets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                <span>Chart Card - Large visualizations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

const meta: Meta = {
  title: 'Dashboard/DragDrop/Type Filter Demo',
  component: TypeFilterDemo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeBasedDropZones: Story = {
  render: () => <TypeFilterDemo />,
};
