import { AnimatedItem } from "@/components/notion-ui/animated-item";
import { cn } from "@/utils/cn";
import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  requiredHint?: string;
  label?: string;
  errorMessage?: string;
  classNames?: {
    rootDivClassName?: string;
  };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      requiredHint,
      classNames,
      errorMessage,
      label,
      readOnly,
      ...rest
    },
    ref,
  ) => {
    const hasError = !!errorMessage;
    const { rootDivClassName } = classNames || {};
    const heightStyle = {
      required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
    };
    const readOnlyStyle = readOnly && "opacity-40";

    return (
      <div
        className={cn(
          rootDivClassName,
          "flex w-full flex-col justify-end",
          readOnlyStyle,
        )}
      >
        <div
          className={cn(
            "relative text-start select-none h-fit rtl:text-[17px] ltr:text-[13px]",
          )}
        >
          {/* Required Hint */}
          {requiredHint && (
            <span
              className={cn(
                "absolute font-semibold text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-2.5 rtl:left-2.5",
                heightStyle.required,
              )}
            >
              {requiredHint}
            </span>
          )}

          {/* Label */}
          {label && (
            <label
              htmlFor={label}
              className={cn(
                "font-semibold rtl:text-md ltr:text-[13px] inline-block pb-1",
              )}
            >
              {label}
            </label>
          )}

          {/* Textarea Field */}

          <textarea
            ref={ref}
            data-slot="textarea"
            readOnly={readOnly}
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-70 md:text-sm focus-visible:border-tertiary/60 focus-visible:shadow-sm",
              "placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold",
              hasError && "border-red-400",
              className,
            )}
            {...rest}
            disabled={readOnly}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                transform: "translateY(-8px)",
              },
              config: {
                mass: 1,
                tension: 210,
                friction: 20,
              },
              to: {
                opacity: 1,
                transform: "translateY(0px)",
              },
            }}
            intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
          >
            <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-[11px]">
              {errorMessage}
            </h1>
          </AnimatedItem>
        )}
      </div>
    );
  },
);

export { Textarea, type TextareaProps };
