import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently
 */
export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}
export function buildNestedFiltersQuery(filters: Record<string, any>): string {
  const params = new URLSearchParams();

  function recurse(obj: Record<string, any>, prefix: string) {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = `${prefix}[${key}]`;
      if (value && typeof value === "object") {
        recurse(value, newKey);
      } else if (value !== undefined && value !== null) {
        params.append(newKey, value.toString());
      }
    });
  }

  recurse(filters, "filters");
  return params.toString();
}
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
