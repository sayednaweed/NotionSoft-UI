import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "./breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Basic: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem>dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>projects</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem active>storybook</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const WithHomeIcon: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbHome />
      <BreadcrumbSeparator />
      <BreadcrumbItem>dashboard</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem active>settings</BreadcrumbItem>
    </Breadcrumb>
  ),
};

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
      <BreadcrumbItem active>breadcrumb</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const ActiveItem: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbHome />
      <BreadcrumbSeparator />
      <BreadcrumbItem>patients</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>medical records</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem active>details</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const CustomStyled: Story = {
  render: () => (
    <Breadcrumb className="border-brand-200 bg-brand-50/70 dark:border-brand-500/20 dark:bg-brand-500/10">
      <BreadcrumbHome className="hover:text-brand-600 hover:fill-brand-600 dark:hover:text-brand-300 dark:hover:fill-brand-300" />
      <BreadcrumbSeparator className="text-brand-200 dark:text-brand-500/30" />
      <BreadcrumbItem className="text-brand-600 dark:text-brand-300">
        home
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem active className="font-semibold">
        profile
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};
