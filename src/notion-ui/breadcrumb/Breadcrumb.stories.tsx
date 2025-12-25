// Breadcrumb.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

/**
 * Basic breadcrumb with text items
 */
export const Basic: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>projects</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>storybook</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/**
 * Breadcrumb with home icon
 */
export const WithHomeIcon: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbHome />
      <BreadcrumbSeparator />
      <BreadcrumbItem>dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>settings</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/**
 * Long breadcrumb path to demonstrate horizontal scrolling
 */
export const LongPath: Story = {
  render: () => (
    <Breadcrumb className="max-w-xs">
      <BreadcrumbHome />
      <BreadcrumbSeparator />
      <BreadcrumbItem>dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>projects</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>frontend</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>components</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  ),
};

/**
 * Custom styled breadcrumb
 */
export const CustomStyled: Story = {
  render: () => (
    <Breadcrumb className="bg-muted border-dashed">
      <BreadcrumbHome className="text-primary" />
      <BreadcrumbSeparator className="text-primary/30" />
      <BreadcrumbItem className="text-primary">home</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem className="font-semibold">profile</BreadcrumbItem>
    </Breadcrumb>
  ),
};
