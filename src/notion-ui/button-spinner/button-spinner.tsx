import { Button, ButtonProps } from "@/components/notion-ui/button/button";
import { cn } from "@/utils/cn";
import { LoaderCircle } from "lucide-react";
import { ReactNode } from "react";

interface IButtonSpinnerProps {
  text: string;
  loading: boolean;
  buttonProps?: ButtonProps;
  icon?: ReactNode;
  className?: string;
}

function ButtonSpinner(props: IButtonSpinnerProps) {
  const { loading, text, buttonProps, icon } = props;
  const { className, ...rest } = buttonProps || {};

  return (
    <Button className={cn("gap-x-2", className)} {...rest}>
      {text}
      {loading &&
        (icon ? (
          icon
        ) : (
          <LoaderCircle
            className="
              size-3 animate-spin rounded-full
              text-slate-900 dark:text-white border-t-transparent
            "
          />
        ))}
    </Button>
  );
}

export { ButtonSpinner, type IButtonSpinnerProps };
