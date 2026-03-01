import { ShiningText } from "./shining-text";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ShiningText> = {
  title: "Text/ShiningText",
  component: ShiningText,
  args: {
    text: "Loading...",
  },
};

export default meta;

type Story = StoryObj<typeof ShiningText>;

export const Default: Story = {
  args: {
    text: "Loading...",
    className: "text-4xl font-bold",
  },
};

export const Large: Story = {
  args: {
    text: "Loading...",
    className: "text-6xl from-black via-gray-100 to-black font-extrabold",
  },
};

export const CustomGradient: Story = {
  args: {
    text: "Custom Gradient",
    className:
      "text-5xl font-semibold from-black via-white to-blue-400 font-extrabold",
  },
};

export const Small: Story = {
  args: {
    text: "Loading...",
    className: "text-md font-medium from-black via-gray-100 to-black",
  },
};
