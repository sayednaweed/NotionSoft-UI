import type { Meta, StoryObj } from "@storybook/react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableRowIcon,
} from "./table";

/* ------------------ Mock Helpers ------------------ */

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const mockItem = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
};

/* ------------------ Meta ------------------ */

const meta: Meta = {
  title: "Table/Table",
  parameters: {
    layout: "centered",
  },
};

export default meta;

/* ------------------ Stories ------------------ */

export const BasicTable: StoryObj = {
  render: () => (
    <Table className="min-w-[500px]">
      <TableCaption>Simple table example</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithRowActions: StoryObj = {
  render: () => (
    <Table className="min-w-[600px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRowIcon
          item={mockItem}
          read
          edit
          remove
          onRead={async (item) => {
            console.log("Read:", item);
            await wait(800);
          }}
          onEdit={async (item) => {
            console.log("Edit:", item);
            await wait(800);
          }}
          onRemove={async (item) => {
            console.log("Remove:", item);
            await wait(800);
          }}
        >
          <TableCell>{mockItem.name}</TableCell>
          <TableCell>{mockItem.email}</TableCell>
          <TableCell>{mockItem.role}</TableCell>
        </TableRowIcon>
      </TableBody>
    </Table>
  ),
};

export const ReadOnlyAction: StoryObj = {
  render: () => (
    <Table className="min-w-[600px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRowIcon
          item={mockItem}
          read
          onRead={async (item) => {
            console.log("Read only:", item);
            await wait(600);
          }}
          onEdit={async () => {}}
          onRemove={async () => {}}
        >
          <TableCell>{mockItem.name}</TableCell>
          <TableCell>{mockItem.email}</TableCell>
        </TableRowIcon>
      </TableBody>
    </Table>
  ),
};

export const EmptyState: StoryObj = {
  render: () => (
    <Table className="min-w-[400px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="text-center text-muted-foreground">
            No data available
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
