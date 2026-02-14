import { PLACES } from '../../data/places';
import { CATEGORY_COLORS } from '../../constants';
import { HOME_LAT, HOME_LNG } from '../../constants';
import { haversineKm, formatDistance } from '../../utils/distance';
import { useAppStore } from '../../store/appStore';

export default function PlaceDetail() {
  const detailPlaceId = useAppStore((s) => s.detailPlaceId);
  const setDetailPlaceId = useAppStore((s) => s.setDetailPlaceId);
  const addRouteStop = useAppStore((s) => s.addRouteStop);
  const removeRouteStop = useAppStore((s) => s.removeRouteStop);
  const routeStopIds = useAppStore((s) => s.routeStopIds);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  if (!detailPlaceId) return null;

  const place = PLACES.find((p) => p.id === detailPlaceId);
  if (!place) return null;

  const color = CATEGORY_COLORS[place.categoryGroup] || '#708090';
  const dist =
    place.lat && place.lng
      ? formatDistance(haversineKm(HOME_LAT, HOME_LNG, place.lat, place.lng))
      : null;
  const isInRoute = routeStopIds.includes(place.id);

  return (
    <div className="detail-overlay" onClick={() => setDetailPlaceId(null)}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={() => setDetailPlaceId(null)}>
          ✕
        </button>

        <div className="detail-header">
          <span className="detail-dot" style={{ background: color }} />
          <h2>{place.name}</h2>
        </div>

        <div className="detail-category" style={{ color }}>
          {place.categoryGroup}
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-label">Adresse</span>
            <span>{place.address}</span>
          </div>
          {place.stadtteil && (
            <div className="detail-info-item">
              <span className="detail-label">Stadtteil</span>
              <span>{place.stadtteil}</span>
            </div>
          )}
          {dist && (
            <div className="detail-info-item">
              <span className="detail-label">Entfernung</span>
              <span>📍 {dist} von Zuhause</span>
            </div>
          )}
          {place.preis && (
            <div className="detail-info-item">
              <span className="detail-label">Preis</span>
              <span>{place.preis}</span>
            </div>
          )}
          {place.season && (
            <div className="detail-info-item">
              <span className="detail-label">Saison</span>
              <span>{place.season}</span>
            </div>
          )}
          {place.oeffnungszeiten && (
            <div className="detail-info-item">
              <span className="detail-label">Oeffnungszeiten</span>
              <span>{place.oeffnungszeiten}</span>
            </div>
          )}
        </div>

        {place.besonderheit && (
          <div className="detail-section">
            <h3>Besonderheit</h3>
            <p>{place.besonderheit}</p>
          </div>
        )}

        {place.beschreibung && (
          <div className="detail-section">
            <h3>Beschreibung</h3>
            <p>{place.beschreibung}</p>
          </div>
        )}

        {place.isExpired && (
          <div className="detail-expired">Dieses Event ist abgelaufen.</div>
        )}

        {/* Instagram Links */}
        {place.instagram.length > 0 && (
          <div className="detail-section">
            <h3>Instagram</h3>
            <div className="detail-instagram-links">
              {place.instagram.map((ig, i) => (
                <a
                  key={i}
                  href={ig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-instagram-detail"
                >
                  {ig.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          {place.lat && place.lng && (
            <button
              className={`btn-action ${isInRoute ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => {
                if (isInRoute) {
                  removeRouteStop(place.id);
                } else {
                  addRouteStop(place.id);
                  setActiveTab('route');
                }
              }}
            >
              {isInRoute ? 'Aus Route entfernen' : '+ Zur Route hinzufuegen'}
            </button>
          )}
          {place.lat && place.lng && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action btn-secondary"
            >
              Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
