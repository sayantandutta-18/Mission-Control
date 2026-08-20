export interface Satellite {
  _id: string;
  name: string;
  noradId: number;
  tleLine1: string;
  tleLine2: string;
  status: 'healthy' | 'warning' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface Telemetry {
  _id?: string;
  satelliteId: string;
  battery: number;
  temperature: number;
  signal: number;
  attitude: number;
  createdAt?: string;
}

export interface Alert {
  _id: string;
  satelliteId: string;
  type: 'battery' | 'temperature' | 'signal' | 'attitude';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}
