import { FilterDialog, IShowData } from "./filter-dialog";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof FilterDialog> = {
  title: "Dialogs/FilterDialog",
  component: FilterDialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof FilterDialog>;

const sortData: IShowData[] = [
  { name: "name", translate: "Name" },
  { name: "createdAt", translate: "Created date" },
  { name: "updatedAt", translate: "Updated date" },
];

const orderData: IShowData[] = [
  { name: "asc", translate: "Ascending" },
  { name: "desc", translate: "Descending" },
];

const searchData: IShowData[] = [
  { name: "title", translate: "Title" },
  { name: "code", translate: "Code" },
  { name: "owner", translate: "Owner" },
];

const baseArgs = {
  sortOnComplete: (v: any) => console.log("sortOnComplete:", v),
  orderOnComplete: (v: any) => console.log("orderOnComplete:", v),
  searchFilterChanged: (v: any) => console.log("searchFilterChanged:", v),
  dateOnComplete: (v: any) => console.log("dateOnComplete:", v),

  filters: {
    sort: "name",
    order: "asc",
    date: [], // keep empty to avoid heavy date logic in default story
    search: { column: "title", value: "" },
  },

  filtersShowData: {
    sort: sortData,
    order: orderData,
    search: searchData,
  },

  showColumns: {
    sort: true,
    order: true,
    search: true,
    date: false, // ✅ default off (safer)
  },

  translations: {
    sortPlaceholder: "Sort by",
    orderPlaceholder: "Order",
    searchPlaceholder: "Search",
    datePlaceholder: "Date",
    searchFilterPlaceholder: "Search filters",
    cancelPlaceholder: "Cancel",
  },

  onCancel: () => console.log("cancel"),
};

export const Default: Story = {
  args: baseArgs,
};

export const OnlySortAndOrder: Story = {
  args: {
    ...baseArgs,
    showColumns: { sort: true, order: true, search: false, date: false },
  },
};

export const OnlySearch: Story = {
  args: {
    ...baseArgs,
    showColumns: { sort: false, order: false, search: true, date: false },
  },
};

export const WithCustomTranslations: Story = {
  args: {
    ...baseArgs,
    translations: {
      sortPlaceholder: "ترتیب",
      orderPlaceholder: "جهت",
      searchPlaceholder: "جستجو",
      datePlaceholder: "تاریخ",
      searchFilterPlaceholder: "فلترها",
      cancelPlaceholder: "لغو",
    },
  },
};

export const InContainer: Story = {
  render: (args) => (
    <div className="w-[900px] max-w-[95vw] border rounded-md p-6">
      <FilterDialog {...args} />
    </div>
  ),
  args: baseArgs,
};

/**
 * If your MultiDatePicker works fine in Storybook, enable this story.
 * If it crashes because of missing CSS/provider, keep showColumns.date=false.
 */
export const WithDateEnabled: Story = {
  args: {
    ...baseArgs,
    showColumns: { sort: true, order: true, search: true, date: true },

    // If you want a pre-filled date:
    // filters: {
    //   ...baseArgs.filters,
    //   date: [new DateObject()],
    // },

    // Optional props passed into MultiDatePicker (since your component supports `date?: Omit<...>`)
    date: {
      // example: adjust to your MultiDatePicker API
      // placeholder: "Pick dates",
    },
  },
};
