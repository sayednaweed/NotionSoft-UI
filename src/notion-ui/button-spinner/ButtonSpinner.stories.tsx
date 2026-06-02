import type { Meta, StoryObj } from "@storybook/react";
import { ButtonSpinner, IButtonSpinnerProps } from "./button-spinner";

const meta: Meta<typeof ButtonSpinner> = {
  title: "Button/ButtonSpinner",
  component: ButtonSpinner,
  tags: ["autodocs"],
  argTypes: {
    loading: { control: "boolean" },
    text: { control: "text" },
    icon: { control: false },
    buttonProps: { control: false },
    className: { control: "text" },
  },
  args: {
    loading: false,
    text: "Submit",
  },
};

export default meta;

type Story = StoryObj<typeof ButtonSpinner>;

// --------- Stories ---------

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
    text: "Submitting",
  },
};

export const WithDifferentText: Story = {
  args: {
    loading: true,
    text: "Saving",
    buttonProps: { variant: "success" },
  },
};

export const WithCustomIcon: Story = {
  args: {
    loading: true,
    text: "Uploading",
    icon: <span className="material-icons">cloud_upload</span>,
  },
};

export const InlineSmallButton: Story = {
  args: {
    loading: true,
    text: "Processing",
  },
};
