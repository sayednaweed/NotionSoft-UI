import { X } from "lucide-react";
import { DateObject } from "react-multi-date-picker";

import { cn } from "@/utils/cn";
import { MultiDatePicker } from "@/components/notion-ui/multi-date-picker";
import { type MultiDatePickerProps } from "@/components/notion-ui/multi-date-picker";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/notion-ui/card";
import { Button } from "@/components/notion-ui/button";
interface FilterDialogProps {
  sortOnComplete: (itemName: any) => void;
  searchFilterChanged: (itemName: any) => void;
  orderOnComplete: (itemName: any) => void;
  dateOnComplete: (selectedDates: DateObject[]) => void;
  filters: any;
  filtersShowData: {
    sort?: IShowData[];
    order?: IShowData[];
    search?: IShowData[];
  };
  showColumns: {
    sort: boolean;
    order: boolean;
    search: boolean;
    date: boolean;
  };
  translations: {
    sortPlaceholder?: string;
    orderPlaceholder?: string;
    searchPlaceholder?: string;
    datePlaceholder?: string;
    searchFilterPlaceholder?: string;
    cancelPlaceholder?: string;
  };
  date?: Omit<MultiDatePickerProps, "value" | "dateOnComplete">;
  onCancel: () => void;
}
function FilterDialog(props: FilterDialogProps) {
  const {
    sortOnComplete,
    searchFilterChanged,
    orderOnComplete,
    dateOnComplete,
    filters,
    filtersShowData,
    showColumns,
    date,
    translations,
    onCancel,
  } = props;
  const {
    sortPlaceholder,
    orderPlaceholder,
    searchPlaceholder,
    datePlaceholder,
    searchFilterPlaceholder,
    cancelPlaceholder,
  } = translations;

  const handleSort = (itemName: string) => {
    sortOnComplete(itemName);
  };
  const handleSearch = (itemName: string) => {
    searchFilterChanged(itemName);
  };
  const handleOrder = (itemName: string) => {
    orderOnComplete(itemName);
  };
  const handleDate = (selectedDates: DateObject[]) => {
    dateOnComplete(selectedDates);
  };

  const sorts = showColumns.sort
    ? filtersShowData.sort?.map((option: IShowData) => ({
        ...option,
        onClick: handleSort, // Adding new 'label' field
      }))
    : [];
  const orders = showColumns.order
    ? filtersShowData.order?.map((option: IShowData) => ({
        ...option,
        onClick: handleOrder, // Adding new 'label' field
      }))
    : [];
  const searchs = showColumns.search
    ? filtersShowData.search?.map((option: IShowData) => ({
        ...option,
        onClick: handleSearch, // Adding new 'label' field
      }))
    : [];

  return (
    <Card className="sm:self-center [backdrop-filter:blur(20px)] bg-card/80">
      <CardHeader className="relative text-start">
        <CardTitle>
          {searchFilterPlaceholder ? searchFilterPlaceholder : "Search filters"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 sm:flex sm:flex-row gap-x-4 gap-y-6 pb-12">
        {showColumns.sort && (
          <FilterItem
            selected={filters.sort}
            headerName={sortPlaceholder ? sortPlaceholder : "Sort by"}
            items={sorts ? sorts : []}
          />
        )}

        {showColumns.date && (
          <section className="min-w-[120px] space-y-2">
            <h1
              className={
                "uppercase text-start font-semibold border-b border-primary/20 pb-2 rtl:text-md ltr:text-xs text-primary"
              }
            >
              {datePlaceholder ? datePlaceholder : "Date"}
            </h1>
            <MultiDatePicker
              value={filters.date}
              dateOnComplete={handleDate}
              {...date}
            />
          </section>
        )}
        {showColumns.order && (
          <FilterItem
            selected={filters.order}
            headerName={orderPlaceholder ? orderPlaceholder : "Order"}
            items={orders ? orders : []}
          />
        )}
        {showColumns.search && (
          <FilterItem
            selected={filters.search.column}
            headerName={searchPlaceholder ? searchPlaceholder : "Search"}
            items={searchs ? searchs : []}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {cancelPlaceholder ? cancelPlaceholder : "Cancel"}
        </Button>
      </CardFooter>
    </Card>
  );
}
interface IShowData {
  name: string;
  translate: string;
  onClick?: (itemName: string) => void;
}

interface FilterItemProps extends React.HTMLAttributes<HTMLDivElement> {
  headerName: string;
  items: IShowData[];
  selected: string;
}
const FilterItem = (props: FilterItemProps) => {
  const { items, headerName, selected, className, ...res } = props;

  const headerStyle =
    "uppercase text-start font-semibold border-b border-primary/20 pb-2 rtl:text-[17px] ltr:text-xs text-primary";
  const itemStyle =
    "rtl:text-md ltr:text-xs cursor-pointer px-2 py-1 capitalize rounded-full hover:bg-primary/5 transition flex items-center text-start";
  const mapItems = items.map((item: IShowData, index: number) => {
    const active = item.name == selected;
    return (
      <h1
        key={index}
        onClick={() => item.onClick && item.onClick(item.name)}
        className={`${itemStyle} ${
          active ? "font-semibold text-primary/80" : "text-primary/50"
        }`}
      >
        {active && (
          <X className="inline-block size-[18px] stroke-[1.2px] transition" />
        )}
        {item.translate}
      </h1>
    );
  });
  return (
    <div {...res} className={cn("min-w-[120px] space-y-2", className)}>
      <h1 className={headerStyle}>{headerName}</h1>
      {mapItems}
    </div>
  );
};

export {
  FilterDialog,
  FilterItem,
  type FilterDialogProps,
  type IShowData,
  type FilterItemProps,
};
