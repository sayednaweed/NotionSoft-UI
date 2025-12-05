import type { Meta, StoryObj } from "@storybook/react";
import PasswordInput, { PasswordInputProps } from "./password-input";

const meta: Meta<PasswordInputProps> = {
  title: "Form/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Initial password value",
    },
    parentClassName: {
      control: "text",
      description: "Wrapper className",
    },
  },
};

export default meta;
type Story = StoryObj<PasswordInputProps>;

export const Default: Story = {
  args: {
    placeholder: "Enter password...",
    parentClassName: "",
    text: {
      strong_password: "Strong password",
      enter_password: "Enter a password",
      weak_password: "Weak password",
      medium_password: "Medium strength",
      must_contain: "Your password must contain:",
      at_lea_8_char: "At least 8 characters",
      at_lea_1_num: "At least one number",
      at_lea_1_lowcas_lett: "At least one lowercase letter",
      at_lea_1_upcas_lett: "At least one uppercase letter",
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    placeholder: "Enter password...",
    text: {
      strong_password: "Strong password",
      enter_password: "Enter a password",
      weak_password: "Weak password",
      medium_password: "Medium strength",
      must_contain: "Your password must contain:",
      at_lea_8_char: "At least 8 characters",
      at_lea_1_num: "At least one number",
      at_lea_1_lowcas_lett: "At least one lowercase letter",
      at_lea_1_upcas_lett: "At least one uppercase letter",
    },
  },
};
