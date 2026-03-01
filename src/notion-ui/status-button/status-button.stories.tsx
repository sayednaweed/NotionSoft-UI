import { StatusButton } from "@/components/notion-ui/status-button";
import type { Meta, StoryObj } from "@storybook/react";

// --------------------------------------------
// Status options used for Storybook showcase
// --------------------------------------------
const statusOptions = {
  success: {
    style: "border-green-500 text-green-600",
    value: "Active",
  },
  error: {
    style: "border-red-500 text-red-600",
    value: "Error",
  },
  warning: {
    style: "border-yellow-500 text-yellow-600",
    value: "Warning",
  },
  neutral: {
    style: "border-gray-400 text-gray-600",
    value: "Unknown",
  },
};

// --------------------------------------------
// WRAPPER COMPONENT with real `status` prop
// --------------------------------------------
interface WrapperProps {
  status: keyof typeof statusOptions;
  className?: string;
}

function Wrapper({ status, className }: WrapperProps) {
  return (
    <StatusButton
      className={className}
      getColor={() => statusOptions[status]}
    />
  );
}

// --------------------------------------------
// Storybook meta (now uses Wrapper, not the original)
// --------------------------------------------
const meta: Meta<typeof Wrapper> = {
  title: "Button/StatusButton",
  component: Wrapper,
  argTypes: {
    status: {
      control: "select",
      options: Object.keys(statusOptions),
    },
    className: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Wrapper>;

// --------------------------------------------
// STORIES
// --------------------------------------------

export const Default: Story = {
  args: {
    status: "success",
  },
};

export const Error: Story = {
  args: {
    status: "error",
  },
};

export const Warning: Story = {
  args: {
    status: "warning",
  },
};

export const Neutral: Story = {
  args: {
    status: "neutral",
  },
};
