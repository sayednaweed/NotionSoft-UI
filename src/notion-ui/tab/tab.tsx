import { cn } from "../../utils/cn";
import { Asterisk, CircleDot } from "lucide-react";

export type TabState = "active" | "selected" | "unselected";

interface TabProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  translation?: string;

  state?: TabState; // <-- now strongly typed
  optional?: boolean;
}
export function Tab({
  children,
  className,
  onClick,
  translation,
  state = "unselected",
  optional = false,
}: TabProps) {
  // Icon for this tab
  const Icon = optional ? CircleDot : Asterisk;

  const baseClass = cn(
    "capitalize transition px-3 py-1.5 ltr:text-xs rtl:text-[13px] sm:rtl:text-sm rtl:font-semibold px-2 rounded cursor-pointer shadow-md dark:shadow-none dark:border dark:hover:opacity-80 shadow-primary/20 hover:shadow-sm flex items-center gap-1",

    state === "active"
      ? "text-primary-foreground bg-tertiary"
      : state === "selected"
      ? "bg-primary/50 text-primary-foreground/90"
      : "bg-primary/10 text-primary/50",

    className
  );

  return (
    <div onClick={onClick} className={baseClass}>
      <Icon size={14} className="opacity-70 size-3 text-current" />
      {translation ?? children}
    </div>
  );
}

Tab.displayName = "Tab";

export function OptionalTabs({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
OptionalTabs.displayName = "OptionalTabs";
