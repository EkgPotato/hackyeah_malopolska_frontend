export type TransportType = 'train' | 'bus' | 'tram';
export type IncidentType = 'delay' | 'cancellation' | 'breakdown' | 'crowding' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'verified' | 'disputed' | 'resolved';

export interface Route {
  id: number;
  route_number: string;
  route_name: string;
  transport_type: TransportType;
  active_incidents?: number;
}

export interface Stop {
  id: number;
  stop_name: string;
  latitude: number;
  longitude: number;
  nearby_incidents?: number;
}

export interface User {
  id: number;
  username: string;
  points: number;
  created_at: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  incident_type: IncidentType;
  severity: Severity;
  status: Status;
  route_id: number;
  stop_id?: number;
  reporter_id: number;
  delay_minutes?: number;
  reported_at: string;
  resolved_at?: string;
  verification_count: number;
  dispute_count: number;
  route?: Route;
  stop?: Stop;
  reporter?: User;
}

export interface Stats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export interface IncidentFormData {
  title: string;
  description: string;
  incident_type: IncidentType;
  severity: Severity;
  route_id: string;
  stop_id: string;
  delay_minutes: string;
}