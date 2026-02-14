import { useAppStore } from '../../store/appStore';
import { ALL_CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants';
import { getUniqueStadtteile } from '../../utils/filterPlaces';
import { PLACES } from '../../data/places';
import type { CategoryGroup } from '../../types';

const allStadtteile = getUniqueStadtteile(PLACES);

export default function FilterBar() {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const toggleCategory = (cat: CategoryGroup) => {
    const current = filters.categories;
    if (current.includes(cat)) {
      setFilters({ categories: current.filter((c) => c !== cat) });
    } else {
      setFilters({ categories: [...current, cat] });
    }
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.stadtteile.length > 0 ||
    filters.priceMax !== null;

  return (
    <div className="filter-bar">
      {/* Category chips */}
      <div className="filter-section">
        <div className="filter-chips">
          {ALL_CATEGORIES.map((cat) => {
            const active = filters.categories.length === 0 || filters.categories.includes(cat);
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                className={`filter-chip ${active ? 'active' : 'inactive'}`}
                onClick={() => toggleCategory(cat)}
                style={{
                  borderColor: color,
                  background: active ? color : 'transparent',
                  color: active ? 'white' : color,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stadtteil dropdown */}
      <div className="filter-row">
        <select
          value={filters.stadtteile[0] || ''}
          onChange={(e) =>
            setFilters({
              stadtteile: e.target.value ? [e.target.value] : [],
            })
          }
          className="filter-select"
        >
          <option value="">Alle Stadtteile</option>
          {allStadtteile.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Price filter */}
        <select
          value={filters.priceMax ?? ''}
          onChange={(e) =>
            setFilters({
              priceMax: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="filter-select"
        >
          <option value="">Alle Preise</option>
          <option value="10">bis 10 EUR</option>
          <option value="20">bis 20 EUR</option>
          <option value="30">bis 30 EUR</option>
          <option value="50">bis 50 EUR</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="filter-reset" onClick={resetFilters}>
          Filter zuruecksetzen
        </button>
      )}
    </div>
  );
}
