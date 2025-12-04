import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { buildNestedFiltersQuery, cn, useDebounce } from "../../utils/cn";
import Input from "../input";
import { Check, Eraser, ListFilter, X } from "lucide-react";
import CircleLoader from "../circle-loader";

export interface FilterItem {
  key: string;
  name: string;
}
interface FetchConfig {
  url: string;
  headers?: Record<string, string>;
  params?: string;
}

export type MultiSelectInputProps<T = any> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onSelect"
> & {
  // Either `fetch` function OR `apiConfig` must be provided
  fetch?: (
    value: string,
    filters?: Record<string, boolean>,
    maxFetch?: number
  ) => Promise<T[]>;
  apiConfig?: FetchConfig;

  renderItem?: (item: T, selected?: boolean) => React.ReactNode;
  filters?: FilterItem[];
  onFiltersChange?: (filtersState: Record<string, boolean>) => void;
  debounceValue?: number;
  parentClassName?: string;
  text?: {
    fetch?: string;
    notItem?: string;
    maxRecord?: string;
    clearFilters?: string;
  };
  endContent?: React.ReactNode;
  selectionMode?: "single" | "multiple";
  selected?: T | T[];
  onItemsSelect?: (selected: T | T[]) => void;
  searchBy?: keyof T | (keyof T)[];
  itemKey?: keyof T;
  STORAGE_KEY?: string;
} & (
    | {
        fetch: (
          value: string,
          filters?: Record<string, boolean>,
          maxFetch?: number
        ) => Promise<T[]>;
        apiConfig?: any;
      }
    | { apiConfig: FetchConfig; fetch?: any }
  );

