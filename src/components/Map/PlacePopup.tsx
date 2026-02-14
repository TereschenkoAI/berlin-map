import type { Place } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { HOME_LAT, HOME_LNG } from '../../constants';
import { haversineKm, formatDistance } from '../../utils/distance';
import { useAppStore } from '../../store/appStore';

interface Props {
  place: Place;
}

export default function PlacePopup({ place }: Props) {
  const addRouteStop = useAppStore((s) => s.addRouteStop);
  const routeStopIds = useAppStore((s) => s.routeStopIds);
  const removeRouteStop = useAppStore((s) => s.removeRouteStop);
  const setDetailPlaceId = useAppStore((s) => s.setDetailPlaceId);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const dist =
    place.lat && place.lng
      ? formatDistance(haversineKm(HOME_LAT, HOME_LNG, place.lat, place.lng))
      : null;

  const isInRoute = routeStopIds.includes(place.id);
  const color = CATEGORY_COLORS[place.categoryGroup] || '#708090';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', lineHeight: 1.4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span
          style={{
            background: color,
            width: 10,
            height: 10,
            borderRadius: '50%',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <strong style={{ fontSize: '14px' }}>{place.name}</strong>
      </div>
      <div style={{ color: '#666', marginBottom: 4 }}>
        {place.address}
        {place.stadtteil && ` (${place.stadtteil})`}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: '12px' }}>
        {place.preis && <span>{place.preis}</span>}
        {dist && <span>📍 {dist}</span>}
      </div>
      {place.besonderheit && (
        <div style={{ color: '#444', marginBottom: 8, fontSize: '12px' }}>
          {place.besonderheit}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          onClick={() => setDetailPlaceId(place.id)}
          style={{
            padding: '4px 10px',
            fontSize: '12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            background: '#f8f8f8',
            cursor: 'pointer',
          }}
        >
          Details
        </button>
        {place.lat && place.lng && (
          <button
            onClick={() => {
              if (isInRoute) {
                removeRouteStop(place.id);
              } else {
                addRouteStop(place.id);
                setActiveTab('route');
              }
            }}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: 'none',
              borderRadius: 4,
              background: isInRoute ? '#ef4444' : '#2563eb',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {isInRoute ? 'Aus Route' : '+ Zur Route'}
          </button>
        )}
        {place.instagram.length > 0 && (
          <a
            href={place.instagram[0].url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: '1px solid #E1306C',
              borderRadius: 4,
              color: '#E1306C',
              textDecoration: 'none',
            }}
          >
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}
