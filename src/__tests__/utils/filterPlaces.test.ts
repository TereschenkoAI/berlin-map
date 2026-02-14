import { describe, it, expect } from 'vitest';
import { filterPlaces, getUniqueStadtteile } from '../../utils/filterPlaces';
import type { Place, FilterState } from '../../types';

const makePlaces = (): Place[] => [
  {
    id: 'cafe-a',
    name: 'Cafe A',
    categoryGroup: 'Cafes & Baeckereien',
    address: 'Str 1, Berlin',
    lat: 52.5,
    lng: 13.4,
    stadtteil: 'Mitte',
    season: 'Beides',
    preis: '3-8 EUR',
    preisMin: 3,
    preisMax: 8,
    instagram: [],
    besonderheit: 'Nettes Cafe',
    oeffnungszeiten: null,
    beschreibung: null,
    isExpired: false,
  },
  {
    id: 'spa-b',
    name: 'Spa B',
    categoryGroup: 'Spas, Saunas & Thermen',
    address: 'Str 2, Berlin',
    lat: 52.51,
    lng: 13.35,
    stadtteil: 'Kreuzberg',
    season: 'Ganzjaehrig',
    preis: 'ab 27,50 EUR',
    preisMin: 27.5,
    preisMax: 27.5,
    instagram: [{ label: 'Post', url: 'https://instagram.com/p/123' }],
    besonderheit: 'Balinese Spa',
    oeffnungszeiten: null,
    beschreibung: null,
    isExpired: false,
  },
  {
    id: 'event-c',
    name: 'Event C',
    categoryGroup: 'Weihnachtsmaerkte & Valentinstag',
    address: 'Str 3, Berlin',
    lat: 52.52,
    lng: 13.39,
    stadtteil: 'Mitte',
    season: 'Winter',
    preis: '5 EUR',
    preisMin: 5,
    preisMax: 5,
    instagram: [],
    besonderheit: 'Weihnachtsmarkt',
    oeffnungszeiten: null,
    beschreibung: null,
    isExpired: true,
  },
];

const defaultFilters: FilterState = {
  categories: [],
  stadtteile: [],
  seasons: [],
  priceMax: null,
  searchQuery: '',
  showExpired: false,
};

describe('filterPlaces', () => {
  it('hides expired places by default', () => {
    const result = filterPlaces(makePlaces(), defaultFilters);
    expect(result.length).toBe(2);
    expect(result.find((p) => p.id === 'event-c')).toBeUndefined();
  });

  it('shows expired places when showExpired is true', () => {
    const result = filterPlaces(makePlaces(), { ...defaultFilters, showExpired: true });
    expect(result.length).toBe(3);
  });

  it('filters by category', () => {
    const result = filterPlaces(makePlaces(), {
      ...defaultFilters,
      categories: ['Cafes & Baeckereien'],
      showExpired: true,
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('cafe-a');
  });

  it('filters by stadtteil', () => {
    const result = filterPlaces(makePlaces(), {
      ...defaultFilters,
      stadtteile: ['Kreuzberg'],
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('spa-b');
  });

  it('filters by price', () => {
    const result = filterPlaces(makePlaces(), {
      ...defaultFilters,
      priceMax: 10,
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('cafe-a');
  });

  it('filters by search query', () => {
    const result = filterPlaces(makePlaces(), {
      ...defaultFilters,
      searchQuery: 'Balinese',
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('spa-b');
  });

  it('returns all non-expired when no filters set', () => {
    const result = filterPlaces(makePlaces(), defaultFilters);
    expect(result.length).toBe(2);
  });

  it('combines multiple filters', () => {
    const result = filterPlaces(makePlaces(), {
      ...defaultFilters,
      categories: ['Cafes & Baeckereien', 'Spas, Saunas & Thermen'],
      stadtteile: ['Mitte'],
    });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('cafe-a');
  });
});

describe('getUniqueStadtteile', () => {
  it('returns sorted unique districts', () => {
    const result = getUniqueStadtteile(makePlaces());
    expect(result).toEqual(['Kreuzberg', 'Mitte']);
  });
});
