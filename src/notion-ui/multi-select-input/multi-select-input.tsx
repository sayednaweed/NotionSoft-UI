import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, Eraser, List, ListFilter, LoaderCircle, X } from "lucide-react";
import { useDebounce } from "@/utils/hook";
import { cn } from "@/utils/cn";
import { Input, type NastranInputSize } from "@/components/notion-ui/input";
import { buildNestedFiltersQuery } from "@/utils/helper";

interface FilterItem {
  key: string;
  name: string;
}
interface FetchConfig {
  url: string;
  headers?: Record<string, string>;
  params?: string;
}

type MultiSelectInputProps<T = any> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onSelect"
> & {
  fetch?: (
    value: string,
    filters?: Record<string, boolean>,
    maxFetch?: number,
  ) => Promise<T[]>;
  apiConfig?: FetchConfig;

  renderItem?: (item: T, selected?: boolean) => React.ReactNode;
  filters?: FilterItem[];
  onFiltersChange?: (filtersState: Record<string, boolean>) => void;
  debounceValue?: number;
  classNames?: {
    rootDivClassName?: string;
  };
  text?: {
    notItem?: string;
    maxRecord?: string;
    clearFilters?: string;
    required?: string;
    label?: string;
  };
  fixedOptions?: T[];
  refechDependency?: any[];
  showMaxFetch?: boolean;
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
  errorMessage?: string;
  selectionMode?: "single" | "multiple";
  selected?: T | T[];
  onItemsSelect?: (selected: T | T[]) => void;
  onClear?: () => void;
  searchBy?: keyof T | (keyof T)[];
  itemKey?: keyof T;
  STORAGE_KEY?: string;
  measurement?: NastranInputSize;
  readOnly?: boolean;
} & (
    | {
        fetch: (
          value: string,
          filters?: Record<string, boolean>,
          maxFetch?: number,
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
    classNames,
    text = {
      notItem: "No results found",
      maxRecord: "Max records",
      clearFilters: "Clear Filters",
    },
    endContent,
    startContent,
    STORAGE_KEY = "FILTER_STORAGE_KEY",
    selectionMode,
    selected,
    onItemsSelect,
    searchBy,
    itemKey,
    apiConfig,
    errorMessage,
    readOnly,
    showMaxFetch,
    fixedOptions,
    refechDependency = [],
    onClear,
    ...props
  }: MultiSelectInputProps<T>,
  ref: React.Ref<HTMLInputElement>,
) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [items, setItems] = useState<T[]>(fixedOptions ?? []);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { rootDivClassName } = classNames || {};
  const [filtersState, setFiltersState] = useState<Record<string, boolean>>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
      return filters.reduce((acc, f) => ({ ...acc, [f.key]: false }), {});
    },
  );
  const [dropDirection, setDropDirection] = useState<"down" | "up">("down");

  const [maxFetch, setMaxFetch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_MAX_FETCH`);
      return saved ? Number(saved) : 30;
    } catch {
      return 30;
    }
  });

  const [selectedItems, setSelectedItems] = useState<T[]>(
    Array.isArray(selected) ? selected : selected ? [selected] : [],
  );
  useEffect(() => {
    const newSelected = Array.isArray(selected)
      ? selected
      : selected
        ? [selected]
        : [];
    const key = itemKey as keyof T;

    setSelectedItems((prev) => {
      const combinedMap = new Map<string, T>();

      // Add newSelected from prop first
      newSelected.forEach((item) => {
        const id = key ? String((item as any)[key]) : String(item);
        combinedMap.set(id, item);
      });

      prev.forEach((item) => {
        const id = key ? String((item as any)[key]) : String(item);
        if (!combinedMap.has(id)) {
          combinedMap.delete(id);
        }
      });
      return Array.from(combinedMap.values());
    });
  }, [selected]);

  const [pendingSelection, setPendingSelection] = useState<T[] | T | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(inputValue, debounceValue);
  const fetchRef = useRef(fetch);

  useEffect(() => {
    fetchRef.current = fetch;
  }, [fetch]);
  useEffect(() => {
    if (shouldFetch) setShouldFetch(false); // Allow fetch when function changes
  }, [maxFetch, ...refechDependency]);
  useEffect(() => {
    if (!shouldFetch || !isFocused || fixedOptions || !fetch) return; // ⛔ skip until first focus
    const get = async () => {
      setIsFetching(true);
      try {
        let data: T[] = [];

        if (fetch) {
          // User-provided fetch function
          data = await fetchRef.current(
            debouncedValue,
            filtersState,
            maxFetch && !isNaN(Number(maxFetch)) ? Number(maxFetch) : undefined,
          );
        } else if (apiConfig) {
          // Only include active filters
          const activeFilters = Object.fromEntries(
            Object.entries(filtersState).filter(([_, v]) => v),
          );

          // Build nested filters query
          const filtersQuery = buildNestedFiltersQuery(activeFilters);

          const combinedParams = new URLSearchParams({
            q: debouncedValue,
            max: maxFetch?.toString() ?? "",
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
  }, [debouncedValue, filtersState, maxFetch, shouldFetch]);
  useLayoutEffect(() => {
    if (dropdownRef.current) {
      updatePosition();
    }
  }, [items, showSelectedOnly]);
  // Update dropdown position
  const updatePosition = () => {
    const inputEl = containerRef.current;
    const dropdownEl = dropdownRef.current;
    if (!inputEl || !dropdownEl) return;

    const rect = inputEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const gap = 4; // distance between input and dropdown

    // Actual dropdown height based on content, capped at 260px
    const dropdownHeight = Math.min(dropdownEl.offsetHeight || 0, 260);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Decide direction
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // Flip above
      setDropDirection("up");
      setPosition({
        top: rect.top + window.scrollY - dropdownHeight - gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      // Dropdown below
      setDropDirection("down");
      setPosition({
        top: rect.bottom + window.scrollY + gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Focus handlers
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleFocus = () => {
      setIsFocused(true);
      setShowFilters(false);
      setShowSelectedOnly(false);
      updatePosition();
      // 🟢 First-time fetch trigger
      if (!shouldFetch) {
        setShouldFetch(true);
      }
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
        setShowSelectedOnly(false);
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
    [],
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
        if (onClear) onClear();
      }}
      className="hover:bg-tertiary/10 hover:text-tertiary size-[38px] p-3 cursor-pointer text-primary/60 rounded transition-colors"
    />
  );
  const endIcon = endContent ?? clearIcon;

  const dropdown =
    (isFocused || showFilters) &&
    Dropdown(
      showSelectedOnly,
      dropDirection,
      position,
      isFetching,
      text,
      filters,
      filtersState,
      showFilters,
      handleFilterChange,
      items,
      setMaxFetch,
      renderItem,
      dropdownRef,
      maxFetch,
      STORAGE_KEY,
      onFiltersChange,
      handleItemClick,
      selectedItems,
      searchBy,
      itemKey,
      setSelectedItems,
      setInputValue,
      onItemsSelect,
    );

  const selectedItemsIcon = selectedItems.length > 0 && (
    <div
      onClick={() => {
        setShowFilters(false); // Hide filters panel
        setIsFocused(true); // Open dropdown
        setShowSelectedOnly(true); // Show only selected items
        updatePosition(); // Recalculate dropdown position
      }}
      className="flex items-center pointer-events-auto hover:bg-tertiary/10 hover:text-tertiary cursor-pointer text-primary/60 rounded transition-colors"
    >
      <List className="size-[38px] p-3" />
      <span className="text-sm px-1">{selectedItems.length}</span>
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={readOnly ? "pointer-events-none cursor-not-allowed" : ""}
    >
      <div
        ref={containerRef}
        className={cn("w-full relative", rootDivClassName)}
      >
        <Input
          ref={ref || inputRef}
          {...props}
          readOnly={readOnly}
          requiredHint={text.required}
          label={text.label}
          value={inputValue}
          errorMessage={errorMessage}
          onChange={inputOnChange}
          startContent={startContent}
          endContent={
            <div className="flex items-center gap-1 relative ltr:-right-1 rtl:-left-1">
              {!showFilters && isFetching ? (
                <LoaderCircle className="size-[38px] p-3 animate-spin" />
              ) : (
                <>
                  {selectedItemsIcon}
                  {isFocused && endIcon}
                </>
              )}
              {(filters.length !== 0 || showMaxFetch) && (
                <ListFilter
                  onClick={() => {
                    updatePosition();
                    setShowFilters((prev) => !prev);
                    setIsFocused(false);
                  }}
                  className={cn(
                    "text-primary/50 hover:bg-tertiary/10 hover:text-tertiary size-[38px] p-3 cursor-pointer rounded transition-colors",
                    showFilters && "text-tertiary",
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
  T = any,
>(
  props: MultiSelectInputProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;

MultiSelectInputForward;

// ---------------- Dropdown ----------------
const Dropdown = <T,>(
  showSelectedOnly: boolean,
  dropDirection: string,
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
  setMaxFetch: React.Dispatch<React.SetStateAction<number>>,
  renderItem?: (item: T, selected?: boolean) => React.ReactNode,
  dropdownRef?: React.Ref<HTMLDivElement>,
  maxFetch?: number | "",
  STORAGE_KEY?: string,
  onFiltersChange?: (filtersState: Record<string, boolean>) => void,
  handleItemClick?: (item: T) => void,
  selectedItems?: T[],
  searchBy?: keyof T | (keyof T)[],
  itemKey?: keyof T,
  setSelectedItems?: React.Dispatch<React.SetStateAction<T[]>>,
  setInputValue?: React.Dispatch<React.SetStateAction<string>>,
  onItemsSelect?: (selected: T | T[]) => void,
) =>
  !isFetching &&
  createPortal(
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-50 border border-border ltr:text-xs ltr:sm:text-sm rtl:text-sm rtl:font-semibold bg-card shadow-lg pb-2",
        dropDirection === "down" ? "rounded-b" : "rounded-t",
      )}
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {/* Filters Panel */}
      {
        <div className="pb-3 px-3 flex flex-col gap-2">
          {filters.map((f, index) => (
            <label key={f.key + index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filtersState[f.key]}
                onChange={(e) => handleFilterChange(f.key, e.target.checked)}
              />

              {f.name}
            </label>
          ))}

          {(showFilters || filters.length > 0) && (
            <input
              type="number"
              min={1}
              value={maxFetch}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value) {
                  setMaxFetch(value);
                  if (STORAGE_KEY)
                    localStorage.setItem(
                      `${STORAGE_KEY}_MAX_FETCH`,
                      JSON.stringify(value),
                    );
                }
              }}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-sm border px-3 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold focus-visible:ring-0 focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card",
                "focus-visible:border-tertiary/60",
                "[&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none",
                "[-moz-appearance:textfield]",
              )}
              placeholder={text.maxRecord}
            />
          )}

          {/* Clear Filters + Selected Items */}
          {STORAGE_KEY && showFilters && (
            <button
              onClick={() => {
                // Clear filters
                const cleared = filters.reduce(
                  (acc, f) => ({ ...acc, [f.key]: false }),
                  {},
                );
                Object.keys(cleared).forEach((key) =>
                  handleFilterChange(key, false),
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));

                // Clear maxFetch
                setMaxFetch(30);
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
      }
      {!showFilters && !isFetching && (
        <div className="max-h-60 overflow-auto">
          {showSelectedOnly ? (
            selectedItems &&
            selectedItems.length > 0 &&
            selectedItems.map((item, index) => {
              const keyVal = itemKey ? (item as any)[itemKey] : index;
              return renderItem ? (
                renderItem(item, true)
              ) : (
                <div
                  key={keyVal}
                  className="px-3 flex items-center gap-x-1 py-1 cursor-pointer"
                  onClick={() => handleItemClick?.(item)}
                >
                  <Check className="size-4" />
                  {(item as any)[searchBy ?? "name"]}
                </div>
              );
            })
          ) : items.length > 0 ? (
            items.map((item, index) => {
              const keyVal = itemKey ? (item as any)[itemKey] : index;
              const isSelected =
                selectedItems?.some(
                  (i) => itemKey && (i as any)[itemKey] == keyVal,
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
                    "px-3 flex items-center gap-x-1 py-1 hover:bg-primary/5 cursor-pointer",
                    isSelected && "bg-primary/5",
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
    document.body,
  );

export { MultiSelectInputForward, type FilterItem, type MultiSelectInputProps };
