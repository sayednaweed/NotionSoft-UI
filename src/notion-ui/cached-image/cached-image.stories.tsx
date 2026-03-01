import { CachedImage, ImageProps } from "@/components/notion-ui/cached-image";
import type { Meta, StoryObj } from "@storybook/react";

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
    src: "https://picsum.photos/200",
    fetch: fetchImage,
    className: "w-40 h-40 rounded-md",
  },
};

// API config variant
export const WithApiConfig: Story = {
  args: {
    apiConfig: {
      src: "https://picsum.photos/200",
    },
    className: "w-40 h-40 rounded-lg",
  },
};

// Cross-origin image (bypasses cache)
export const CrossOrigin: Story = {
  args: {
    src: "https://picsum.photos/200",
    fetch: fetchImage,
    className: "w-40 h-40 rounded-full border/10",
  },
};

// Loading / shimmer state
export const LoadingState: Story = {
  args: {
    src: "https://picsum.photos/200",
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
    src: "https://picsum.photos/200",
    fetch: fetchImage,
    className: "w-16 h-16 rounded",
  },
};

// Large size
export const Large: Story = {
  args: {
    src: "https://picsum.photos/200",
    fetch: fetchImage,
    className: "w-64 h-64 rounded-xl",
  },
};
