export interface FilterOptions {
  activeOnly?: boolean;
  includeArchived?: boolean;
}

interface FiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="dropdown-section">
      <p className="section-title">Filters</p>

      {Object.entries(filters).map(([key, value]) => (
        <label className="filter-item" key={key}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange({ ...filters, [key]: e.target.checked })}
          />
          {key === "activeOnly" ? "Only Active" : "Include Archived"}
        </label>
      ))}
    </div>
  );
};

export default Filters;
