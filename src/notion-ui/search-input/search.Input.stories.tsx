import { FilterItem, SearchInput } from "@/components/notion-ui/search-input";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SearchInput> = {
  title: "Form/SearchInput",
  component: SearchInput,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof SearchInput>;

// --- Shared Filters & Mock Fetch ---
const fruitFilters: FilterItem[] = [
  { key: "red", name: "Red Fruits" },
  { key: "yellow", name: "Yellow Fruits" },
  { key: "citrus", name: "Citrus Fruits" },
];

const mockFetch = async (
  value: string,
  filters?: Record<string, boolean>,
  maxFetch?: number,
) => {
  const data = [
    { id: "1", name: "Apple" },
    { id: "2", name: "Banana" },
    { id: "3", name: "Orange" },
    { id: "4", name: "Grapes" },
    { id: "5", name: "Lemon" },
    { id: "6", name: "Strawberry" },
  ];
  await new Promise((res) => setTimeout(res, 500));
  return data.filter((item) =>
    item.name.toLowerCase().includes(value.toLowerCase()),
  );
};

// --- Story 1: Basic Search (No filters) ---
export const BasicTextSearch: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Search fruits..."
      STORAGE_KEY="basic-text-search"
    />
  ),
};

// --- Story 2: Search With Checkbox Filters ---
export const SearchWithFilters: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Search fruits..."
      filters={[
        { key: "Max Fetch", name: "Max Fetch" },
        { key: "yellow", name: "Yellow Fruits" },
        { key: "citrus", name: "Citrus Fruits" },
      ]}
      STORAGE_KEY="search-with-filters"
      onFiltersChange={(state) => console.log("Filters changed:", state)}
    />
  ),
};

// --- Story 3: Custom Item Rendering ---
export const SearchWithCustomItem: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Search fruits..."
      STORAGE_KEY="custom-item-search"
      renderItem={(item) => (
        <div className="flex items-center justify-between px-3 py-1 hover:bg-gray-100">
          <span>{item.name}</span>
          <span role="img" aria-label="fruit">
            🍎
          </span>
        </div>
      )}
    />
  ),
};

// --- Story 4: Debounced Search ---
export const DebouncedSearch: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Type slowly..."
      debounceValue={1000}
      STORAGE_KEY="debounced-search"
    />
  ),
};

// --- Story 5: Filters Only Panel ---
export const FiltersOnly: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Focus to see filters..."
      filters={fruitFilters}
      STORAGE_KEY="filters-only"
    />
  ),
};

// --- Story 6: Full Featured Example ---
export const FullFeatured: Story = {
  render: () => (
    <SearchInput
      fetch={mockFetch}
      placeholder="Search fruits..."
      filters={fruitFilters}
      STORAGE_KEY="full-featured-search"
      onFiltersChange={(state) => console.log("Filters:", state)}
      debounceValue={700}
      renderItem={(item) => (
        <div className="flex justify-between px-3 py-1 hover:bg-gray-100">
          <strong>{item.name}</strong>
          <span role="img" aria-label="banana">
            🍌
          </span>
        </div>
      )}
      text={{ fetch: "Loading fruits...", notItem: "No fruits found" }}
    />
  ),
};
