import SidebarPanel from '../Sidebar/SidebarPanel';
import PlaceDetail from '../Sidebar/PlaceDetail';
import MapView from '../Map/MapView';

export default function AppShell() {
  return (
    <div className="app-shell">
      <SidebarPanel />
      <div className="map-wrapper">
        <MapView />
      </div>
      <PlaceDetail />
    </div>
  );
}
