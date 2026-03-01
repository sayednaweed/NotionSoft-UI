import { AnimatedItem } from "@/components/notion-ui/animated-item";
import { cn } from "@/utils/cn";
import React, { useMemo } from "react";

type NastranInputSize = "sm" | "md" | "lg";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  requiredHint?: string;
  label?: string;
  errorMessage?: string;
  classNames?: {
    rootDivClassName?: string;
  };
  measurement?: NastranInputSize;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      requiredHint,
      startContent,
      endContent,
      classNames,
      measurement = "sm",
      errorMessage,
      label,
      readOnly,
      ...rest
    },
    ref,
  ) => {
    const hasError = !!errorMessage;
    const { rootDivClassName } = classNames || {};

    const inputPaddingClass = startContent
      ? "rtl:pr-[42px] ltr:ps-[42px]"
      : "rtl:pr-[12px] ltr:ps-[12px]";

    const heightStyle = useMemo(
      () =>
        measurement == "lg"
          ? {
              height: "50px",
              paddingY: "ltr:pb-0.5 rtl:pb-1",
              endContent: label
                ? "ltr:top-[48px] rtl:top-[54px]-translate-y-1/2"
                : "top-[26px] -translate-y-1/2",
              startContent: label
                ? "ltr:top-[48px] rtl:top-[54px] -translate-y-1/2"
                : "top-[26px] -translate-y-1/2",
              required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
            }
          : measurement == "md"
            ? {
                height: "44px",
                paddingY: "ltr:pb-0.5 rtl:pb-1",
                endContent: label
                  ? "ltr:top-[45px] rtl:top-[51px] -translate-y-1/2"
                  : "top-[22px] -translate-y-1/2",
                startContent: label
                  ? "ltr:top-[45px] rtl:top-[51px] -translate-y-1/2"
                  : "top-[22px] -translate-y-1/2",
                required: label
                  ? "ltr:top-[4px] rtl:top-[12px]"
                  : "top-[-19px]",
              }
            : {
                height: "40px",
                paddingY: "ltr:pb-0.5 rtl:pb-1",
                endContent: label
                  ? "ltr:top-[44px] rtl:top-[50px] -translate-y-1/2"
                  : "top-[20px] -translate-y-1/2",
                startContent: label
                  ? "ltr:top-[44px] rtl:top-[50px] -translate-y-1/2"
                  : "top-[20px] -translate-y-1/2",
                required: label
                  ? "ltr:top-[4px] rtl:top-[12px]"
                  : "top-[-19px]",
              },
      [measurement, label],
    );
    const readOnlyStyle = readOnly && "opacity-40";

    return (
      <div
        className={cn(
          rootDivClassName,
          "flex w-full flex-col justify-end",
          requiredHint && !label && "mt-5",
          readOnlyStyle,
        )}
      >
        <div
          className={cn(
            "relative text-start select-none h-fit ltr:text-[13px] rtl:text-[18px]",
          )}
        >
          {/* Start Content */}
          {startContent && (
            <span
              className={cn(
                "absolute flex items-center ltr:left-3 rtl:right-3",
                heightStyle.startContent,
              )}
            >
              {startContent}
            </span>
          )}

          {/* End Content */}
          {endContent && (
            <span
              className={cn(
                "absolute flex items-center ltr:right-[5px] rtl:left-[5px]",
                heightStyle.endContent,
              )}
            >
              {endContent}
            </span>
          )}

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
                "font-semibold ltr:text-[13px] rtl:text-[18px] inline-block pb-1",
              )}
            >
              {label}
            </label>
          )}

          {/* Input Field */}

          <input
            ref={ref}
            type={type}
            data-slot="input"
            readOnly={readOnly}
            style={{
              height: heightStyle.height,
            }}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-sm border px-3 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm focus-visible:ring-0 focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card",
              "focus-visible:border-tertiary/60",
              "[&::-webkit-outer-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:appearance-none",
              "[-moz-appearance:textfield] leading-loose",
              inputPaddingClass,
              heightStyle.paddingY,
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

export { Input, type NastranInputSize, type InputProps };
