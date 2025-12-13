import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import MultiTabInput, { OptionalTabs } from "./multi-tab-input";
import Tab from "../tab/tab";

const meta: Meta<typeof MultiTabInput> = {
  title: "Form/MultiTabInput",
  component: MultiTabInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An input component with tabbed sections for managing multiple related text inputs. Supports mandatory and optional tabs with automatic RTL/LTR text direction detection.",
      },
    },
  },
  argTypes: {
    onChanged: { action: "changed" },
    onTabChanged: { action: "tab changed" },
  },
};

export default meta;

type Story = StoryObj<typeof MultiTabInput>;

export const Default: Story = {
  render: (args) => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      title_english: "Sample product title",
      title_spanish: "Título de producto de ejemplo",
      title_french: "",
    });

    const [errors] = useState<Map<string, string>>(
      new Map([["title_french", "French title is required"]])
    );

    return (
      <div className="w-[400px]">
        <MultiTabInput
          {...args}
          name="title"
          label="Product Title"
          placeholder="Enter title..."
          tabData={tabData}
          errorData={errors}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>

          <OptionalTabs>
            <Tab>french</Tab>
          </OptionalTabs>
        </MultiTabInput>
      </div>
    );
  },
};

export const WithoutOptionalTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      username_english: "john_doe",
      username_german: "johndoe_de",
    });

    return (
      <div className="w-[400px]">
        <MultiTabInput
          name="username"
          label="Username"
          placeholder="Enter username"
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>german</Tab>
        </MultiTabInput>
      </div>
    );
  },
};

export const WithRTLTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      name_english: "International Company",
      name_arabic: "شركة دولية",
      name_farsi: "شرکت بین‌المللی",
    });

    const [errors] = useState<Map<string, string>>(
      new Map([
        ["name_arabic", "Arabic name is required"],
        ["name_farsi", "نام فارسی الزامی است"],
      ])
    );

    return (
      <div className="w-[400px]">
        <MultiTabInput
          name="name"
          label="Company Name"
          placeholder="Enter company name"
          tabData={tabData}
          errorData={errors}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>

          <OptionalTabs>
            <Tab>arabic</Tab>
            <Tab>farsi</Tab>
            <Tab>pashto</Tab>
          </OptionalTabs>
        </MultiTabInput>
      </div>
    );
  },
};

export const WithMultipleOptionalTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      sku_basic: "SKU-001",
      sku_internal: "INT-98432",
      sku_vendor: "VND-7781",
      sku_seo: "premium-product-sku",
    });

    return (
      <div className="w-[400px]">
        <MultiTabInput
          name="sku"
          label="Product SKU"
          placeholder="Enter SKU"
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
          classNames={{
            tabsDivClassName: "bg-gray-50 p-2 rounded-lg",
            rootDivClassName: "p-4 border rounded-lg",
          }}
        >
          <Tab>basic</Tab>
          <Tab>internal</Tab>

          <OptionalTabs>
            <Tab>vendor</Tab>
            <Tab>seo</Tab>
          </OptionalTabs>
        </MultiTabInput>
      </div>
    );
  },
};

export const WithErrorStates: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      email_english: "test@",
      email_spanish: "correo@",
      email_french: "email@",
    });

    const [errors] = useState<Map<string, string>>(
      new Map([
        ["email_english", "Invalid email address"],
        ["email_spanish", "Correo electrónico inválido"],
        ["email_french", "Adresse e-mail invalide"],
      ])
    );

    return (
      <div className="w-[400px]">
        <MultiTabInput
          name="email"
          label="Contact Email"
          placeholder="Enter email"
          tabData={tabData}
          errorData={errors}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>

          <OptionalTabs>
            <Tab>french</Tab>
          </OptionalTabs>
        </MultiTabInput>
      </div>
    );
  },
};

export const DisabledState: Story = {
  render: () => {
    const [tabData] = useState<Record<string, string>>({
      code_english: "READ_ONLY_001",
      code_spanish: "SOLO_LECTURA_001",
    });

    return (
      <div className="w-[400px]">
        <MultiTabInput
          name="code"
          label="Reference Code"
          placeholder="Read only"
          tabData={tabData}
          disabled
          onChanged={() => {}}
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>
        </MultiTabInput>
      </div>
    );
  },
};

export const InFormContext: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      price: "",
    });

    const [tabData, setTabData] = useState<Record<string, string>>({
      title_english: "",
      title_spanish: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log({
        ...formData,
        ...tabData,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="w-[400px] space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="Enter price"
          />
        </div>

        <MultiTabInput
          name="title"
          label="Product Title"
          placeholder="Enter title"
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>
        </MultiTabInput>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Product
        </button>
      </form>
    );
  },
};
