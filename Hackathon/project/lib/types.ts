export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'investigating' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  tags: string[];
}

export interface Sensor {
  id: string;
  name: string;
  type: 'air_quality' | 'traffic' | 'noise' | 'water' | 'weather';
  status: 'online' | 'offline' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  metrics: {
    timestamp: string;
    value: number;
  }[];
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  streamUrl: string;
  lastSnapshot?: string;
  recordingEnabled: boolean;
}

export interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  avatar?: string;
}
