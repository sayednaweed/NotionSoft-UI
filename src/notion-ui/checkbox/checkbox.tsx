import CircleLoader from "@/components/notion-ui/circle-loader";
import { cn } from "@/utils/cn";
import { CheckIcon } from "lucide-react";
import React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange: (value: boolean) => void;
  checked: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
  classNames?: {
    rootDivClassName?: string;
  };
}
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (props, ref: any) => {
    const {
      onCheckedChange,
      checked,
      loading,
      label,
      description,
      className,
      readOnly,
      classNames,
    } = props;
    const { rootDivClassName } = classNames || {};

    const readOnlyStyle = readOnly && "opacity-40";

    return (
      <div
        className={cn(
          "flex items-center space-x-3",
          rootDivClassName,
          readOnlyStyle
        )}
      >
        {loading ? (
          <CircleLoader className="size-4" />
        ) : (
          <label className="inline-flex items-center">
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              onChange={(e) => onCheckedChange(e.target.checked)}
              className={cn("peer sr-only", className)}
            />

            <CheckIcon className="size-4 shadow-sm p-px border border-tertiary/60 text-transparent peer-checked:bg-primary peer-checked:text-primary-foreground transition-transform rounded peer-checked:scale-100" />
          </label>
        )}

        <label className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label && (
            <h1 className="text-start rtl:text-[18px] ltr:text-[13px] font-semibold">
              {label}
            </h1>
          )}
          {description && (
            <h1 className="text-start rtl:pr-1 rtl:text-[17px] ltr:text-xs pt-0.5 ltr:leading-3.5 rtl:leading-5 text-primary/80">
              {description}
            </h1>
          )}
        </label>
      </div>
    );
  }
);

export default Checkbox;
