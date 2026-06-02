import { MultiSelectInput } from "@/components/notion-ui/multi-select-input";
import type { Meta, StoryObj } from "@storybook/react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

const users: User[] = [
  {
    id: 1,
    name: "Ahmad Wali",
    email: "ahmad@example.com",
    role: "Engineer",
    active: true,
  },
  {
    id: 2,
    name: "Mina Rahimi",
    email: "mina@example.com",
    role: "Designer",
    active: true,
  },
  {
    id: 3,
    name: "Farid Popal",
    email: "farid@example.com",
    role: "Manager",
    active: false,
  },
  {
    id: 4,
    name: "Laila Noori",
    email: "laila@example.com",
    role: "QA",
    active: true,
  },
];

const fetchUsers = async (
  searchValue: string,
  filters?: Record<string, boolean>,
  maxFetch = 30,
): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const query = searchValue.toLowerCase();

  return users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query);

      const matchesActive = !filters?.active || user.active;
      const matchesEngineer = !filters?.engineer || user.role === "Engineer";

      return matchesSearch && matchesActive && matchesEngineer;
    })
    .slice(0, maxFetch);
};

const text = {
  label: "Users",
  required: "Required",
  notItem: "No users found",
  maxRecord: "Max records",
  clearFilters: "Clear filters",
};

const meta: Meta<typeof MultiSelectInput<User>> = {
  title: "Notion UI/MultiSelectInput",
  component: MultiSelectInput,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
    },
    selectionMode: {
      control: "select",
      options: ["single", "multiple"],
    },
    readOnly: {
      control: "boolean",
    },
    showMaxFetch: {
      control: "boolean",
    },
    debounceValue: {
      control: "number",
    },
  },
  args: {
    placeholder: "Search users...",
    selectionMode: "multiple",
    itemKey: "id",
    searchBy: ["name", "email"],
    fetch: fetchUsers,
    showMaxFetch: true,
    debounceValue: 300,
    readOnly: false,
    text,
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelectInput<User>>;

export const Default: Story = {};

export const SingleSelect: Story = {
  args: {
    selectionMode: "single",
    placeholder: "Select one user...",
  },
};

export const MultipleSelect: Story = {
  args: {
    selectionMode: "multiple",
    placeholder: "Select users...",
  },
};

export const WithFixedOptions: Story = {
  args: {
    fetch: fetchUsers,
    fixedOptions: users,
    placeholder: "Select from fixed users...",
    showMaxFetch: false,
  },
};

export const WithSelectedItems: Story = {
  args: {
    selected: [users[0], users[1]],
  },
};

export const ErrorState: Story = {
  args: {
    errorMessage: "Please select at least one user.",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    selected: [users[0]],
    fetch: fetchUsers,
  },
};

export const CustomRenderItem: Story = {
  args: {
    renderItem: (user, selected) => (
      <div
        style={{
          padding: "8px 12px",
          background: selected ? "#f1f5f9" : "transparent",
          cursor: "pointer",
        }}
      >
        <strong>{user.name}</strong>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {user.email} · {user.role}
        </div>
      </div>
    ),
  },
};

export const WithFilters: Story = {
  args: {
    filters: [
      {
        key: "active",
        name: "Active users",
      },
      {
        key: "engineer",
        name: "Engineers",
      },
    ],
  },
};

export const AllExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 420 }}>
      <MultiSelectInput<User>
        placeholder="Multiple select..."
        selectionMode="multiple"
        itemKey="id"
        searchBy={["name", "email"]}
        fetch={fetchUsers}
        text={{
          ...text,
          label: "Multiple select",
        }}
      />

      <MultiSelectInput<User>
        placeholder="Single select..."
        selectionMode="single"
        itemKey="id"
        searchBy={["name", "email"]}
        fetch={fetchUsers}
        text={{
          ...text,
          label: "Single select",
        }}
      />

      <MultiSelectInput<User>
        placeholder="Fixed options..."
        selectionMode="multiple"
        itemKey="id"
        searchBy={["name", "email"]}
        fetch={fetchUsers}
        fixedOptions={users}
        text={{
          ...text,
          label: "Fixed options",
        }}
      />

      <MultiSelectInput<User>
        placeholder="Read only..."
        selectionMode="multiple"
        itemKey="id"
        searchBy={["name", "email"]}
        fetch={fetchUsers}
        fixedOptions={users}
        selected={[users[0]]}
        readOnly
        text={{
          ...text,
          label: "Read only",
        }}
      />
    </div>
  ),
};
