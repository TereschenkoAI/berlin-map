import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Place } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { useAppStore } from '../../store/appStore';

interface Props {
  id: string;
  place: Place;
  index: number;
  travelMin: number | null;
  travelKm: number | null;
}

export default function RouteStopCard({ id, place, index, travelMin, travelKm }: Props) {
  const removeRouteStop = useAppStore((s) => s.removeRouteStop);
  const setSelectedPlace = useAppStore((s) => s.setSelectedPlace);
  const color = CATEGORY_COLORS[place.categoryGroup] || '#708090';

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="route-stop-card">
      {/* Drag handle */}
      <div className="route-stop-handle" {...attributes} {...listeners}>
        ☰
      </div>

      <div className="route-stop-index">{index + 1}</div>

      <div className="route-stop-info" onClick={() => setSelectedPlace(place.id)}>
        <span className="route-stop-dot" style={{ background: color }} />
        <div>
          <div className="route-stop-name">{place.name}</div>
          <div className="route-stop-address">{place.stadtteil || place.address}</div>
        </div>
      </div>

      <button
        className="route-stop-remove"
        onClick={() => removeRouteStop(id)}
        title="Entfernen"
      >
        ✕
      </button>

      {travelMin !== null && (
        <div className="route-stop-travel">
          ↓ {travelKm?.toFixed(1)} km &middot; {Math.round(travelMin)} Min.
        </div>
      )}
    </div>
  );
}
