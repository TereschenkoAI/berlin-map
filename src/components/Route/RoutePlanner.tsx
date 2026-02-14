import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useAppStore } from '../../store/appStore';
import { PLACES } from '../../data/places';
import { HOME_LAT, HOME_LNG } from '../../constants';
import { getRoute } from '../../utils/osrm';
import type { PlannedRoute } from '../../types';
import RouteStopCard from './RouteStopCard';

export default function RoutePlanner() {
  const routeStopIds = useAppStore((s) => s.routeStopIds);
  const reorderRouteStops = useAppStore((s) => s.reorderRouteStops);
  const clearRoute = useAppStore((s) => s.clearRoute);
  const startFromHome = useAppStore((s) => s.startFromHome);
  const setStartFromHome = useAppStore((s) => s.setStartFromHome);
  const plannedRoute = useAppStore((s) => s.plannedRoute);
  const setPlannedRoute = useAppStore((s) => s.setPlannedRoute);
  const isCalculating = useAppStore((s) => s.isCalculating);
  const setIsCalculating = useAppStore((s) => s.setIsCalculating);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const stopPlaces = routeStopIds
    .map((id) => PLACES.find((p) => p.id === id))
    .filter((p) => p && p.lat !== null && p.lng !== null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = routeStopIds.indexOf(active.id as string);
    const newIndex = routeStopIds.indexOf(over.id as string);
    reorderRouteStops(arrayMove(routeStopIds, oldIndex, newIndex));
  };

  const calculateRoute = async () => {
    if (stopPlaces.length < 2) return;
    setIsCalculating(true);

    try {
      const points: [number, number][] = [];
      if (startFromHome) {
        points.push([HOME_LAT, HOME_LNG]);
      }
      for (const place of stopPlaces) {
        points.push([place!.lat!, place!.lng!]);
      }

      const result = await getRoute(points);

      // Build route stops with leg info
      const route: PlannedRoute = {
        stops: stopPlaces.map((place, i) => ({
          place: place!,
          orderIndex: i,
          travelFromPrevKm: null,
          travelFromPrevMin: null,
        })),
        totalDistanceKm: result.distanceKm,
        totalDurationMin: result.durationMin,
        geometry: result.geometry,
      };

      setPlannedRoute(route);
    } catch (err) {
      console.error('Route calculation failed:', err);
      alert('Route konnte nicht berechnet werden. Bitte versuche es erneut.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="route-planner">
      {/* Start from home toggle */}
      <label className="route-toggle">
        <input
          type="checkbox"
          checked={startFromHome}
          onChange={(e) => setStartFromHome(e.target.checked)}
        />
        Von Zuhause starten
      </label>

      {routeStopIds.length === 0 ? (
        <div className="route-empty">
          <p>Keine Stopps ausgewaehlt.</p>
          <p className="route-hint">
            Fuege Orte ueber den "Orte"-Tab oder die Karte zur Route hinzu.
          </p>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={routeStopIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="route-stops">
                {routeStopIds.map((id, index) => {
                  const place = PLACES.find((p) => p.id === id);
                  if (!place) return null;
                  const leg = plannedRoute?.stops[index];
                  return (
                    <RouteStopCard
                      key={id}
                      id={id}
                      place={place}
                      index={index}
                      travelMin={leg?.travelFromPrevMin ?? null}
                      travelKm={leg?.travelFromPrevKm ?? null}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {/* Route summary */}
          {plannedRoute && (
            <div className="route-summary">
              <div className="route-summary-row">
                <span>Gesamt</span>
                <span>
                  {plannedRoute.totalDistanceKm.toFixed(1)} km &middot;{' '}
                  {Math.round(plannedRoute.totalDurationMin)} Min.
                </span>
              </div>
              <div className="route-summary-row">
                <span>Stopps</span>
                <span>{stopPlaces.length}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="route-actions">
            <button
              className="btn-action btn-primary"
              onClick={calculateRoute}
              disabled={stopPlaces.length < 2 || isCalculating}
            >
              {isCalculating ? 'Berechne...' : 'Route berechnen'}
            </button>
            <button className="btn-action btn-secondary" onClick={clearRoute}>
              Route loeschen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
