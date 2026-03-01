import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { LucideCircleArrowOutDownLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  Separator,
  Sidebar,
  SidebarItem,
} from "@/components/notion-ui/sidebar";
import { Button } from "@/components/notion-ui/button";

/* ------------------ Mock Data ------------------ */

const permissions = new Map([
  [
    "users",
    {
      id: 1,
      visible: true,
      permission: "Users",
      icon: "icons/users.svg",
      sub: new Map([
        [1, { id: 1, name: "Roles", is_category: true }],
        [2, { id: 2, name: "Permissions", is_category: true }],
      ]),
    },
  ],
  [
    "reports",
    {
      id: 2,
      visible: true,
      permission: "Reports",
      icon: "icons/reports.svg",
      sub: new Map(),
    },
  ],
]);

/* ------------------ Story Component ------------------ */

function StorySidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigateTo = useCallback((path: string) => {
    console.log("Navigate:", path);
  }, []);

  const sidebarItems = useMemo(() => {
    return (
      <>
        <SidebarItem
          path="/dashboard"
          permission={{
            id: 0,
            visible: true,
            permission: "Dashboard",
            icon: "icons/home.svg",
            sub: new Map(),
          }}
          isActive
          navigateTo={navigateTo}
          // ✅ no translate prop
          icon={{
            apiConfig: {
              src: "https://www.svgrepo.com/show/521994/bag.svg",
            },
          }}
        />

        {Array.from(permissions.values()).map((perm) => (
          <SidebarItem
            key={perm.permission}
            path={`/dashboard/${String(perm.permission).toLowerCase()}`}
            permission={perm}
            isActive={false}
            navigateTo={navigateTo}
            icon={{
              apiConfig: {
                src: "https://www.svgrepo.com/show/521994/bag.svg",
              },
            }}
          />
        ))}

        <Separator className="my-4" />

        <SidebarItem
          path="/dashboard/settings"
          permission={{
            id: 99,
            visible: true,
            permission: "Settings",
            icon: "icons/settings.svg",
            sub: new Map(),
          }}
          isActive={false}
          navigateTo={navigateTo}
          icon={{
            apiConfig: {
              src: "https://www.svgrepo.com/show/521994/bag.svg",
            },
          }}
        />
      </>
    );
  }, [navigateTo]);

  return (
    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}>
      <Sidebar.Header>
        <img
          src="https://placehold.co/48x40"
          className="w-12 h-10 rounded-lg"
          alt="logo"
        />
        <h1 className={`text-sm font-semibold ${collapsed ? "lg:hidden" : ""}`}>
          My App
        </h1>
      </Sidebar.Header>

      <Sidebar.Content className="pt-5">{sidebarItems}</Sidebar.Content>

      <Sidebar.Footer>
        <Button
          variant="icon"
          onClick={() => console.log("Exit")}
          className="mb-4 mx-auto text-xs font-semibold"
        >
          <LucideCircleArrowOutDownLeft className="size-[18px]" />
          <span className={collapsed ? "lg:hidden" : ""}>Exit</span>
        </Button>
      </Sidebar.Footer>
    </Sidebar>
  );
}

/* ------------------ Storybook Meta ------------------ */

const meta: Meta = {
  title: "Layout/AppSidebar",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="*" element={<StorySidebar />} />
      </Routes>
    </MemoryRouter>
  ),
};
