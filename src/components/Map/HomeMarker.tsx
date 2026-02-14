import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { HOME_LAT, HOME_LNG } from '../../constants';

const homeIcon = L.divIcon({
  className: 'home-marker',
  html: `<div style="
    background: #2563EB;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  ">&#127968;</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function HomeMarker() {
  return (
    <Marker position={[HOME_LAT, HOME_LNG]} icon={homeIcon}>
      <Tooltip permanent direction="top" offset={[0, -20]}>
        Zuhause
      </Tooltip>
    </Marker>
  );
}
