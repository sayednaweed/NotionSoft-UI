import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Eraser, ListFilter, LoaderCircle, X } from "lucide-react";
import { useDebounce } from "@/utils/hook";
import { buildNestedFiltersQuery } from "@/utils/helper";
import { Input } from "@/components/notion-ui/input";
import { cn } from "@/utils/cn";

type NastranInputSize = "sm" | "md" | "lg";

interface FilterItem {
  key: string;
  name: string;
}
interface ApiConfig {
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}
// Generic Props
interface BaseSearchInputProps<T = { id: string; name: string }> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onSelect"
> {
  renderItem?: (item: T) => React.ReactNode;
  itemOnClick?: (item: T) => void;
  filters?: FilterItem[];
  onFiltersChange?: (filtersState: Record<string, boolean>) => void;
  debounceValue?: number;
  errorMessage?: string;
  parentClassName?: string;
  text?: {
    fetch?: string;
    notItem?: string;
    maxRecord?: string;
    clearFilters?: string;
  };
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
  STORAGE_KEY?: string;
}

// Either user provides `fetch` function...
interface FetchProps<T> extends BaseSearchInputProps<T> {
  fetch: (
    value: string,
    filters?: Record<string, boolean>,
    maxFetch?: number,
  ) => Promise<T[]>;
  apiConfig?: never;
}

// ...or `apiConfig` object
interface ApiConfigProps<T> extends BaseSearchInputProps<T> {
  fetch?: never;
  apiConfig: ApiConfig;
}

// The final props type
type SearchInputProps<T = { id: string; name: string }> =
  | FetchProps<T>
  | ApiConfigProps<T>;

// ✅ Generic forwardRef wrapper
function SearchInputInner<T = { id: string; name: string }>(
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
    apiConfig,
    errorMessage,
    startContent,
    itemOnClick,
    ...props
  }: SearchInputProps<T>,
  ref: React.Ref<HTMLInputElement>,
) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [items, setItems] = useState<T[]>([]);
  const [shouldFetch, setShouldFetch] = useState(false);

  const [filtersState, setFiltersState] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return filters.reduce((acc, f) => ({ ...acc, [f.key]: false }), {});
    },
  );
  const [dropDirection, setDropDirection] = useState<"down" | "up">("down");

  const [maxFetch, setMaxFetch] = useState<number | "">(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MAX_FETCH`);
    return saved ? Number(saved) : "";
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(inputValue, debounceValue);

  // Fetch items
  useEffect(() => {
    if (!shouldFetch) return; // ⛔ skip until first focus

    const get = async () => {
      setIsFetching(true);
      try {
        let data: T[] = [];

        if (fetch) {
          // User-provided fetch function
          data = await fetch(
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
            credentials: "include",
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
  }, [debouncedValue, fetch, apiConfig, filtersState, maxFetch, shouldFetch]);
  useLayoutEffect(() => {
    if (dropdownRef.current) {
      updatePosition();
    }
  }, [items]);
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

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleFocus = () => {
      setIsFocused(true);
      setShowFilters(false);
      updatePosition();
      // 🟢 First-time fetch trigger
      if (!shouldFetch) {
        setShouldFetch(true);
      }
    };
    el.addEventListener("focus", handleFocus);
    return () => el.removeEventListener("focus", handleFocus);
  }, []);

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

  const clearIcon = (
    <X
      onClick={() => setInputValue("")}
      className="hover:bg-tertiary/10 hover:text-tertiary size-[38px] p-3 cursor-pointer text-primary/60 rounded transition-colors"
    />
  );
  const endIcon = endContent ?? clearIcon;

  const handleFilterChange = (key: string, value: boolean) => {
    setFiltersState((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      onFiltersChange?.(next);
      return next;
    });
  };

  const inputOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const dropdown =
    isFocused || showFilters
      ? Dropdown(
          dropDirection,
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
        )
      : null;

  return (
    <div ref={wrapperRef}>
      <div ref={containerRef} className={cn("w-full", parentClassName)}>
        <Input
          ref={ref || inputRef}
          {...props}
          value={inputValue}
          onChange={inputOnChange}
          errorMessage={errorMessage}
          startContent={startContent}
          endContent={
            <div className="flex items-center gap-1 relative ltr:-right-1 rtl:-left-1">
              {!showFilters && isFetching ? (
                <LoaderCircle className="size-[38px] p-3 animate-spin" />
              ) : (
                isFocused && endIcon
              )}
              {filters.length != 0 && (
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

// Wrap with forwardRef and generic
const SearchInputForward = React.forwardRef(SearchInputInner) as <
  T = { id: string; name: string },
>(
  props: SearchInputProps<T> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;

/* Dropdown */
const Dropdown = <T,>(
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
  renderItem?: (item: T) => React.ReactNode,
  dropdownRef?: React.Ref<HTMLDivElement>,
  maxFetch?: number | "",
  setMaxFetch?: React.Dispatch<React.SetStateAction<number | "">>,
  STORAGE_KEY?: string,
  onFiltersChange?: (filtersState: Record<string, boolean>) => void,
  itemOnClick?: (item: T) => void,
) =>
  !isFetching &&
  createPortal(
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-50 border border-border bg-card shadow-lg pt-3 pb-2",
        dropDirection === "down" ? "rounded-b" : "rounded-t",
      )}
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {showFilters && filters.length > 0 && (
        <div className="pb-3 px-3 flex flex-col gap-2 text-sm">
          {filters.map((f) => (
            <label key={f.key} className={`flex items-center gap-2`}>
              <input
                type="checkbox"
                checked={filtersState[f.key]}
                onChange={(e) => handleFilterChange(f.key, e.target.checked)}
              />
              {f.name}
            </label>
          ))}

          {/* Max fetch input */}
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
                    JSON.stringify(value),
                  );
              }}
              className={cn(
                "selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded border bg-transparent px-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold focus-visible:ring-0 focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card dark:bg-black/30",
                "focus-visible:border-tertiary/60",
                "[&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none",
                "[-moz-appearance:textfield] ",
              )}
              placeholder={text.maxRecord}
            />
          )}

          {/* Clear filters button */}
          {STORAGE_KEY && setMaxFetch && (
            <button
              onClick={() => {
                const cleared = filters.reduce(
                  (acc, f) => ({ ...acc, [f.key]: false }),
                  {},
                );
                handleFilterChange &&
                  Object.keys(cleared).forEach((key) =>
                    handleFilterChange(key, false),
                  );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
                setMaxFetch("");
                localStorage.removeItem(`${STORAGE_KEY}_MAX_FETCH`);
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
      {!showFilters && !isFetching && (
        <div className="max-h-60 overflow-auto">
          {items.length > 0 ? (
            items.map((item, index) =>
              renderItem ? (
                renderItem(item)
              ) : (
                <div
                  onClick={() => {
                    if (itemOnClick) itemOnClick(item);
                  }}
                  key={(item as any).id ?? index}
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {(item as any).name ?? JSON.stringify(item)}
                </div>
              ),
            )
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
export {
  NastranInputSize,
  SearchInputProps,
  FilterItem,
  BaseSearchInputProps,
  FetchProps,
  ApiConfigProps,
  SearchInputForward,
};
