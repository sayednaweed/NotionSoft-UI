import { AnimatedItem } from "@/components/notion-ui/animated-item";
import { cn } from "@/utils/cn";
import React from "react";

type NastranInputSize = "sm" | "md" | "lg";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  requiredHint?: string;
  label?: string;
  errorMessage?: string;
  classNames?: {
    root?: string;
    input?: string;
    label?: string;
    requiredHint?: string;
    errorMessage?: string;
  };
  measurement?: NastranInputSize;
}

const sizeStyles = {
  sm: {
    py: "py-2",
  },
  md: {
    py: "py-3",
  },
  lg: {
    py: "py-4",
  },
} as const;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      startContent,
      endContent,
      requiredHint,
      classNames,
      measurement = "sm",
      errorMessage,
      label,
      readOnly,
      disabled,
      id,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(errorMessage);
    const styles = sizeStyles[measurement];

    return (
      <div className={cn("grid grid-cols-[1fr_auto] ", classNames?.root)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "inline-block pb-1 font-semibold ltr:text-sm",
              classNames?.label,
            )}
          >
            {label}
          </label>
        )}
        {requiredHint && (
          <span
            className={cn(
              "font-semibold text-red-600 text-[11px]",
              classNames?.requiredHint,
            )}
          >
            {requiredHint}
          </span>
        )}

        <div
          className={cn(
            `flex gap-3 col-span-2 transition-colors duration-200 focus-within:text-blue-500 items-center rounded-xl border border-slate-200 bg-white/75 px-4 text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400`,
            hasError && "border-red-200",
            readOnly && "opacity-60",
            styles.py,
          )}
        >
          {startContent && <span className="shrink-0">{startContent}</span>}
          <input
            ref={ref}
            id={inputId}
            data-slot="input"
            readOnly={readOnly}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              "w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500",
              "outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              classNames?.input,
            )}
            {...rest}
          />
          {endContent && <span className="shrink-0">{endContent}</span>}
        </div>

        {hasError && (
          <AnimatedItem
            springProps={{
              from: { opacity: 0, transform: "translateY(-8px)" },
              config: { mass: 1, tension: 210, friction: 20 },
              to: { opacity: 1, transform: "translateY(0px)" },
            }}
            intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
          >
            <p
              id={errorId}
              className={cn(
                "text-start capitalize text-red-400 rtl:text-sm rtl:font-medium ltr:text-[11px]",
                classNames?.errorMessage,
              )}
            >
              {errorMessage}
            </p>
          </AnimatedItem>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, type NastranInputSize, type InputProps };
