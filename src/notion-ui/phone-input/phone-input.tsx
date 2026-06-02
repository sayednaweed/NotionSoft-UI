import { LazyFlag } from "./lazy-flag";
import { defaultCountries } from "@/data/data";
import { type ParsedCountry } from "@/types/type";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { AnimatedItem } from "@/components/notion-ui/animated-item";
import { cn } from "@/utils/cn";

interface VirtualListProps {
  items: ParsedCountry[];
  renderRow: (item: ParsedCountry, index: number) => React.ReactNode;
  height: number;
  ROW_HEIGHT: number;
  BUFFER: number;
}

const VirtualList: React.FC<VirtualListProps> = ({
  items,
  renderRow,
  height,
  ROW_HEIGHT,
  BUFFER,
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * ROW_HEIGHT;

  // calculate visible indices
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / ROW_HEIGHT) + BUFFER,
  );

  // Slice items to render
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      className="overflow-y-auto"
      style={{ height, maxHeight: height }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => {
          const index = startIndex + i; // absolute index
          return (
            <div
              key={`${item.iso2}-${index}`} // absolute key ensures React updates
              style={{
                position: "absolute",
                top: index * ROW_HEIGHT,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
              }}
            >
              {renderRow(item, index)} {/* pass absolute index */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
type PhoneInputSize = "sm" | "md" | "lg";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  requiredHint?: string;
  label?: string;
  error?: string;
  classNames?: {
    rootDivClassName?: string;
    iconClassName?: string;
    requiredHint?: string;
    label?: string;
    searchInput?: string;
  };
  text: {
    searchInputPlaceholder: string;
  };
  measurement?: PhoneInputSize;
  ROW_HEIGHT?: number;
  VISIBLE_ROWS?: number;
  BUFFER?: number;
  onTranslate?: (value: string) => string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  measurement = "sm",
  error,
  label,
  readOnly,
  className,
  classNames,
  requiredHint,
  value,
  onTranslate,
  onChange,
  ROW_HEIGHT = 32,
  VISIBLE_ROWS = 10,
  BUFFER = 5,
  text,
  id,
  ...rest
}) => {
  const { rootDivClassName, iconClassName = "size-4" } = classNames || {};
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const { searchInputPlaceholder } = text || {};

  const initialCountry = (() => {
    if (typeof value === "string" && value.startsWith("+")) {
      const matched = defaultCountries.find((c) =>
        value.startsWith("+" + c.dialCode),
      );
      return matched || defaultCountries[0];
    }
    return defaultCountries[0];
  })();
  const [country, setCountry] = useState<ParsedCountry>(initialCountry);
  const [phone, setPhone] = useState<string>(
    typeof value === "string" ? value : `+${initialCountry.dialCode}`,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [search, setSearch] = useState("");
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(
    ROW_HEIGHT * VISIBLE_ROWS,
  );
  const [listHeight, setListHeight] = useState(ROW_HEIGHT * VISIBLE_ROWS);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return defaultCountries;
    const s = search.toLowerCase();
    return defaultCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.iso2.toLowerCase().includes(s) ||
        ("+" + c.dialCode).includes(s),
    );
  }, [search]);
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  const [dropDirection, setDropDirection] = useState<"down" | "up">("down");

  const hasError = !!error;

  // Choose country
  const chooseCountry = (c: ParsedCountry) => {
    setCountry(c);
    setOpen(false);

    setPhone((prev) => {
      const oldDialRegex = new RegExp(`^\\+${country.dialCode}`);
      const restNumber = prev.replace(oldDialRegex, "");
      const newValue = `+${c.dialCode}${restNumber}`;
      if (onChange && inputRef.current) {
        const fakeEvent = {
          target: {
            ...inputRef.current,
            name: inputRef.current.name,
            value: newValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(fakeEvent);
      }

      return newValue;
    });

    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, filteredCountries.length - 1),
      );
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      chooseCountry(filteredCountries[highlightedIndex]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !dropdownRef.current) return;

    // Get the scrollable container inside the virtual list
    const scrollableContainer =
      dropdownRef.current.querySelector(".overflow-y-auto");
    if (!scrollableContainer) return;

    const rowTop = highlightedIndex * ROW_HEIGHT;
    const rowBottom = rowTop + ROW_HEIGHT;
    const scrollContainer = scrollableContainer as HTMLDivElement;

    if (rowTop < scrollContainer.scrollTop) {
      scrollContainer.scrollTop = rowTop;
    } else if (rowBottom > scrollContainer.scrollTop + listHeight) {
      scrollContainer.scrollTop = rowBottom - listHeight;
    }
  }, [highlightedIndex, open, listHeight, ROW_HEIGHT]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dropdown position
  const updateDropdownPosition = () => {
    const inputEl = containerRef.current;
    if (!inputEl) return;

    const rect = inputEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const gap = 4;
    const safeGap = 8;
    const searchHeight = searchBarRef.current?.offsetHeight || 49;
    const desiredDropdownHeight = ROW_HEIGHT * VISIBLE_ROWS + searchHeight;

    const spaceBelow = viewportHeight - rect.bottom - safeGap;
    const spaceAbove = rect.top - safeGap;

    if (spaceBelow < desiredDropdownHeight && spaceAbove > spaceBelow) {
      const nextDropdownHeight = Math.max(
        searchHeight + ROW_HEIGHT,
        Math.min(desiredDropdownHeight, spaceAbove),
      );
      setDropDirection("up");
      setDropdownMaxHeight(nextDropdownHeight);
      setListHeight(Math.max(ROW_HEIGHT, nextDropdownHeight - searchHeight));
      setPosition({
        top: rect.top + window.scrollY - nextDropdownHeight - gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      const nextDropdownHeight = Math.max(
        searchHeight + ROW_HEIGHT,
        Math.min(desiredDropdownHeight, spaceBelow),
      );
      setDropDirection("down");
      setDropdownMaxHeight(nextDropdownHeight);
      setListHeight(Math.max(ROW_HEIGHT, nextDropdownHeight - searchHeight));
      setPosition({
        top: rect.bottom + window.scrollY + gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useLayoutEffect(() => updateDropdownPosition(), [open, search]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, search, ROW_HEIGHT, VISIBLE_ROWS]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (open) {
      const currentIndex = defaultCountries.findIndex(
        (c) => c.iso2 === country.iso2,
      );
      if (currentIndex >= 0) {
        setHighlightedIndex(currentIndex);
      }
    }
  }, [open, country]);

  const heightStyle = useMemo(
    () =>
      measurement == "lg"
        ? {
            height: "50px",
          }
        : measurement == "md"
          ? {
              height: "44px",
            }
          : {
              height: "40px",
            },
    [measurement, label],
  );
  const readOnlyStyle = readOnly && "opacity-40";

  const inputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let name = e.target.name;

    // Ensure dial code always at start
    if (!val.startsWith(`+${country.dialCode}`)) {
      val = `+${country.dialCode}${val.replace(/^\+\d*/, "")}`;
    }

    setPhone(val);
    if (onChange) {
      // emit event
      const fakeEvent = {
        ...e,
        target: { ...e.target, name: name, value: val },
      };
      onChange(fakeEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const renderSearchBar = () => (
    <div
      ref={searchBarRef}
      className={cn(
        "p-2 z-10 border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900/50",
        dropDirection === "down"
          ? "sticky top-0 border-b"
          : "sticky bottom-0 border-t",
      )}
    >
      <input
        autoFocus
        placeholder={searchInputPlaceholder}
        value={search}
        id={inputId}
        disabled={readOnly}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        className={cn(
          "w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500",
          "outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        )}
      />
    </div>
  );

  return (
    <div
      className={cn(
        rootDivClassName,
        "relative flex flex-col w-full",
        readOnlyStyle,
      )}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Required Hint */}
      {requiredHint && (
        <span
          className={cn(
            "font-semibold text-red-600 text-[11px]",
            classNames?.requiredHint,
          )}
        >
          {requiredHint}
        </span>
      )}

      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "inline-block pb-1 font-semibold ltr:text-sm",
            classNames?.label,
          )}
        >
          {label}
        </label>
      )}
      <div className="flex gap-1">
        <button
          type="button"
          style={{
            height: heightStyle.height,
          }}
          className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-tertiary/60 rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400"
          onClick={() => setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <LazyFlag iso2={country.iso2} className={iconClassName} />
          <span className="text-primary ltr:text-sm rtl:text-sm rtl:font-semibold">
            +{country.dialCode}
          </span>
        </button>

        <input
          ref={inputRef}
          id={inputId}
          data-slot="input"
          readOnly={readOnly}
          disabled={readOnly}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={inputChanged}
          type="tel"
          value={
            phone.startsWith(`+${country.dialCode}`)
              ? phone
              : `+${country.dialCode}`
          }
          className={cn(
            "w-full bg-transparent text-sm bg-slate text-slate-700 placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500 rounded-xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900/50",
            "outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            classNames?.searchInput,
          )}
          {...rest}
        />
      </div>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className={cn(
              "absolute bg-white/85 dark:bg-slate-900/50 z-50 border rounded-xl border-slate-200 px-4 dark:border-white/10",
              dropDirection === "down" ? "rounded-t-xl" : "rounded-b-xl",
            )}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: dropdownMaxHeight,
            }}
            role="listbox"
          >
            {dropDirection === "down" && renderSearchBar()}

            <VirtualList
              ROW_HEIGHT={ROW_HEIGHT}
              BUFFER={BUFFER}
              items={filteredCountries}
              height={listHeight}
              renderRow={(c, i) => (
                <div
                  onClick={() => chooseCountry(c)}
                  className={`flex text-sm items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800/80 ${
                    i == highlightedIndex && "bg-slate-200 dark:bg-slate-800/80"
                  }`}
                  role="option"
                  aria-selected={i === highlightedIndex}
                >
                  <LazyFlag iso2={c.iso2} className={iconClassName} />
                  <span className="flex-1 truncate">
                    {onTranslate ? onTranslate(c.name) : c.name}
                  </span>
                  <span>+{c.dialCode}</span>
                </div>
              )}
            />

            {dropDirection === "up" && renderSearchBar()}
          </div>,
          document.body,
        )}
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
          <h1 className="text-red-400 text-start capitalize text-[11px]">
            {error}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
};
export { PhoneInput, type PhoneInputSize };
