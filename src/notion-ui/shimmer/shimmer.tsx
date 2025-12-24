import { cn } from "../../utils/cn";

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  stop?: boolean;
}

export default function Shimmer({
  stop = false,
  className,
  children,
}: ShimmerProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden *:rounded-sm", className)}
    >
      {/* Scoped CSS */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1200px 0;
          }
          100% {
            background-position: 1200px 0;
          }
        }
      `}</style>

      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(
            to right,
            var(--from-shimmer) 10%,
            var(--to-shimmer) 18%,
            var(--from-shimmer) 25%
          )`,
          backgroundSize: "1200px 100%",
          animation: !stop ? "shimmer 2.2s linear infinite" : "",
        }}
      />

      {children}
    </div>
  );
}
export interface ShimmerItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function ShimmerItem(props: ShimmerItemProps) {
  const { className } = props;
  return <div className={cn(`h-10 bg-primary/5`, className)} />;
}
