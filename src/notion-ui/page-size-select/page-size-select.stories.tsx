import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { PageSizeSelect } from "./page-size-select";

const meta: Meta<typeof PageSizeSelect> = {
  title: "Select/PageSizeSelect",
  component: PageSizeSelect,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A pagination page-size selector with:
- Preset options
- Custom numeric input
- LocalStorage persistence (or custom save/load)
- Smart dropdown positioning (up/down)
        `,
      },
    },
  },
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;

type Story = StoryObj<typeof PageSizeSelect>;

const OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

/* ---------------------------------------------
   Default
--------------------------------------------- */
export const Default: Story = {
  args: {
    placeholder: "Select page size",
    emptyPlaceholder: "No options",
    rangePlaceholder: "Custom size",
    paginationKey: "storybook-page-size",
    options: OPTIONS,
  },
};

/* ---------------------------------------------
   With State Preview
--------------------------------------------- */
export const WithState: Story = {
  render: (args) => {
    const [value, setValue] = useState<string>("");

    return (
      <div className="w-64 space-y-3">
        <PageSizeSelect
          {...args}
          onChange={(v) => {
            setValue(v);
            args.onChange?.(v);
          }}
        />

        <div className="text-sm text-muted-foreground">
          Selected value: <strong>{value || "-"}</strong>
        </div>
      </div>
    );
  },
  args: {
    placeholder: "Page size",
    emptyPlaceholder: "No options available",
    rangePlaceholder: "Enter number",
    paginationKey: "storybook-with-state",
    options: OPTIONS,
  },
};

/* ---------------------------------------------
   Empty Options
--------------------------------------------- */
export const EmptyOptions: Story = {
  args: {
    placeholder: "Page size",
    emptyPlaceholder: "Nothing to show",
    rangePlaceholder: "Enter number",
    paginationKey: "storybook-empty",
    options: [],
  },
};

/* ---------------------------------------------
   Custom Storage (Mock)
--------------------------------------------- */
export const CustomStorage: Story = {
  args: {
    placeholder: "Page size",
    emptyPlaceholder: "No data",
    rangePlaceholder: "Custom size",
    paginationKey: "storybook-custom-storage",
    options: OPTIONS,
    save: async (key, data) => {
      console.log("Saved:", key, data);
    },
    load: async () => {
      return {
        key: "storybook-custom-storage",
        value: "20",
        option: 1,
      };
    },
  },
};
