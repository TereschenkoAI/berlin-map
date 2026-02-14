import { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { Place } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants';
import PlacePopup from './PlacePopup';

function createIcon(color: string, label: string): L.DivIcon {
  const initial = label.charAt(0).toUpperCase();
  return L.divIcon({
    className: 'category-marker',
    html: `<div style="
      background: ${color};
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
    ">${initial}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Cache icons per category
const iconCache = new Map<string, L.DivIcon>();
function getIcon(categoryGroup: Place['categoryGroup']): L.DivIcon {
  if (!iconCache.has(categoryGroup)) {
    const color = CATEGORY_COLORS[categoryGroup] || '#708090';
    const label = CATEGORY_LABELS[categoryGroup] || 'X';
    iconCache.set(categoryGroup, createIcon(color, label));
  }
  return iconCache.get(categoryGroup)!;
}

interface Props {
  places: Place[];
}

function PlaceMarkers({ places }: Props) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={40}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
    >
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat!, place.lng!]}
          icon={getIcon(place.categoryGroup)}
        >
          <Popup maxWidth={320} minWidth={260}>
            <PlacePopup place={place} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

export default memo(PlaceMarkers);
