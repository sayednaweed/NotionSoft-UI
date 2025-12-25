// Card.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a short description for the card.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm">
          This is the main content area of the card. You can place any elements
          here.
        </p>
      </CardContent>

      <CardFooter>
        <span className="text-sm text-muted-foreground">
          Footer content goes here
        </span>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Card with Action</CardTitle>
        <CardDescription>
          This card demonstrates the CardAction slot.
        </CardDescription>
        <CardAction>
          <button className="text-sm font-medium text-primary">Action</button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="text-sm">
          Card content with an action button aligned to the header.
        </p>
      </CardContent>
    </Card>
  ),
};
