import { io, Socket } from 'socket.io-client';
import { useMissionStore } from '../store/useMissionStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      useMissionStore.getState().setConnectionStatus('live');
    });

    this.socket.on('disconnect', () => {
      useMissionStore.getState().setConnectionStatus('disconnected');
    });

    this.socket.on('telemetry', (telemetry) => {
      useMissionStore.getState().updateTelemetry(telemetry);
    });

    this.socket.on('alert', (alert) => {
      useMissionStore.getState().addAlert(alert);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
