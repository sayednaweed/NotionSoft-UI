import type { Meta, StoryObj } from "@storybook/react";
import PhoneInput from "./phone-input";

const meta: Meta<typeof PhoneInput> = {
  title: "Form/PhoneInput",
  component: PhoneInput,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "Phone number",
  },
};

export default meta;

type Story = StoryObj<typeof PhoneInput>;

// ---------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------
export const Default: Story = {
  args: {
    placeholder: "Enter phone number",
  },
};

// ---------------------------------------------------------------------
// With Label
// ---------------------------------------------------------------------
export const WithLabel: Story = {
  args: {
    label: "Phone Number",
  },
};

// ---------------------------------------------------------------------
// Required Hint (*)
// ---------------------------------------------------------------------
export const Required: Story = {
  args: {
    label: "Phone Number",
    requiredHint: "*",
  },
};

// ---------------------------------------------------------------------
// With Error
// ---------------------------------------------------------------------
export const WithError: Story = {
  args: {
    label: "Contact Number",
    errorMessage: "Invalid phone number",
  },
};

// ---------------------------------------------------------------------
// Pre-filled value
// ---------------------------------------------------------------------
export const PreFilled: Story = {
  args: {
    label: "Phone Number",
    value: "+93 700000000",
  },
};

// ---------------------------------------------------------------------
// Sizes (sm, md, lg)
// ---------------------------------------------------------------------
export const Small: Story = {
  args: {
    label: "Small",
    measurement: "sm",
  },
};

export const Medium: Story = {
  args: {
    label: "Medium",
    measurement: "md",
  },
};

export const Large: Story = {
  args: {
    label: "Large",
    measurement: "lg",
  },
};

// ---------------------------------------------------------------------
// Read-Only
// ---------------------------------------------------------------------
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: "+93 700000000",
    label: "Read-only Phone",
  },
};

// ---------------------------------------------------------------------
// Custom Root Class Styles
// ---------------------------------------------------------------------
export const CustomRootClass: Story = {
  args: {
    label: "Custom Style",
    classNames: {
      rootDivClassName: "p-4 bg-blue-50 rounded-md",
    },
  },
};
