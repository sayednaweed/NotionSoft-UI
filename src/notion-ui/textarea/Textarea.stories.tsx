import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Form/Textarea",
  component: Textarea,
  args: {
    placeholder: "Write something...",
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

// ---------------------------------------
// Default
// ---------------------------------------
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

// ---------------------------------------
// With Label
// ---------------------------------------
export const WithLabel: Story = {
  args: {
    label: "Description",
    placeholder: "Enter description...",
  },
};

// ---------------------------------------
// Required Hint (*)
// ---------------------------------------
export const WithRequired: Story = {
  args: {
    label: "Bio",
    requiredHint: "*",
    placeholder: "Tell us about yourself...",
  },
};

// ---------------------------------------
// With Error Message (AnimatedItem visible)
// ---------------------------------------
export const WithError: Story = {
  args: {
    label: "Comment",
    errorMessage: "Comment is required",
    placeholder: "Add a comment...",
  },
};

// ---------------------------------------
// ReadOnly Example
// ---------------------------------------
export const ReadOnly: Story = {
  args: {
    label: "Readonly Field",
    readOnly: true,
    value: "This textarea cannot be edited",
  },
};

// ---------------------------------------
// Custom Root Class via classNames
// ---------------------------------------
export const CustomRootClass: Story = {
  args: {
    label: "Custom Styled",
    placeholder: "Root custom style applied",
    classNames: {
      rootDivClassName: "bg-blue-50 p-3 rounded-lg",
    },
  },
};
