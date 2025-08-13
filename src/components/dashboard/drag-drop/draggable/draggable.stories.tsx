import type { Meta, StoryObj } from "@storybook/react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import Draggable from "./draggable";
import Droppable from "../droppable/droppable";

const meta: Meta<typeof Draggable> = {
  title: "Dashboard/DragDrop/Draggable",
  component: Draggable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["small-card", "card", "chart-card"],
    },
  },
  decorators: [
    (Story) => (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8 p-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Draggable Items</h3>
            <Story />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Drop Zone</h3>
            <Droppable id="story-drop-zone">
              <div className="text-center text-gray-500">
                <p>Drop items here</p>
              </div>
            </Droppable>
          </div>
        </div>
      </DndContext>
    ),
  ],
};

function handleDragEnd(event: DragEndEvent) {
  console.log("Drag ended:", event);
}

export default meta;
type Story = StoryObj<typeof meta>;

export const SmallCard: Story = {
  args: {
    id: "small-card-1",
    type: "small-card",
    children: (
      <div>
        <div className="text-lg font-bold">📊</div>
        <div className="text-xs">Small Widget</div>
      </div>
    ),
  },
};

export const Card: Story = {
  args: {
    id: "card-1",
    type: "card",
    children: (
      <div>
        <div className="text-2xl font-bold">📈</div>
        <div className="text-sm">Regular Card</div>
      </div>
    ),
  },
};

export const ChartCard: Story = {
  args: {
    id: "chart-card-1",
    type: "chart-card",
    children: (
      <div>
        <div className="text-3xl font-bold">📉</div>
        <div className="text-sm">Chart Widget</div>
        <div className="text-xs text-gray-500 mt-1">Large visualization</div>
      </div>
    ),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Draggable id="small-1" type="small-card">
        <div>
          <div className="text-lg">📊</div>
          <div className="text-xs">Small</div>
        </div>
      </Draggable>
      <Draggable id="regular-1" type="card">
        <div>
          <div className="text-xl">📈</div>
          <div className="text-sm">Regular</div>
        </div>
      </Draggable>
      <Draggable id="chart-1" type="chart-card">
        <div>
          <div className="text-2xl">📉</div>
          <div className="text-sm">Chart</div>
        </div>
      </Draggable>
    </div>
  ),
};
