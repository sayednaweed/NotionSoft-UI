import { cn } from "@/utils/cn";

interface StatusButtonProps {
  getColor: () => {
    style: string;
    value?: string;
  };
  className?: string;
}

function StatusButton(props: StatusButtonProps) {
  const { getColor, className } = props;
  const data = getColor();

  return (
    <div
      className={cn(
        `border mx-auto min-w-fit ltr:text-[13px] sm:ltr:text-sm rtl:text-[13px] sm:rtl:text-sm rtl:font-semibold w-fit flex items-center gap-x-2 ltr:py-1 rtl:py-0.5 px-2 rounded-full ${data.style}`,
        className,
      )}
    >
      <div
        className={`size-3 min-h-3 min-w-3 rounded-full border-[3px] ${data.style}`}
      />
      <h1 className="text-nowrap">{data.value}</h1>
    </div>
  );
}
export { StatusButton, StatusButtonProps };
