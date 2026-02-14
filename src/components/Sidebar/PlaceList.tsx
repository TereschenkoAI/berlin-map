import { useMemo } from 'react';
import { PLACES } from '../../data/places';
import { filterPlaces } from '../../utils/filterPlaces';
import { haversineKm } from '../../utils/distance';
import { HOME_LAT, HOME_LNG } from '../../constants';
import { useAppStore } from '../../store/appStore';
import PlaceCard from './PlaceCard';

export default function PlaceList() {
  const filters = useAppStore((s) => s.filters);

  const sortedPlaces = useMemo(() => {
    const filtered = filterPlaces(PLACES, filters);
    return filtered.sort((a, b) => {
      const distA =
        a.lat && a.lng ? haversineKm(HOME_LAT, HOME_LNG, a.lat, a.lng) : Infinity;
      const distB =
        b.lat && b.lng ? haversineKm(HOME_LAT, HOME_LNG, b.lat, b.lng) : Infinity;
      return distA - distB;
    });
  }, [filters]);

  return (
    <div className="place-list">
      <div className="place-list-count">{sortedPlaces.length} Orte</div>
      {sortedPlaces.length === 0 ? (
        <div className="no-results">Keine Ergebnisse gefunden</div>
      ) : (
        sortedPlaces.map((place) => <PlaceCard key={place.id} place={place} />)
      )}
    </div>
  );
}
