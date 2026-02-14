const OSRM_BASE = 'https://router.project-osrm.org';

export interface OsrmRouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [lat, lng] pairs
}

export interface OsrmTripResult {
  legs: { distanceKm: number; durationMin: number }[];
  totalDistanceKm: number;
  totalDurationMin: number;
  geometry: [number, number][];
  waypointOrder: number[];
}

/** Get route between multiple points via OSRM */
export async function getRoute(
  points: [number, number][], // [lat, lng] pairs
  profile: 'foot' | 'car' = 'car'
): Promise<OsrmRouteResult> {
  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const profileName = profile === 'foot' ? 'foot' : 'driving';
  const url = `${OSRM_BASE}/route/v1/${profileName}/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(`OSRM: ${data.code || 'no routes found'}`);
  }

  const route = data.routes[0];
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    geometry: route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    ),
  };
}

/** Get optimized multi-stop trip via OSRM (solves TSP) */
export async function getOptimizedTrip(
  points: [number, number][], // [lat, lng] pairs
  profile: 'foot' | 'car' = 'car'
): Promise<OsrmTripResult> {
  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const profileName = profile === 'foot' ? 'foot' : 'driving';
  const url = `${OSRM_BASE}/trip/v1/${profileName}/${coords}?overview=full&geometries=geojson&source=first&roundtrip=false&destination=last`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM trip error: ${res.status}`);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.trips?.length) {
    throw new Error(`OSRM trip: ${data.code || 'no trips found'}`);
  }

  const trip = data.trips[0];
  return {
    legs: trip.legs.map((leg: { distance: number; duration: number }) => ({
      distanceKm: leg.distance / 1000,
      durationMin: leg.duration / 60,
    })),
    totalDistanceKm: trip.distance / 1000,
    totalDurationMin: trip.duration / 60,
    geometry: trip.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    ),
    waypointOrder: data.waypoints.map((wp: { waypoint_index: number }) => wp.waypoint_index),
  };
}
