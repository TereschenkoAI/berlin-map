import type { CategoryGroup } from '../types';

export const HOME_LAT = 52.4985;
export const HOME_LNG = 13.3110;
export const HOME_ADDRESS = 'Heilbronner Straße 5, 10711 Berlin';

export const MAP_DEFAULT_CENTER: [number, number] = [52.52, 13.38];
export const MAP_DEFAULT_ZOOM = 11;

export const CATEGORY_COLORS: Record<CategoryGroup, string> = {
  'Cafes & Baeckereien': '#8B4513',
  'Asiatische Restaurants': '#DC143C',
  'Asia-Supermaerkte & Shops': '#FF6347',
  'Europaeische & Deutsche Restaurants': '#228B22',
  'Internationale Restaurants': '#FF8C00',
  'Spas, Saunas & Thermen': '#4169E1',
  'Eislaufen & Winter': '#00CED1',
  'Weihnachtsmaerkte & Valentinstag': '#B22222',
  'Outdoor & Natur': '#32CD32',
  'Tagesausfluege & Brandenburg': '#9370DB',
  'Museen, Kultur & Entertainment': '#DAA520',
  'Bars, Shopping & Sonstiges': '#708090',
};

export const CATEGORY_LABELS: Record<CategoryGroup, string> = {
  'Cafes & Baeckereien': 'Cafes',
  'Asiatische Restaurants': 'Asiatisch',
  'Asia-Supermaerkte & Shops': 'Asia-Shops',
  'Europaeische & Deutsche Restaurants': 'Europaeisch',
  'Internationale Restaurants': 'International',
  'Spas, Saunas & Thermen': 'Spas',
  'Eislaufen & Winter': 'Winter',
  'Weihnachtsmaerkte & Valentinstag': 'Weihnachten',
  'Outdoor & Natur': 'Outdoor',
  'Tagesausfluege & Brandenburg': 'Ausfluege',
  'Museen, Kultur & Entertainment': 'Kultur',
  'Bars, Shopping & Sonstiges': 'Sonstiges',
};

export const ALL_CATEGORIES: CategoryGroup[] = Object.keys(CATEGORY_COLORS) as CategoryGroup[];
