import * as React from "react";
import { cn } from "../../utils/cn";
// import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "warning" | "success" | "outline";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref: any) => {
    const { className, children, variant, disabled, ...rest } = props;
    const style =
      variant == "secondary"
        ? "border hover:bg-primary hover:text-primary-foreground"
        : variant == "warning"
        ? "bg-red-500 text-primary-foreground"
        : variant == "success"
        ? "bg-green-500 text-primary-foreground"
        : variant == "outline"
        ? "text-primary border border-primary/10 hover:bg-primary/5"
        : "bg-primary hover:shadow hover:bg-primary shadow shadow-primary/50 text-primary-foreground/80 hover:opacity-90 hover:text-primary-foreground";
    return (
      <button
        {...rest}
        disabled={disabled}
        ref={ref}
        className={cn(
          `rounded-sm flex items-center gap-x-1 cursor-pointer font-medium ltr:text-xs leading-snug li rtl:text-[13px] sm:rtl:text-sm  rtl:font-semibold
          transition w-fit px-3 py-1.5 duration-200 ease-linear`,
          style,
          disabled &&
            "opacity-35 pointer-events-none disabled:cursor-not-allowed",
          className
        )}
      >
        {children}
      </button>
    );
  }
);
export default Button;
