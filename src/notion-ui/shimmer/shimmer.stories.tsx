import { Meta, StoryObj } from "@storybook/react";
import { Shimmer, ShimmerItem, ShimmerProps } from "./shimmer";

const meta: Meta<typeof Shimmer> = {
  title: "Shimmer/Shimmer",
  component: Shimmer,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Shimmer>;

export const Default: Story = {
  render: (args: ShimmerProps) => (
    <Shimmer {...args} className=" space-y-3">
      <ShimmerItem className="w-full" />
      <ShimmerItem className="w-3/4" />
      <ShimmerItem className="w-1/2" />
    </Shimmer>
  ),
};
