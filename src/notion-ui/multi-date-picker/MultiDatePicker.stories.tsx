import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DateObject from "react-date-object";

// Persian
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  MultiDatePicker,
  MultiDatePickerProps,
} from "@/components/notion-ui/multi-date-picker";

export default {
  title: "Date/MultiDatePicker",
  component: MultiDatePicker,
  parameters: {
    layout: "centered",
  },
} as Meta<MultiDatePickerProps>;

/* ------------------------ WRAPPER ------------------------ */
const Wrapper = (args: MultiDatePickerProps) => {
  const [dates, setDates] = React.useState<DateObject[]>(args.value);

  return (
    <div style={{ width: 360 }}>
      <MultiDatePicker
        {...args}
        value={dates}
        dateOnComplete={(selectedDates) => {
          setDates(selectedDates);
        }}
      />
    </div>
  );
};

/* ------------------------ DEFAULT ------------------------ */
export const Default: StoryObj<MultiDatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    text: { label: "Select dates", placeholder: "Select dates..." },
    measurement: "md",
    value: [],
  },
};

/* ------------------------ PERSIAN ------------------------ */
export const Persian: StoryObj<MultiDatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    text: { label: "تاریخ‌ها", placeholder: "تاریخ‌ها را انتخاب کنید" },
    measurement: "md",
    value: [],
    getLocalizations: () => ({
      calendar: persian,
      locale: persian_fa,
      months: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
      ],
    }),
  },
};

/* ------------------------ WITH ERROR ------------------------ */
export const WithError: StoryObj<MultiDatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    text: { label: "Dates", requiredHint: "*" },
    value: [],
    measurement: "md",
    error: "Please select at least one date",
  },
};

/* ------------------------ READONLY ------------------------ */
export const ReadOnly: StoryObj<MultiDatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    text: { label: "Dates" },
    value: [new DateObject(), new DateObject()],
    readOnly: true,
    measurement: "md",
  },
};
