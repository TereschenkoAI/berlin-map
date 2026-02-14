import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';

export default function SearchInput() {
  const setFilters = useAppStore((s) => s.setFilters);
  const searchQuery = useAppStore((s) => s.filters.searchQuery);
  const [local, setLocal] = useState(searchQuery);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timer.current = setTimeout(() => {
      setFilters({ searchQuery: local });
    }, 250);
    return () => clearTimeout(timer.current);
  }, [local, setFilters]);

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder="Orte suchen..."
      className="search-input"
    />
  );
}
