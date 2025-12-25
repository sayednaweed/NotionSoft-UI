// Pagination.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Pagination from "./pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    lastPage: {
      control: { type: "number", min: 1 },
    },
    onPageChange: {
      action: "page changed",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

/**
 * Default pagination
 */
export const Default: Story = {
  args: {
    lastPage: 10,
  },
};

/**
 * Small number of pages (no ellipsis)
 */
export const SmallDataset: Story = {
  args: {
    lastPage: 5,
  },
};

/**
 * Large dataset with ellipsis behavior
 */
export const LargeDataset: Story = {
  args: {
    lastPage: 50,
  },
};

/**
 * Single page (navigation disabled)
 */
export const SinglePage: Story = {
  args: {
    lastPage: 1,
  },
};
