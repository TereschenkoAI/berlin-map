export type CategoryGroup =
  | 'Cafes & Baeckereien'
  | 'Asiatische Restaurants'
  | 'Asia-Supermaerkte & Shops'
  | 'Europaeische & Deutsche Restaurants'
  | 'Internationale Restaurants'
  | 'Spas, Saunas & Thermen'
  | 'Eislaufen & Winter'
  | 'Weihnachtsmaerkte & Valentinstag'
  | 'Outdoor & Natur'
  | 'Tagesausfluege & Brandenburg'
  | 'Museen, Kultur & Entertainment'
  | 'Bars, Shopping & Sonstiges';

export interface InstagramLink {
  label: string;
  url: string;
}

export interface Place {
  id: string;
  name: string;
  categoryGroup: CategoryGroup;
  address: string;
  lat: number | null;
  lng: number | null;
  stadtteil: string;
  season: string;
  preis: string;
  preisMin: number | null;
  preisMax: number | null;
  instagram: InstagramLink[];
  besonderheit: string;
  oeffnungszeiten: string | null;
  beschreibung: string | null;
  isExpired: boolean;
}

export interface PlaceWithDistance extends Place {
  straightLineKm: number;
}

export interface RouteStop {
  place: Place;
  orderIndex: number;
  travelFromPrevKm: number | null;
  travelFromPrevMin: number | null;
}

export interface PlannedRoute {
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDurationMin: number;
  geometry: [number, number][];
}

export interface FilterState {
  categories: CategoryGroup[];
  stadtteile: string[];
  seasons: string[];
  priceMax: number | null;
  searchQuery: string;
  showExpired: boolean;
}
