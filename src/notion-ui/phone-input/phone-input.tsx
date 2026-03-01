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
import { LazyFlag } from "@/components/notion-ui/phone-input/lazy-flag";
import { defaultCountries } from "@/data/data";
import { ParsedCountry } from "@/type/type";

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
      className="overflow-y-auto max-h-60"
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
  ...rest
}) => {
  const { rootDivClassName, iconClassName = "size-4" } = classNames || {};
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const { searchInputPlaceholder } = text;

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [search, setSearch] = useState("");
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
    } else if (
      rowBottom >
      scrollContainer.scrollTop + ROW_HEIGHT * VISIBLE_ROWS
    ) {
      scrollContainer.scrollTop = rowBottom - ROW_HEIGHT * VISIBLE_ROWS;
    }
  }, [highlightedIndex, open]);

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
    const dropdownEl = dropdownRef.current;
    if (!inputEl || !dropdownEl) return;

    const rect = inputEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const gap = 4;

    const dropdownHeight = Math.min(dropdownEl.offsetHeight || 0, 260);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropDirection("up");
      setPosition({
        top: rect.top + window.scrollY - dropdownHeight - gap,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    } else {
      setDropDirection("down");
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
  }, [open]);

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
            required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
          }
        : measurement == "md"
          ? {
              height: "44px",
              required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
            }
          : {
              height: "40px",
              required: label ? "ltr:top-[4px] rtl:top-[12px]" : "top-[-19px]",
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
            "absolute font-semibold text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-2.5 rtl:left-2.5",
            heightStyle.required,
          )}
        >
          {requiredHint}
        </span>
      )}

      {/* Label */}
      {label && (
        <label
          htmlFor={label}
          className={cn(
            "font-semibold ltr:text-[13px] rtl:text-[18px] text-start inline-block pb-1",
          )}
        >
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          style={{
            height: heightStyle.height,
          }}
          className="flex items-center dark:bg-input/30 gap-2 px-2 border rounded-sm bg-card hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-tertiary/60"
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
          type="tel"
          value={
            phone.startsWith(`+${country.dialCode}`)
              ? phone
              : `+${country.dialCode}`
          }
          onChange={inputChanged}
          placeholder="Phone number"
          style={{
            height: heightStyle.height,
          }}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-sm border px-3 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold focus-visible:ring-0 focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card",
            "focus-visible:border-tertiary/60",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none",
            "[-moz-appearance:textfield] rtl:text-right",
            hasError && "border-red-400",
            className,
          )}
          {...rest}
          disabled={readOnly}
        />
      </div>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-50 border bg-card shadow-lg",
              dropDirection === "down" ? "rounded-b" : "rounded-t",
            )}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: ROW_HEIGHT * VISIBLE_ROWS, // Set maxHeight here instead
            }}
            role="listbox"
          >
            {/* 🔍 Search bar */}
            <div className="p-2 border-b bg-card sticky top-0 z-10">
              <input
                type="text"
                autoFocus
                className="w-full px-2 py-1 text-sm border rounded-sm bg-input/30 focus:outline-none"
                placeholder={searchInputPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <VirtualList
              ROW_HEIGHT={ROW_HEIGHT}
              BUFFER={BUFFER}
              items={filteredCountries}
              height={ROW_HEIGHT * VISIBLE_ROWS}
              renderRow={(c, i) => (
                <div
                  onClick={() => chooseCountry(c)}
                  className={`flex ltr:text-sm rtl:text-sm rtl:font-semibold items-center gap-2 px-2 py-1 cursor-pointer ${
                    i == highlightedIndex && "bg-primary/5"
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
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-[11px]">
            {error}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
};
export { PhoneInput, PhoneInputSize };
