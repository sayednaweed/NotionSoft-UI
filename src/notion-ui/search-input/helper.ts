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
