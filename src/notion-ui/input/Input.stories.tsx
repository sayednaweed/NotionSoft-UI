import { Input } from "./input";
import type { Meta, StoryObj } from "@storybook/react";
import { Search, AlertTriangle } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "Form/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: { control: "text" },
    requiredHint: { control: "text" },
    errorMessage: { control: "text" },
    readOnly: { control: "boolean" },
    measurement: {
      control: "select",
      options: ["sm", "md", "lg", undefined],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

const Template = (args: any) => (
  <div className="w-[350px]">
    <Input {...args} />
  </div>
);

export const Default: Story = {
  render: Template,
  args: {
    label: "Username",
    placeholder: "Enter your username",
    measurement: "md",
  },
};

export const WithStartIcon: Story = {
  render: Template,
  args: {
    label: "Search",
    placeholder: "Search …",
    startContent: <Search size={18} />,
    measurement: "md",
  },
};

export const WithEndIcon: Story = {
  render: Template,
  args: {
    label: "Email",
    placeholder: "you@example.com",
    endContent: <AlertTriangle size={20} color="orange" />,
    measurement: "md",
  },
};

export const RequiredField: Story = {
  render: Template,
  args: {
    label: "Password",
    placeholder: "Enter password",
    required: true,
    requiredHint: "* Required",
    measurement: "md",
  },
};

export const WithErrorMessage: Story = {
  render: Template,
  args: {
    label: "Email",
    placeholder: "example@mail.com",
    errorMessage: "Invalid email format",
    measurement: "md",
  },
};

export const ReadOnly: Story = {
  render: Template,
  args: {
    label: "Read Only Field",
    value: "Can't change this",
    readOnly: true,
    measurement: "md",
  },
};

export const SizesShowcase: Story = {
  render: () => (
    <div className="space-y-5 w-[350px]">
      <Input label="Small" placeholder="Small size" measurement="sm" />
      <Input label="Medium" placeholder="Medium size" measurement="md" />
      <Input label="Large" placeholder="Large size" measurement="lg" />
    </div>
  ),
};
