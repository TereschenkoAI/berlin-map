import { Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../store/appStore';

function createStopIcon(index: number): L.DivIcon {
  return L.divIcon({
    className: 'route-stop-marker',
    html: `<div style="
      background: #2563EB;
      width: 24px; height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">${index + 1}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function RouteLayer() {
  const plannedRoute = useAppStore((s) => s.plannedRoute);

  if (!plannedRoute) return null;

  return (
    <>
      <Polyline
        positions={plannedRoute.geometry}
        pathOptions={{
          color: '#2563EB',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 6',
        }}
      />
      {plannedRoute.stops.map((stop, i) => {
        if (!stop.place.lat || !stop.place.lng) return null;
        return (
          <Marker
            key={`route-stop-${stop.place.id}`}
            position={[stop.place.lat, stop.place.lng]}
            icon={createStopIcon(i)}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              {i + 1}. {stop.place.name}
              {stop.travelFromPrevMin != null && (
                <> — {Math.round(stop.travelFromPrevMin)} Min.</>
              )}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
