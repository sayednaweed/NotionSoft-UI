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
    const {
      className,
      children,
      variant = "primary",
      disabled,
      ...rest
    } = props;

    const style =
      variant === "secondary"
        ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        : variant === "warning"
          ? "bg-red-500 text-white hover:bg-red-600"
          : variant === "success"
            ? "bg-green-500 text-white hover:bg-green-600"
            : variant === "outline"
              ? "border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
              : variant === "icon"
                ? "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800 rtl:px-3 rtl:py-1 ltr:py-2 gap-x-2"
                : "bg-brand-500 text-white hover:bg-brand-600 shadow-soft";

    return (
      <button
        {...rest}
        disabled={disabled}
        ref={ref}
        className={cn(
          "flex w-fit cursor-pointer items-center justify-center gap-x-1 rounded-lg px-3 py-1.5 text-xs leading-snug transition duration-200 ease-linear rtl:text-[13px] sm:rtl:text-sm rtl:font-semibold",
          style,
          disabled && "pointer-events-none cursor-not-allowed opacity-40",
          className,
        )}
      >
        {children}
      </button>
    );
  },
);

export { Button, ButtonProps };
