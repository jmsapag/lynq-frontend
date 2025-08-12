import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import Droppable from './droppable';

const meta: Meta<typeof Droppable> = {
  title: 'Dashboard/DragDrop/Droppable',
  component: Droppable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <div className="w-96 h-64">
          <Story />
        </div>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'droppable-1',
    children: (
      <div className="text-center text-gray-500">
        <p>Drop items here</p>
        <p className="text-sm mt-2">This is a droppable area</p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  args: {
    id: 'droppable-2',
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dashboard Widget</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p>Existing content in the droppable area</p>
        </div>
      </div>
    ),
  },
};

export const Empty: Story = {
  args: {
    id: 'droppable-3',
    children: null,
  },
};
