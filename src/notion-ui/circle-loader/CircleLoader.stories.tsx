import type { Meta, StoryObj } from "@storybook/react";
import { CircleLoader } from "./circle-loader";

const meta: Meta<typeof CircleLoader> = {
  title: "Feedback/CircleLoader",
  component: CircleLoader,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
    },
    className: {
      control: false,
    },
    classNames: {
      control: false,
    },
  },
  args: {
    label: "Loading",
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

export const WithoutLabel: Story = {
  args: {
    label: "",
  },
};

export const LargeLoader: Story = {
  args: {
    classNames: {
      circleClassName: "h-12 w-12",
    },
    label: "Processing",
  },
};

export const DarkBackground: Story = {
  render: (args) => (
    <div className="bg-slate-900 p-8">
      <CircleLoader {...args} />
    </div>
  ),
};
