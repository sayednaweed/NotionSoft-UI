import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import MultiSelectInputForward, {
  MultiSelectInputProps,
} from "./multi-select-input";

interface User {
  uuid: string;
  name: string;
  email: string;
  active: boolean;
  admin: boolean;
}

export default {
  title: "Select/MultiSelectInput",
  component: MultiSelectInputForward,
} as Meta<typeof MultiSelectInputForward>;

// ------------------ Mock data ------------------
const mockUsers: User[] = [
  {
    uuid: "1",
    name: "Alice",
    email: "alice@example.com",
    active: true,
    admin: false,
  },
  {
    uuid: "2",
    name: "Bob",
    email: "bob@example.com",
    active: false,
    admin: true,
  },
  {
    uuid: "3",
    name: "Charlie",
    email: "charlie@example.com",
    active: true,
    admin: true,
  },
  {
    uuid: "4",
    name: "David",
    email: "david@example.com",
    active: false,
    admin: false,
  },
];

// ------------------ Mock async fetch function ------------------
const fetchUsers = async (
  query: string,
  filters?: Record<string, boolean>,
  maxFetch?: number
) => {
  let result = mockUsers;

  // Apply filters
  if (filters) {
    result = result.filter((user) =>
      Object.entries(filters).every(([key, value]) =>
        value ? (user as any)[key] : true
      )
    );
  }

  // Apply search
  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  // Apply maxFetch
  if (maxFetch) result = result.slice(0, maxFetch);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  return result;
};

// ------------------ Template ------------------
const Template: StoryFn<MultiSelectInputProps<User>> = (args) => {
  const [selected, setSelected] = useState<User[]>([]);

  return (
    <div style={{ width: 400, padding: 20 }}>
      <MultiSelectInputForward
        {...args}
        selected={selected}
        onItemsSelect={(selectedItems) => {
          if (Array.isArray(selectedItems)) setSelected(selectedItems);
          else if (selectedItems) setSelected([selectedItems]);
          else setSelected([]);
        }}
      />
      <div style={{ marginTop: 20 }}>
        <strong>Selected Users:</strong>
        <pre>{JSON.stringify(selected, null, 2)}</pre>
      </div>
    </div>
  );
};

// ------------------ Stories ------------------

// Multiple selection story
export const MultipleSelection = Template.bind({});
MultipleSelection.args = {
  fetch: fetchUsers,
  selectionMode: "multiple",
  searchBy: ["name", "email"],
  itemKey: "uuid",
  filters: [
    { key: "active", name: "Active" },
    { key: "admin", name: "Admin" },
  ],
  text: {
    fetch: "Loading users...",
    notItem: "No users found",
    maxRecord: "Max results",
    clearFilters: "Clear Filters",
  },
};

// Single selection story
export const SingleSelection = Template.bind({});
SingleSelection.args = {
  fetch: fetchUsers,
  selectionMode: "single",
  searchBy: ["name", "email"],
  itemKey: "uuid",
  filters: [
    { key: "active", name: "Active" },
    { key: "admin", name: "Admin" },
  ],
  text: {
    fetch: "Loading users...",
    notItem: "No users found",
    maxRecord: "Max results",
    clearFilters: "Clear Filters",
  },
};
