import type { Meta, StoryObj } from "@storybook/react";
import { CircleLoader, type CircleLoaderProps } from "./circle-loader";

const meta: Meta<typeof CircleLoader> = {
  title: "Loader/CircleLoader",
  component: CircleLoader,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    className: { control: "text" },
    labelclassname: { control: "text" },
    parentClassName: { control: "text" },
  },
  args: {
    label: "Loading...",
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof CircleLoader>;

export const Default: Story = {};

export const WithCustomLabel: Story = {
  args: {
    label: "Fetching data...",
  },
};

export const BiggerSpinner: Story = {
  args: {
    // Tailwind classes to control svg size (component default is w-8 h-8)
    className: "w-12 h-12",
    label: "Please wait",
  },
};

export const MutedLabel: Story = {
  args: {
    label: "Loading",
    labelclassname: "opacity-60 font-normal",
  },
};

export const InContainer: Story = {
  render: (args: CircleLoaderProps) => (
    <div className="w-[320px] h-[180px] border rounded-md flex items-center justify-center">
      <CircleLoader {...args} />
    </div>
  ),
  args: {
    label: "Loading inside a box",
  },
};

export const AlignStart: Story = {
  args: {
    parentClassName: "items-start justify-start",
    label: "Top-left alignment",
  },
  render: (args: CircleLoaderProps) => (
    <div className="w-[320px] h-[180px] border rounded-md p-4">
      <CircleLoader {...args} />
    </div>
  ),
};
