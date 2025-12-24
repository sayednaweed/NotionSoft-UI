import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { LucideCircleArrowOutDownLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SidebarItem } from "@/components/notion-ui/sidebar/sidebar-item";
import Sidebar, { Separator } from "@/components/notion-ui/sidebar/sidebar";
import Button from "@/components/notion-ui/button";

/* ------------------ i18n Mock ------------------ */
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        app_name: "My App",
        dashboard: "Dashboard",
        settings: "Settings",
        users: "Users",
        roles: "Roles",
        exit_dashb: "Exit",
      },
    },
  },
});

/* ------------------ Mock Data ------------------ */

const permissions = new Map([
  [
    "users",
    {
      id: 1,
      visible: true,
      permission: "users",
      icon: "icons/users.svg",
      sub: new Map([
        [1, { id: 1, name: "roles", is_category: true }],
        [2, { id: 2, name: "permissions", is_category: true }],
      ]),
    },
  ],
  [
    "reports",
    {
      id: 2,
      visible: true,
      permission: "reports",
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
            permission: "dashboard",
            icon: "icons/home.svg",
            sub: new Map(),
          }}
          isActive
          navigateTo={navigateTo}
          translate={(k) => i18n.t(k)}
          icon={{
            apiConfig: {
              src: "https://www.svgrepo.com/show/521994/bag.svg",
            },
          }}
        />

        {Array.from(permissions.values()).map((perm) => (
          <SidebarItem
            key={perm.permission}
            path={`/dashboard/${perm.permission}`}
            permission={perm}
            isActive={false}
            navigateTo={navigateTo}
            translate={(k) => i18n.t(k)}
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
            permission: "settings",
            icon: "icons/settings.svg",
            sub: new Map(),
          }}
          isActive={false}
          navigateTo={navigateTo}
          translate={(k) => i18n.t(k)}
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
        />
        <h1 className={`text-sm font-semibold ${collapsed && "lg:hidden"}`}>
          {i18n.t("app_name")}
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
          <span className={collapsed ? "lg:hidden" : ""}>
            {i18n.t("exit_dashb")}
          </span>
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
      <I18nextProvider i18n={i18n}>
        <Routes>
          <Route path="*" element={<StorySidebar />} />
        </Routes>
      </I18nextProvider>
    </MemoryRouter>
  ),
};
