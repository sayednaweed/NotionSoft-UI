import { cn } from "@/utils/cn";
import { ChevronRight, LucideProps } from "lucide-react";
import React from "react";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  (props, ref) => {
    const { className, children, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "flex w-full items-center gap-x-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/85 px-5 py-3 dark:border-white/10 dark:bg-slate-900/60",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
interface BreadcrumbSeparatorProps extends LucideProps {}

const BreadcrumbSeparator = React.forwardRef<
  SVGSVGElement,
  BreadcrumbSeparatorProps
>((props, ref) => {
  const { className, ...rest } = props;

  return (
    <ChevronRight
      ref={ref}
      {...rest}
      aria-hidden="true"
      className={cn(
        "h-4 w-4 text-slate-300 dark:text-slate-700 rtl:rotate-180",
        className,
      )}
    />
  );
});

BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLDivElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { className, children, active = false, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "cursor-pointer text-nowrap font-medium capitalize transition-colors duration-200 hover:text-brand-500 dark:hover:text-brand-300 rtl:pt-0.5 rtl:text-4 ltr:text-xs",
          active ? "text-brand-500" : "text-slate-500 dark:text-slate-400",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbHomeProps extends React.SVGProps<SVGSVGElement> {}

const BreadcrumbHome = React.forwardRef<SVGSVGElement, BreadcrumbHomeProps>(
  (props, ref) => {
    const { className, ...rest } = props;

    return (
      <svg
        ref={ref}
        {...rest}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className={cn(
          "size-4 min-h-4 min-w-4 cursor-pointer fill-slate-400 text-slate-400 transition-all duration-300 hover:scale-105 hover:fill-brand-500 hover:text-brand-500 dark:fill-slate-500 dark:text-slate-500 dark:hover:fill-brand-300 dark:hover:text-brand-300",
          className,
        )}
      >
        <path
          fillRule="evenodd"
          d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
          clipRule="evenodd"
        ></path>
      </svg>
    );
  },
);

BreadcrumbHome.displayName = "BreadcrumbHome";

export { Breadcrumb, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbHome };
