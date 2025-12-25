import CircleLoader from "@/components/notion-ui/circle-loader";
import { cn } from "@/utils/cn";
import { Edit, Eye, Trash2 } from "lucide-react";
import * as React from "react";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b rtl:text-lg ltr:text-sm", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0 rtl:text-md ltr:text-xs",
        className
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "font-medium text-muted-foreground h-10 px-2 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

interface TableRowIconProps extends React.HTMLAttributes<HTMLTableRowElement> {
  read?: boolean;
  remove?: boolean;
  edit?: boolean;
  onRemove: (item: any) => Promise<void>;
  onEdit: (item: any) => Promise<void>;
  onRead: (item: any) => Promise<void>;
  item: any;
}
const TableRowIcon = React.forwardRef<HTMLTableRowElement, TableRowIconProps>(
  (
    { className, read, edit, remove, onRemove, onEdit, onRead, item, ...props },
    ref
  ) => {
    const { children } = props;
    const [showAction, setShowAction] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    return (
      <TableRow
        className={cn(`${showAction && "bg-primary/10!"} relative`, className)}
        {...props}
        ref={ref}
        onMouseEnter={() => {
          if (read || edit || remove) setShowAction(true);
        }}
        onMouseLeave={() => setShowAction(false)}
      >
        {children}
        <td>
          {showAction && (
            <div className="w-[110px] bg-primary py-1 rounded-full flex absolute top-1/2 transform -translate-y-1/2 ltr:right-2 rtl:left-2 justify-center gap-x-2">
              {read && !edit && (
                <div
                  onClick={async () => {
                    if (loading) return;
                    setLoading(true);
                    await onRead(item);
                    setLoading(false);
                  }}
                  className="cursor-pointer hover:*:text-primary-foreground/70"
                >
                  <Eye className="text-primary-foreground size-[18px] transition" />
                </div>
              )}
              {edit && (
                <div
                  onClick={async () => {
                    if (loading) return;
                    setLoading(true);
                    await onEdit(item);
                    setLoading(false);
                  }}
                  className="cursor-pointer hover:*:text-green-500/70"
                >
                  <Edit className="text-green-500 size-[18px] transition" />
                </div>
              )}

              {remove && (
                <div
                  onClick={async () => {
                    if (loading) return;
                    setLoading(true);
                    await onRemove(item);
                    setLoading(false);
                  }}
                  className="cursor-pointer hover:*:text-red-400/70"
                >
                  <Trash2 className="text-red-400 size-[18px] transition" />
                </div>
              )}
            </div>
          )}
        </td>
        {loading && (
          <td className="w-full h-full bg-primary/20 absolute flex justify-center left-0">
            <CircleLoader className="size-[18px]" />
          </td>
        )}
      </TableRow>
    );
  }
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableRowIcon,
};
