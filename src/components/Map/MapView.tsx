import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useMemo, useEffect } from 'react';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants';
import { PLACES } from '../../data/places';
import { filterPlaces } from '../../utils/filterPlaces';
import { useAppStore } from '../../store/appStore';
import PlaceMarkers from './PlaceMarkers';
import HomeMarker from './HomeMarker';
import RouteLayer from './RouteLayer';
import 'leaflet/dist/leaflet.css';

function FlyToSelected() {
  const map = useMap();
  const selectedPlaceId = useAppStore((s) => s.selectedPlaceId);

  useEffect(() => {
    if (!selectedPlaceId) return;
    const place = PLACES.find((p) => p.id === selectedPlaceId);
    if (place?.lat && place?.lng) {
      map.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }
  }, [selectedPlaceId, map]);

  return null;
}

export default function MapView() {
  const filters = useAppStore((s) => s.filters);
  const filteredPlaces = useMemo(
    () => filterPlaces(PLACES, filters).filter((p) => p.lat !== null && p.lng !== null),
    [filters]
  );

  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      className="map-container"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HomeMarker />
      <PlaceMarkers places={filteredPlaces} />
      <RouteLayer />
      <FlyToSelected />
    </MapContainer>
  );
}
