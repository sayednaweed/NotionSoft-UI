import { cn } from "@/utils/cn";
import React from "react";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  stop?: boolean;
}

function Shimmer({ stop = false, className, children }: ShimmerProps) {
  return (
    <div className={cn("shimmer-surface w-full *:rounded-sm", className)}>
      <div className={cn("shimmer-overlay", stop && "shimmer-overlay-stop")} />
      {children}
    </div>
  );
}

interface ShimmerItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function ShimmerItem(props: ShimmerItemProps) {
  const { className, ...rest } = props;

  return <div className={cn("shimmer-item h-10", className)} {...rest} />;
}

export { Shimmer, type ShimmerProps, ShimmerItem, type ShimmerItemProps };
