import { useAppStore } from '../../store/appStore';
import SearchInput from './SearchInput';
import FilterBar from './FilterBar';
import PlaceList from './PlaceList';
import RoutePlanner from '../Route/RoutePlanner';

export default function SidebarPanel() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const routeStopIds = useAppStore((s) => s.routeStopIds);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Berlin Aktivitaeten</h1>
        <p className="sidebar-subtitle">119 Orte auf der Karte</p>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'orte' ? 'active' : ''}`}
          onClick={() => setActiveTab('orte')}
        >
          Orte
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          Route{routeStopIds.length > 0 && ` (${routeStopIds.length})`}
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'orte' ? (
          <>
            <SearchInput />
            <FilterBar />
            <PlaceList />
          </>
        ) : (
          <RoutePlanner />
        )}
      </div>
    </div>
  );
}
