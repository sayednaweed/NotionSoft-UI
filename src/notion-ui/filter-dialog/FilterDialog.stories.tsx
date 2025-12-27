import type { Meta, StoryObj } from "@storybook/react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DateObject } from "react-multi-date-picker";

import { FilterDialog } from "./filter-dialog";

/* ------------------ i18n Mock ------------------ */
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        search_filters: "Search Filters",
        sort_by: "Sort By",
        order: "Order",
        search: "Search",
        date: "Date",
        cancel: "Cancel",

        name: "Name",
        date_col: "Date",
        asc: "Ascending",
        desc: "Descending",
        title: "Title",
        author: "Author",
      },
    },
  },
});

/* ------------------ Mock Data ------------------ */

const sortOptions = [
  { name: "name", translate: i18n.t("name") },
  { name: "date", translate: i18n.t("date_col") },
];

const orderOptions = [
  { name: "asc", translate: i18n.t("asc") },
  { name: "desc", translate: i18n.t("desc") },
];

const searchOptions = [
  { name: "title", translate: i18n.t("title") },
  { name: "author", translate: i18n.t("author") },
];

/* ------------------ Storybook Meta ------------------ */

const meta: Meta<typeof FilterDialog> = {
  title: "Dialog/FilterDialog",
  component: FilterDialog,
  parameters: {
    layout: "centered",
  },
};

export default meta;

/* ------------------ Stories ------------------ */

export const Default: StoryObj<typeof FilterDialog> = {
  render: () => (
    <I18nextProvider i18n={i18n}>
      <FilterDialog
        sortOnComplete={(item) => console.log("Sort:", item)}
        orderOnComplete={(item) => console.log("Order:", item)}
        searchFilterChanged={(item) => console.log("Search:", item)}
        dateOnComplete={(dates: DateObject[]) =>
          console.log(
            "Dates:",
            dates.map((d) => d.format())
          )
        }
        onCancel={() => console.log("Cancel")}
        filters={{
          sort: "name",
          order: "asc",
          search: { column: "title" },
          date: [],
        }}
        filtersShowData={{
          sort: sortOptions,
          order: orderOptions,
          search: searchOptions,
        }}
        showColumns={{
          sort: true,
          order: true,
          search: true,
          date: true,
        }}
        date={{
          text: { placeholder: "Select a date", to: "To" },
        }}
      />
    </I18nextProvider>
  ),
};
