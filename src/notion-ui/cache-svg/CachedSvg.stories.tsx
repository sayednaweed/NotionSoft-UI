import type { Meta, StoryObj } from "@storybook/react";

import CachedSvg from "./cached-svg";

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
    <div style={{ width: 40, height: 40 }}>
      <CachedSvg
        src="https://dummy-svg-url.com/sample.svg"
        fetch={async () => {
          return new Response(sampleSvg, { status: 200 });
        }}
      />
    </div>
  ),
};

/* -------- API-config-based example -------- */
export const ApiConfigExample: Story = {
  render: () => (
    <div style={{ width: 40, height: 40 }}>
      <CachedSvg
        apiConfig={{
          src: "https://dummy-api.com/svg",
          headers: { Authorization: "Bearer token" },
        }}
      />
    </div>
  ),
};

/* -------- Loading state (Shimmer) -------- */
export const LoadingState: Story = {
  render: () => (
    <div style={{ width: 40, height: 40 }}>
      <CachedSvg
        src="https://dummy-loading.com/svg"
        fetch={() => new Promise(() => {})} // never resolves to simulate loading
      />
    </div>
  ),
};
