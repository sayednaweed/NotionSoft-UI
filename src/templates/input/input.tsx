import { useState, useEffect, useRef, useCallback } from "react";
import "./Input.css";
import { Search, ListFilter } from "lucide-react";
import Filters, { FilterOptions } from "./filter";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface InputProps {
  placeholder?: string;

  /** Optional API URL */
  apiUrl?: string;

  /** Show filter button + filter UI */
  showFilters?: boolean;

  /** Default filter values */
  filters?: FilterOptions;

  /** Storybook mock data (bypass API) */
  mockOptions?: MultiSelectOption[];
}

const Input: React.FC<InputProps> = ({
  placeholder = "Search...",
  apiUrl,
  showFilters = false,
  filters: initialFilters = { activeOnly: false, includeArchived: false },
  mockOptions,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [options, setOptions] = useState<MultiSelectOption[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const containerRef = useRef<HTMLDivElement>(null);

  /** Toggle single option */
  const toggleSelect = useCallback(
    (value: string) =>
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      ),
    []
  );

  /** Select all / deselect all */
  const toggleSelectAll = () => {
    if (selected.length === options.length) {
      setSelected([]);
    } else {
      setSelected(options.map((opt) => opt.value));
    }
  };

  // ----------------------------------------------------------------
  // 🔍 FETCH LOGIC
  // ----------------------------------------------------------------
  useEffect(() => {
    /** If Storybook provides mock options, do not fetch */
    if (mockOptions) {
      setOptions(mockOptions);
      return;
    }

    /** No API → do nothing */
    if (!apiUrl) return;

    const fetchData = async () => {
      try {
        const url = new URL(apiUrl);
        url.searchParams.set("q", search); // search support

        /** Only pass filters when UI enabled */
        if (showFilters) {
          url.searchParams.set("activeOnly", String(filters.activeOnly));
          url.searchParams.set(
            "includeArchived",
            String(filters.includeArchived)
          );
        }

        const res = await fetch(url.toString());
        const data = (await res.json()) as MultiSelectOption[];

        if (Array.isArray(data)) {
          setOptions(data);
        }
      } catch (err) {
        console.error("Input API fetch failed:", err);
        setOptions([]);
      }
    };

    fetchData();
  }, [search, filters, apiUrl, showFilters, mockOptions]);

  // ----------------------------------------------------------------
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // ----------------------------------------------------------------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ----------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------
  return (
    <div className="container" ref={containerRef}>
      <div className="search-input-wrapper">
        <span className="search-icon">
          <Search className="w-4" />
        </span>

        <input
          className="search-input"
          value={search}
          placeholder={placeholder}
          onChange={(e) => setSearch(e.target.value)}
        />

        {showFilters && (
          <span
            className="filter-icon"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}>
            <ListFilter className="w-4" />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="dropdown">
          {showFilters && <Filters filters={filters} onChange={setFilters} />}

          <div className="dropdown-section">
            <p className="section-title">Select Options</p>

            {options.length > 0 ? (
              <>
                {/* Select All */}
                <label className="multi-row">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === options.length && options.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                  {selected.length === options.length
                    ? "Deselect All"
                    : "Select All"}
                </label>

                {options.map((opt) => (
                  <label key={opt.value} className="multi-row">
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggleSelect(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </>
            ) : (
              <p className="no-results">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Input;
