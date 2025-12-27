import { cn } from "../../utils/cn";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  placeholder: string;
  className?: string;
  paginationKey: string;
  emptyPlaceholder: string;
  rangePlaceholder: string;
  options: Option[];
  onChange?: (value: string) => void;

  save?: (key: string, data: any) => Promise<void> | void;
  load?: (key: string) => Promise<any> | any;
}

const KEYS = {
  input: 0,
  default: 1,
};

// ---------------- Default Storage ----------------
const defaultSave = (key: string, data: any, STORAGE_KEY: string) => {
  try {
    localStorage.setItem(STORAGE_KEY + key, JSON.stringify(data));
  } catch {}
};

const defaultLoad = (key: string, STORAGE_KEY: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const PageSizeSelect: React.FC<SelectProps> = ({
  placeholder,
  emptyPlaceholder,
  rangePlaceholder,
  options,
  onChange,
  className,
  paginationKey,
  save,
  load,
}) => {
  const [mounted, setMounted] = useState(false);
  const [dropDirection, setDropDirection] = useState<"up" | "down">("down");
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [selectData, setSelectData] = useState({
    isOpen: false,
    showIcon: false,
    select: { key: "", value: "", option: -1 },
  });

  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveFn = save
    ? save
    : (key: string, data: any) => defaultSave(key, data, paginationKey);

  const loadFn = load ? load : (key: string) => defaultLoad(key, paginationKey);

  // ---------------- Mount ----------------
  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------- Load Cache ----------------
  useEffect(() => {
    const loadCache = async () => {
      const cached = await loadFn(paginationKey);
      if (cached) {
        setSelectData((p) => ({ ...p, select: cached }));
      } else {
        const item = { key: paginationKey, value: "10", option: KEYS.default };
        setSelectData((p) => ({ ...p, select: item }));
        saveFn(paginationKey, item);
      }
    };
    loadCache();
  }, [paginationKey]);

  // ---------------- Positioning ----------------
  const updatePosition = () => {
    const trigger = selectRef.current;
    const dropdown = dropdownRef.current;
    if (!trigger || !dropdown) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const gap = 6;

    const dropdownHeight = Math.min(dropdown.offsetHeight || 0, 260);
    const dropdownWidth = dropdown.offsetWidth || rect.width;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const spaceRight = viewportWidth - rect.left;
    const spaceLeft = rect.right;

    /* ---------- Vertical (Up / Down) ---------- */
    let top: number;
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropDirection("up");
      top = rect.top + window.scrollY - dropdownHeight - gap;
    } else {
      setDropDirection("down");
      top = rect.bottom + window.scrollY + gap;
    }

    /* ---------- Horizontal (Left / Right) ---------- */
    let left = rect.left + window.scrollX;

    // If dropdown overflows right viewport → shift left
    if (spaceRight < dropdownWidth && spaceLeft >= dropdownWidth) {
      left = rect.right + window.scrollX - dropdownWidth;
    }

    // Clamp to viewport (safety)
    left = Math.max(8, Math.min(left, viewportWidth - dropdownWidth - 8));

    setPosition({
      top,
      left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (selectData.isOpen) updatePosition();
  }, [selectData.isOpen, options.length]);

  useEffect(() => {
    if (!selectData.isOpen) return;
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [selectData.isOpen]);

  // ---------------- Outside Click ----------------
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !selectRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setSelectData((p) => ({ ...p, isOpen: false, showIcon: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------------- Select ----------------
  const handleSelect = async (value: string) => {
    const item = { key: paginationKey, value, option: KEYS.default };
    onChange?.(value);
    setSelectData((p) => ({ ...p, isOpen: false, select: item }));
    await saveFn(paginationKey, item);
  };

  // ---------------- Render ----------------
  return (
    <div ref={selectRef} className={cn("w-full", className)}>
      <button
        onClick={() => setSelectData((p) => ({ ...p, isOpen: !p.isOpen }))}
        className="w-full gap-1 text-sm px-2 py-2 border rounded-md flex items-center justify-between bg-card"
      >
        {selectData.select.value || placeholder}
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            selectData.isOpen && "rotate-180"
          )}
        />
      </button>

      {mounted &&
        selectData.isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className={cn(
              "absolute min-w-fit z-50 bg-card border border-primary/15 shadow-lg",
              dropDirection === "down" ? "rounded-b-md" : "rounded-t-md"
            )}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="number"
                placeholder={rangePlaceholder}
                onFocus={() => setSelectData((p) => ({ ...p, showIcon: true }))}
                defaultValue={
                  selectData.select.option === KEYS.input
                    ? selectData.select.value
                    : ""
                }
                className={`bg-card  dark:bg-card-secondary text-tertiary rtl:text-[17px] w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center text-sm px-4 py-2 border-b border-primary/15 rounded-t-md focus:outline-none`}
              />
              <Check
                className={cn(
                  "size-4 absolute top-2.5 right-2 cursor-pointer",
                  !selectData.showIcon && "hidden"
                )}
                onClick={async () => {
                  const value = inputRef.current?.value || "10";
                  const option = value ? KEYS.input : KEYS.default;
                  const item = { key: paginationKey, value, option };
                  onChange?.(value);
                  await saveFn(paginationKey, item);
                  setSelectData((p) => ({
                    ...p,
                    isOpen: false,
                    showIcon: false,
                    select: item,
                  }));
                }}
              />
            </div>

            {/* Options */}
            <ul className="max-h-60 overflow-auto">
              {options.length === 0 ? (
                <li className="px-4 py-2 text-center">{emptyPlaceholder}</li>
              ) : (
                options.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => handleSelect(o.value)}
                    className={cn(
                      "px-4 py-2 text-sm cursor-pointer flex justify-between hover:bg-primary/10",
                      selectData.select.value === o.value && "bg-primary/10"
                    )}
                  >
                    {o.label}
                    {selectData.select.value === o.value && (
                      <Check className="size-3" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default PageSizeSelect;
