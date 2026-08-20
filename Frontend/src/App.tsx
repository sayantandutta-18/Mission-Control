import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { socketService } from './services/socket';
import { api } from './services/api';
import { useMissionStore } from './store/useMissionStore';

import { AppLayout } from './components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Satellites from './pages/Satellites';
import GlobeView from './pages/GlobeView';
import TelemetryView from './pages/TelemetryView';
import AlertsView from './pages/AlertsView';

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      const { setSatellites, setAlerts } =
        useMissionStore.getState();

      // --------------------------------
      // 1. Load satellites
      // --------------------------------
      try {
        const satellites = await api.getSatellites();

        console.log(
          'Satellites loaded:',
          satellites.length
        );

        setSatellites(satellites);
      } catch (error) {
        console.error(
          'Failed to load satellites:',
          error
        );
      }

      // --------------------------------
      // 2. Load existing alerts
      // --------------------------------
      try {
        const alerts = await api.getAlerts();

        console.log(
          'Alerts loaded:',
          alerts.length
        );

        setAlerts(alerts);
      } catch (error) {
        console.error(
          'Failed to load alerts:',
          error
        );
      }

      // --------------------------------
      // 3. Connect Socket.IO
      // --------------------------------
      socketService.connect();
    };

    initializeApp();

    // Cleanup when App unmounts
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>

          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="satellites"
            element={<Satellites />}
          />

          <Route
            path="telemetry"
            element={<TelemetryView />}
          />

          <Route
            path="alerts"
            element={<AlertsView />}
          />

          <Route
            path="globe"
            element={<GlobeView />}
          />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;