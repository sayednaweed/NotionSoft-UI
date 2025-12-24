import type { Meta, StoryObj } from "@storybook/react";
import CachedImage, { ImageProps } from "./cached-image";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

// Basic fetch wrapper
const fetchImage = async (src: string): Promise<Response> => {
  return fetch(src);
};

// Delayed fetch to show shimmer/loading
const delayedFetch = async (src: string): Promise<Response> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return fetch(src);
};

/* ---------------------------------- */
/* Meta */
/* ---------------------------------- */

const meta: Meta<ImageProps> = {
  title: "Media/CachedImage",
  component: CachedImage,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
    },
    classNames: {
      control: "object",
    },
    fetch: {
      table: { disable: true },
    },
    apiConfig: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<ImageProps>;

/* ---------------------------------- */
/* Stories */
/* ---------------------------------- */

// Default (fetch + cache)
export const Default: Story = {
  args: {
    src: "/images/sample.jpg",
    fetch: fetchImage,
    className: "w-40 h-40 rounded-md",
  },
};

// API config variant
export const WithApiConfig: Story = {
  args: {
    apiConfig: {
      src: "/images/sample.jpg",
    },
    className: "w-40 h-40 rounded-lg",
  },
};

// Cross-origin image (bypasses cache)
export const CrossOrigin: Story = {
  args: {
    src: "https://picsum.photos/200",
    fetch: fetchImage,
    className: "w-40 h-40 rounded-full",
  },
};

// Loading / shimmer state
export const LoadingState: Story = {
  args: {
    src: "/images/sample.jpg",
    fetch: delayedFetch,
    className: "w-32 h-32",
    classNames: {
      shimmerClassName: "bg-gray-200",
      shimmerIconClassName: "stroke-gray-400",
    },
  },
};

// Small size
export const Small: Story = {
  args: {
    src: "/images/sample.jpg",
    fetch: fetchImage,
    className: "w-16 h-16 rounded",
  },
};

// Large size
export const Large: Story = {
  args: {
    src: "/images/sample.jpg",
    fetch: fetchImage,
    className: "w-64 h-64 rounded-xl",
  },
};