function MultiSelectInputInner<T = any>(
  {
    fetch,
    renderItem,
    filters = [],
    onFiltersChange,
    debounceValue = 500,
    parentClassName,
    text = {
      fetch: "Fetching...",
      notItem: "No results found",
      maxRecord: "Max records",
      clearFilters: "Clear Filters",
    },
    endContent,
    STORAGE_KEY = "FILTER_STORAGE_KEY",
    selectionMode,
    selected,
    onItemsSelect,
    searchBy,
    itemKey,
    apiConfig,
    ...props
  }: MultiSelectInputProps<T>,
  ref: React.Ref<HTMLInputElement>
) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [items, setItems] = useState<T[]>([]);
  const [filtersState, setFiltersState] = useState<Record<string, boolean>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
      return filters.reduce((acc, f) => ({ ...acc, [f.key]: false }), {});
    }
  );

  const [maxFetch, setMaxFetch] = useState<number | "">(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_MAX_FETCH`);
      return saved ? Number(saved) : "";
    } catch {
      return "";
    }
  });

  const [selectedItems, setSelectedItems] = useState<T[]>(
    Array.isArray(selected) ? selected : selected ? [selected] : []
  );
  const [pendingSelection, setPendingSelection] = useState<T[] | T | null>(
    null
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(inputValue, debounceValue);

  useEffect(() => {
    const get = async () => {
      setIsFetching(true);
      try {
        let data: T[] = [];

        if (fetch) {
          // User-provided fetch function
          data = await fetch(
            debouncedValue,
            filtersState,
            maxFetch && !isNaN(Number(maxFetch)) ? Number(maxFetch) : undefined
          );
        } else if (apiConfig) {
          // Only include active filters
          const activeFilters = Object.fromEntries(
            Object.entries(filtersState).filter(([_, v]) => v)
          );

          // Build nested filters query
          const filtersQuery = buildNestedFiltersQuery(activeFilters);

          const combinedParams = new URLSearchParams({
            q: debouncedValue,
            maxFetch: maxFetch?.toString() ?? "",
            ...apiConfig.params,
          }).toString();

          const url = `${apiConfig.url}?${combinedParams}${
            filtersQuery ? "&" + filtersQuery : ""
          }`;

          const res = await window.fetch(url, {
            headers: apiConfig.headers,
          });
          data = await res.json();
        }

        setItems(data);
      } catch (err: any) {
        console.error(err);
        setItems([]);
      } finally {
        setIsFetching(false);
      }
    };

    get();
  }, [debouncedValue, fetch, apiConfig, filtersState, maxFetch]);

  // Update dropdown position
  const updatePosition = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  // Focus handlers
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleFocus = () => {
      setIsFocused(true);
      setShowFilters(false);
      updatePosition();
    };
    el.addEventListener("focus", handleFocus);
    return () => el.removeEventListener("focus", handleFocus);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current || !dropdownRef.current) return;
      if (
        !wrapperRef.current.contains(e.target as Node) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Window resize/scroll
  useEffect(() => {
    if (!isFocused && !showFilters) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isFocused, showFilters]);

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleFilterChange = (key: string, value: boolean) => {
    setFiltersState((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      onFiltersChange?.(next);
      return next;
    });
  };
  const handleItemClick = (item: T) => {
    const key = itemKey ? (item as any)[itemKey] : undefined;

    if (selectionMode === "single") {
      setSelectedItems([item]);
      setPendingSelection(item); // defer parent update
      setIsFocused(false);
    } else {
      setSelectedItems((prev) => {
        const exists = prev.some((i) => key && (i as any)[itemKey] === key);
        const next = exists
          ? prev.filter((i) => key && (i as any)[itemKey] !== key)
          : [...prev, item];
        setPendingSelection(next); // defer parent update
        return next;
      });
    }
  };

  // Use useLayoutEffect to call parent callback **after render but before paint**
  useLayoutEffect(() => {
    if (pendingSelection !== null) {
      onItemsSelect?.(pendingSelection);
      setPendingSelection(null);
    }
  }, [pendingSelection, onItemsSelect]);

  const clearIcon = (
    <X
      onClick={() => {
        setInputValue("");
        setSelectedItems([]);
        onItemsSelect?.([]);
      }}
      className="hover:bg-tertiary/10 hover:text-tertiary size-[38px] p-3 cursor-pointer text-primary/60 rounded transition-colors"
    />
  );
  const endIcon = endContent ?? clearIcon;

  const dropdown =
    (isFocused || showFilters) &&
    Dropdown(
      position,
      isFetching,
      text,
      filters,
      filtersState,
      showFilters,
      handleFilterChange,
      items,
      renderItem,
      dropdownRef,
      maxFetch,
      setMaxFetch,
      STORAGE_KEY,
      onFiltersChange,
      handleItemClick,
      selectedItems,
      searchBy,
      itemKey,
      setSelectedItems,
      setInputValue,
      onItemsSelect
    );

  return (
    <div ref={wrapperRef}>
      <div ref={containerRef} className={cn("w-full", parentClassName)}>
        <Input
          ref={ref || inputRef}
          {...props}
          value={inputValue}
          onChange={inputOnChange}
          endContent={
            <div className="flex items-center gap-1 relative ltr:-right-1 rtl:-left-1">
              {isFocused && endIcon}
              {filters.length !== 0 && (
                <ListFilter
                  onClick={() => {
                    updatePosition();
                    setShowFilters((prev) => !prev);
                    setIsFocused(false);
                  }}
                  className={cn(
                    "text-primary/50 hover:bg-tertiary/10 hover:text-tertiary size-[38px] p-3 cursor-pointer rounded transition-colors",
                    showFilters && "text-tertiary"
                  )}
                />
              )}
            </div>
          }
        />
      </div>
      {dropdown}
    </div>
  );
}

const MultiSelectInputForward = React.forwardRef(MultiSelectInputInner) as <
  T = any
>(
  props: MultiSelectInputProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => React.ReactElement;

export default MultiSelectInputForward;

// ---------------- Dropdown ----------------
const Dropdown = <T,>(
  position: { top: number; left: number; width: number },
  isFetching: boolean,
  text: {
    fetch?: string;
    notItem?: string;
    maxRecord?: string;
    clearFilters?: string;
  },
  filters: FilterItem[],
  filtersState: Record<string, boolean>,
  showFilters: boolean | undefined,
  handleFilterChange: (key: string, value: boolean) => void,
  items: T[],
  renderItem?: (item: T, selected?: boolean) => React.ReactNode,
  dropdownRef?: React.Ref<HTMLDivElement>,
  maxFetch?: number | "",
  setMaxFetch?: React.Dispatch<React.SetStateAction<number | "">>,
  STORAGE_KEY?: string,
  onFiltersChange?: (filtersState: Record<string, boolean>) => void,
  handleItemClick?: (item: T) => void,
  selectedItems?: T[],
  searchBy?: keyof T | (keyof T)[],
  itemKey?: keyof T,
  setSelectedItems?: React.Dispatch<React.SetStateAction<T[]>>,
  setInputValue?: React.Dispatch<React.SetStateAction<string>>,
  onItemsSelect?: (selected: T | T[]) => void
) =>
  createPortal(
    <div
      ref={dropdownRef}
      className="absolute z-50 border border-border rounded-b bg-card shadow-lg pt-3 pb-2"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="pb-3 px-3 flex flex-col gap-2 text-sm">
          {filters.map((f) => (
            <label key={f.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filtersState[f.key]}
                onChange={(e) => handleFilterChange(f.key, e.target.checked)}
              />

              {f.name}
            </label>
          ))}

          {setMaxFetch && (
            <input
              type="number"
              min={1}
              value={maxFetch}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";
                setMaxFetch(value);
                if (STORAGE_KEY)
                  localStorage.setItem(
                    `${STORAGE_KEY}_MAX_FETCH`,
                    JSON.stringify(value)
                  );
              }}
              className={cn(
                "selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded border bg-transparent px-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold focus-visible:ring-0 focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card dark:bg-black/30",
                "focus-visible:border-tertiary/60",
                "[&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none",
                "[-moz-appearance:textfield] "
              )}
              placeholder={text.maxRecord}
            />
          )}

          {/* Clear Filters + Selected Items */}
          {STORAGE_KEY && setMaxFetch && (
            <button
              onClick={() => {
                // Clear filters
                const cleared = filters.reduce(
                  (acc, f) => ({ ...acc, [f.key]: false }),
                  {}
                );
                Object.keys(cleared).forEach((key) =>
                  handleFilterChange(key, false)
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));

                // Clear maxFetch
                setMaxFetch("");
                localStorage.removeItem(`${STORAGE_KEY}_MAX_FETCH`);

                // Clear selected items and input
                setSelectedItems?.([]);
                setInputValue?.("");
                onItemsSelect?.([]);

                onFiltersChange?.(cleared);
              }}
              className="mt-2 flex items-center gap-x-1 text-sm cursor-pointer w-fit mx-auto text-red-600/90 hover:text-red-600"
            >
              <Eraser className="size-4" />
              {text.clearFilters}
            </button>
          )}
        </div>
      )}

      {!showFilters && isFetching && <CircleLoader label={text.fetch} />}

      {!showFilters && !isFetching && (
        <div className="max-h-60 overflow-auto">
          {items.length > 0 ? (
            items.map((item, index) => {
              const keyVal = itemKey ? (item as any)[itemKey] : index;
              const isSelected =
                selectedItems?.some(
                  (i) => itemKey && (i as any)[itemKey] === keyVal
                ) ?? false;

              const displayValue = Array.isArray(searchBy)
                ? searchBy.map((k) => (item as any)[k]).join(" / ")
                : (item as any)[searchBy ?? "name"];

              return renderItem ? (
                renderItem(item, isSelected)
              ) : (
                <div
                  key={keyVal}
                  className={cn(
                    "px-3 flex items-center gap-x-1 py-1 hover:bg-gray-100 cursor-pointer",
                    isSelected && "bg-gray-200"
                  )}
                  onClick={() => handleItemClick?.(item)}
                >
                  {isSelected && <Check className="size-4" />}
                  {displayValue}
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-gray-500">
              {text.notItem}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
