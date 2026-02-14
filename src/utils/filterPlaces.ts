import type { Place, FilterState } from '../types';

export function filterPlaces(places: Place[], filters: FilterState): Place[] {
  return places.filter((place) => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(place.categoryGroup)) {
      return false;
    }

    // District filter
    if (filters.stadtteile.length > 0 && !filters.stadtteile.includes(place.stadtteil)) {
      return false;
    }

    // Season filter
    if (filters.seasons.length > 0) {
      const matchesSeason = filters.seasons.some(
        (s) =>
          place.season.toLowerCase().includes(s.toLowerCase()) ||
          place.season === 'Beides' ||
          place.season === 'Ganzjaehrig'
      );
      if (!matchesSeason) return false;
    }

    // Price filter
    if (filters.priceMax !== null && place.preisMin !== null) {
      if (place.preisMin > filters.priceMax) return false;
    }

    // Expired filter
    if (!filters.showExpired && place.isExpired) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = [
        place.name,
        place.address,
        place.stadtteil,
        place.besonderheit,
        place.beschreibung || '',
        place.categoryGroup,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

export function getUniqueStadtteile(places: Place[]): string[] {
  const set = new Set(places.map((p) => p.stadtteil).filter(Boolean));
  return Array.from(set).sort();
}
