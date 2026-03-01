import { CachedSvg } from "@/components/notion-ui/cached-svg";
import type { Meta, StoryObj } from "@storybook/react";

/* ---------------------------------- */
/* Meta */
/* ---------------------------------- */
const meta: Meta<typeof CachedSvg> = {
  title: "Media/CachedSvg",
  component: CachedSvg,
  tags: ["autodocs"],
  argTypes: {
    className: { control: "text" },
    classNames: { control: false },
    src: { control: "text" },
    fetch: { control: false },
    apiConfig: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof CachedSvg>;

/* ---------------------------------- */
/* Sample SVG string */
/* ---------------------------------- */
const sampleSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="currentColor"/>
</svg>`;

/* ---------------------------------- */
/* Stories */
/* ---------------------------------- */

/* -------- Fetch-based example -------- */
export const FetchExample: Story = {
  render: () => (
    <div>
      <CachedSvg
        apiConfig={{
          src: "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/af.svg",
        }}
      />
    </div>
  ),
};

/* -------- API-config-based example -------- */
export const ApiConfigExample: Story = {
  render: () => (
    <div>
      <CachedSvg
        apiConfig={{
          src: "https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/af.svg",
        }}
        className="size-32"
      />
    </div>
  ),
};

/* -------- Loading state (Shimmer) -------- */
export const LoadingState: Story = {
  render: () => (
    <div>
      <CachedSvg
        src="https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/af.svg"
        fetch={() => new Promise(() => {})} // never resolves to simulate loading
      />
    </div>
  ),
};
