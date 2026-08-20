import { create } from 'zustand';
import { Satellite, Telemetry, Alert } from '../types';

interface MissionState {
  connectionStatus: 'live' | 'disconnected';
  satellites: Record<string, Satellite>;
  liveTelemetry: Record<string, Telemetry>;
  alerts: Alert[];
  
  setConnectionStatus: (status: 'live' | 'disconnected') => void;
  setSatellites: (satellites: Satellite[]) => void;
  updateTelemetry: (telemetry: Telemetry) => void;
  addAlert: (alert: Alert) => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  connectionStatus: 'disconnected',
  satellites: {},
  liveTelemetry: {},
  alerts: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  setSatellites: (satellites) => set(() => {
    const satMap: Record<string, Satellite> = {};
    satellites.forEach(s => {
      satMap[s._id] = s;
    });
    return { satellites: satMap };
  }),

  updateTelemetry: (telemetry) => set((state) => ({
    liveTelemetry: {
      ...state.liveTelemetry,
      [telemetry.satelliteId]: telemetry
    }
  })),

  addAlert: (alert) => set((state) => {
    // Also update satellite status if alert is warning/critical
    const newSatellites = { ...state.satellites };
    const targetSat = newSatellites[alert.satelliteId];
    
    if (targetSat) {
      if (alert.severity === 'critical') {
        targetSat.status = 'critical';
      } else if (alert.severity === 'warning' && targetSat.status !== 'critical') {
        targetSat.status = 'warning';
      }
    }

    return {
      alerts: [alert, ...state.alerts],
      satellites: newSatellites
    };
  }),

  setAlerts: (alerts) => set({ alerts }),
}));
