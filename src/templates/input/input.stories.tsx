import { Meta, Story } from "@storybook/react-vite";
import Input, { InputProps, MultiSelectOption } from "./input";

const mockOptions: MultiSelectOption[] = [
  { label: "Alice", value: "1" },
  { label: "Bob", value: "2" },
  { label: "Charlie", value: "3" },
  { label: "David", value: "4" },
];

export default {
  title: "Components/Input",
  component: Input,
  argTypes: {
    showFilters: { control: "boolean" },
    placeholder: { control: "text" },
  },
} as Meta;

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const WithFilters = Template.bind({});
WithFilters.args = {
  showFilters: true,
  filters: { activeOnly: true, includeArchived: false },
  mockOptions,
};

export const WithoutFilters = Template.bind({});
WithoutFilters.args = {
  showFilters: false,
  mockOptions,
  placeholder: "Search users...",
};
