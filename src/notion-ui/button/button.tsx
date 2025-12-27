import * as React from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "warning"
    | "success"
    | "outline"
    | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref: any) => {
    const { className, children, variant, disabled, ...rest } = props;
    const style =
      variant == "secondary"
        ? "bg-tertiary hover:shadow-sm shadow-lg hover:bg-tertiary rounded text-[12px] w-fit text-white"
        : variant == "warning"
        ? "bg-red-500 text-primary-foreground"
        : variant == "icon"
        ? "rtl:px-3 rtl:py-1 ltr:py-2 border gap-x-3 text-primary border border-primary/10 hover:bg-primary/5 hover:opacity-90 transition-opacity px-5"
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
          `rounded-sm items-center justify-center flex gap-x-1 leading-snug cursor-pointer ltr:text-xs rtl:text-[13px] sm:rtl:text-sm  rtl:font-semibold
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
