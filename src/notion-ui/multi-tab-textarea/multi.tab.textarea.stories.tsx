import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { OptionalTabs, Tab } from "../tab/tab";
import MultiTabTextarea from "../multi-tab-textarea";

const meta: Meta<typeof MultiTabTextarea> = {
  title: "Form/MultiTabTextarea",
  component: MultiTabTextarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A textarea component with tabbed sections for managing multiple related text inputs. Supports mandatory and optional tabs with automatic RTL/LTR text direction detection.",
      },
    },
  },
  argTypes: {
    onChanged: { action: "changed" },
    onTabChanged: { action: "tab changed" },
  },
};

export default meta;

type Story = StoryObj<typeof MultiTabTextarea>;

export const Default: Story = {
  render: (args) => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      description_en: "This is a sample product description.",
      description_es: "Esta es una descripción de producto de muestra.",
      description_fr: "",
    });

    const [errors, setErrors] = useState<Map<string, string>>(
      new Map([["description_fr", "French description is required"]])
    );

    const handleChange = (value: string, name: string) => {
      setTabData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleTabChanged = (
      key: string,
      value: string,
      optional?: boolean
    ) => {
      console.log("Tab changed:", { key, value, optional });
    };

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          {...args}
          name="description"
          label="Product Description"
          placeholder="Enter your description here..."
          tabData={tabData}
          errorData={errors}
          onChanged={handleChange}
          onTabChanged={handleTabChanged}
        >
          {/* Mandatory tabs */}
          <Tab>english</Tab>
          <Tab>spanish</Tab>

          {/* Optional tabs */}
          <OptionalTabs>
            <Tab>french</Tab>
          </OptionalTabs>
        </MultiTabTextarea>
      </div>
    );
  },
};

export const WithoutOptionalTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      bio_en: "I'm a software developer with 5 years of experience.",
      bio_de: "Ich bin Softwareentwickler mit 5 Jahren Erfahrung.",
    });

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="bio"
          label="Biography"
          placeholder="Tell us about yourself..."
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>german</Tab>
        </MultiTabTextarea>
      </div>
    );
  },
};

export const WithRTLTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      content_en: "Welcome to our international platform.",
      content_ar: "مرحبًا بكم في منصتنا الدولية.",
      content_fa: "به پلتفرم بین‌المللی ما خوش آمدید.",
    });

    const [errors, setErrors] = useState<Map<string, string>>(
      new Map([
        ["content_ar", "Arabic content must be at least 20 characters"],
        ["content_fa", "فارسی باید حداقل 20 کاراکتر باشد"],
      ])
    );

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="content"
          label="Content"
          placeholder="Type your content here..."
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
        </MultiTabTextarea>
      </div>
    );
  },
};

export const WithMultipleOptionalTabs: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      product_details_basic:
        "A premium quality product with excellent durability.",
      product_details_advanced:
        "Made from 100% recycled materials. Water-resistant up to 50m.",
      product_details_technical:
        "Material: Polycarbonate\nWeight: 150g\nDimensions: 10x5x2cm",
      product_details_seo:
        "Premium durable product for everyday use. Best value for money.",
    });

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="product_details"
          label="Product Details"
          placeholder="Enter product information..."
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
          <Tab>advanced</Tab>
          <OptionalTabs>
            <Tab>technical</Tab>
            <Tab>seo</Tab>
          </OptionalTabs>
        </MultiTabTextarea>
      </div>
    );
  },
};

export const WithErrorStates: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      review_en: "This product is",
      review_es: "Este producto es",
      review_fr: "Ce produit est",
    });

    const [errors, setErrors] = useState<Map<string, string>>(
      new Map([
        ["review_en", "Review must be at least 20 characters"],
        ["review_es", "La reseña debe tener al menos 20 caracteres"],
        ["review_fr", "L'avis doit comporter au moins 20 caractères"],
      ])
    );

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="review"
          label="Product Review"
          placeholder="Write your review here..."
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
        </MultiTabTextarea>
      </div>
    );
  },
};

export const DisabledState: Story = {
  render: () => {
    const [tabData] = useState<Record<string, string>>({
      template_en:
        "This is a read-only template.\nYou cannot edit this content.",
      template_es:
        "Esta es una plantilla de solo lectura.\nNo puedes editar este contenido.",
    });

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="template"
          label="Email Template"
          placeholder="Cannot edit - this is read-only"
          tabData={tabData}
          disabled
          onChanged={() => {}}
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>
        </MultiTabTextarea>
      </div>
    );
  },
};

export const CustomPlaceholders: Story = {
  render: () => {
    const [tabData, setTabData] = useState<Record<string, string>>({
      instructions_en: "",
      instructions_ar: "",
      instructions_fa: "",
    });

    return (
      <div className="w-[500px]">
        <MultiTabTextarea
          name="instructions"
          label="Instructions"
          placeholder="Default placeholder..."
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>arabic</Tab>
          <OptionalTabs>
            <Tab>farsi</Tab>
          </OptionalTabs>
        </MultiTabTextarea>
      </div>
    );
  },
};

export const InFormContext: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
    });

    const [tabData, setTabData] = useState<Record<string, string>>({
      description_en: "",
      description_es: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log({
        ...formData,
        ...tabData,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="w-[500px] space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter product name"
          />
        </div>

        <MultiTabTextarea
          name="description"
          label="Product Description"
          placeholder="Describe your product..."
          tabData={tabData}
          onChanged={(value, name) =>
            setTabData((prev) => ({ ...prev, [name]: value }))
          }
        >
          <Tab>english</Tab>
          <Tab>spanish</Tab>
        </MultiTabTextarea>

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
