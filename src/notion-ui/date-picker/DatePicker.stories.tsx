import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DateObject from "react-date-object";

import DatePicker, { DatePickerProps } from "./date-picker";

// Persian
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default {
  title: "Date/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
} as Meta<DatePickerProps>;

const Wrapper = (args: DatePickerProps) => {
  const [value, setValue] = React.useState<DateObject | undefined>(
    typeof args.value === "string"
      ? new DateObject(new Date(args.value))
      : args.value
  );

  return (
    <div style={{ width: 320 }}>
      <DatePicker
        {...args}
        value={value}
        dateOnComplete={(date) => {
          setValue(date);
          return false;
        }}
      />
    </div>
  );
};

/* ------------------------ DEFAULT ------------------------ */
export const Default: StoryObj<DatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    placeholder: "Select date...",
    required: false,
    label: "Date",
    measurement: "md",
  },
};

/* ------------------------ PERSIAN ------------------------ */
export const Persian: StoryObj<DatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    placeholder: "تاریخ را انتخاب کنید",
    label: "تاریخ",
    measurement: "md",
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
export const WithError: StoryObj<DatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    placeholder: "Select date...",
    label: "Birthday",
    errorMessage: "This field is required",
    required: true,
    requiredHint: "*",
  },
};

/* ------------------------ READONLY ------------------------ */
export const ReadOnly: StoryObj<DatePickerProps> = {
  render: (args) => <Wrapper {...args} />,
  args: {
    placeholder: "Read-only field",
    label: "Date",
    readOnly: true,
  },
};
