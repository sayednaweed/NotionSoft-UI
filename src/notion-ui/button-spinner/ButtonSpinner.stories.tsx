import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import ButtonSpinner from "./button-spinner";
import Button from "../button/button";

const meta: Meta<typeof ButtonSpinner> = {
  title: "Components/ButtonSpinner",
  component: ButtonSpinner,
  tags: ["autodocs"],
  argTypes: {
    loading: {
      control: "boolean",
    },
    children: {
      control: false,
    },
  },
  args: {
    loading: false,
  },
};

export default meta;

type Story = StoryObj<typeof ButtonSpinner>;

export const Default: Story = {
  render: (args) => (
    <Button>
      <ButtonSpinner {...args}>Submit</ButtonSpinner>
    </Button>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => (
    <Button>
      <ButtonSpinner {...args}>Submitting</ButtonSpinner>
    </Button>
  ),
};

export const WithDifferentText: Story = {
  args: {
    loading: true,
  },
  render: (args) => (
    <Button variant="success">
      <ButtonSpinner {...args}>Saving</ButtonSpinner>
    </Button>
  ),
};

export const InlineUsage: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span>Loading</span>
      <ButtonSpinner loading={true}>
        <span className="sr-only">spinner</span>
      </ButtonSpinner>
    </div>
  ),
};
