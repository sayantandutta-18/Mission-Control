import axios from 'axios';
import { Satellite, Telemetry, Alert } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Satellites
  getSatellites: async () => {
    const response = await apiClient.get<{ success: boolean; data: Satellite[] }>('/satellites');
    return response.data.data;
  },
  getSatelliteById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Satellite }>(`/satellites/${id}`);
    return response.data.data;
  },

  // Telemetry
  getTelemetryBySatellite: async (satelliteId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Telemetry[] }>(`/telemetry/${satelliteId}`);
    return response.data.data;
  },

  // Alerts
  getAlerts: async () => {
    const response = await apiClient.get<{ success: boolean; data: Alert[] }>('/alerts');
    return response.data.data;
  },
  getAlertsBySatellite: async (satelliteId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Alert[] }>(`/alerts/${satelliteId}`);
    return response.data.data;
  },

  // AI Chat
  sendChatMessage: async (message: string, history: any[]) => {
    const response = await apiClient.post<{ success: boolean; response: string }>('/chat', { message, history });
    return response.data.response;
  }
};
