import { create } from 'zustand';
import type { FilterState, PlannedRoute } from '../types';

interface AppState {
  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Selection
  selectedPlaceId: string | null;
  setSelectedPlace: (id: string | null) => void;

  // Route planner
  routeStopIds: string[];
  addRouteStop: (id: string) => void;
  removeRouteStop: (id: string) => void;
  reorderRouteStops: (ids: string[]) => void;
  clearRoute: () => void;
  startFromHome: boolean;
  setStartFromHome: (v: boolean) => void;
  plannedRoute: PlannedRoute | null;
  setPlannedRoute: (route: PlannedRoute | null) => void;
  isCalculating: boolean;
  setIsCalculating: (v: boolean) => void;

  // UI
  activeTab: 'orte' | 'route';
  setActiveTab: (tab: 'orte' | 'route') => void;
  detailPlaceId: string | null;
  setDetailPlaceId: (id: string | null) => void;
}

const defaultFilters: FilterState = {
  categories: [],
  stadtteile: [],
  seasons: [],
  priceMax: null,
  searchQuery: '',
  showExpired: false,
};

export const useAppStore = create<AppState>((set) => ({
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),

  selectedPlaceId: null,
  setSelectedPlace: (id) => set({ selectedPlaceId: id }),

  routeStopIds: [],
  addRouteStop: (id) =>
    set((state) => {
      if (state.routeStopIds.includes(id)) return state;
      return { routeStopIds: [...state.routeStopIds, id], plannedRoute: null };
    }),
  removeRouteStop: (id) =>
    set((state) => ({
      routeStopIds: state.routeStopIds.filter((s) => s !== id),
      plannedRoute: null,
    })),
  reorderRouteStops: (ids) => set({ routeStopIds: ids, plannedRoute: null }),
  clearRoute: () => set({ routeStopIds: [], plannedRoute: null }),
  startFromHome: true,
  setStartFromHome: (v) => set({ startFromHome: v, plannedRoute: null }),
  plannedRoute: null,
  setPlannedRoute: (route) => set({ plannedRoute: route }),
  isCalculating: false,
  setIsCalculating: (v) => set({ isCalculating: v }),

  activeTab: 'orte',
  setActiveTab: (tab) => set({ activeTab: tab }),
  detailPlaceId: null,
  setDetailPlaceId: (id) => set({ detailPlaceId: id }),
}));
