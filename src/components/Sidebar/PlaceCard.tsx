import { memo } from 'react';
import type { Place } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS, HOME_LAT, HOME_LNG } from '../../constants';
import { haversineKm, formatDistance } from '../../utils/distance';
import { useAppStore } from '../../store/appStore';

interface Props {
  place: Place;
}

function PlaceCard({ place }: Props) {
  const setSelectedPlace = useAppStore((s) => s.setSelectedPlace);
  const setDetailPlaceId = useAppStore((s) => s.setDetailPlaceId);
  const addRouteStop = useAppStore((s) => s.addRouteStop);
  const removeRouteStop = useAppStore((s) => s.removeRouteStop);
  const routeStopIds = useAppStore((s) => s.routeStopIds);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const color = CATEGORY_COLORS[place.categoryGroup] || '#708090';
  const label = CATEGORY_LABELS[place.categoryGroup] || '';
  const dist =
    place.lat && place.lng
      ? formatDistance(haversineKm(HOME_LAT, HOME_LNG, place.lat, place.lng))
      : null;

  const isInRoute = routeStopIds.includes(place.id);

  return (
    <div
      className="place-card"
      onClick={() => {
        setSelectedPlace(place.id);
      }}
    >
      <div className="place-card-header">
        <span className="place-card-dot" style={{ background: color }} />
        <span className="place-card-name">{place.name}</span>
        <span className="place-card-badge" style={{ color }}>
          {label}
        </span>
      </div>

      <div className="place-card-address">
        {place.stadtteil && <span>{place.stadtteil}</span>}
        {dist && <span>📍 {dist}</span>}
        {place.preis && <span>{place.preis}</span>}
      </div>

      {place.besonderheit && (
        <div className="place-card-desc">{place.besonderheit}</div>
      )}

      {place.isExpired && <span className="expired-badge">Abgelaufen</span>}

      <div className="place-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn-small"
          onClick={() => setDetailPlaceId(place.id)}
        >
          Details
        </button>
        {place.lat && place.lng && (
          <button
            className={`btn-small ${isInRoute ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              if (isInRoute) {
                removeRouteStop(place.id);
              } else {
                addRouteStop(place.id);
                setActiveTab('route');
              }
            }}
          >
            {isInRoute ? 'Entfernen' : '+ Route'}
          </button>
        )}
        {place.instagram.length > 0 && (
          <a
            href={place.instagram[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-small btn-instagram"
          >
            IG
          </a>
        )}
      </div>
    </div>
  );
}

export default memo(PlaceCard);
