import type { Incident, Route, Stop, Stats, User, IncidentFormData } from './types';

const API_BASE = 'https://hackyeah-malopolska-task.vercel.app';

export const api = {
  // Incidents
  async getIncidents(status?: string): Promise<Incident[]> {
    const url = status ? `${API_BASE}/incidents?status=${status}` : `${API_BASE}/incidents`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },

  async getIncident(id: number): Promise<Incident> {
    const response = await fetch(`${API_BASE}/incidents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch incident');
    return response.json();
  },

  async createIncident(data: IncidentFormData & { reporter_id: number }): Promise<Incident> {
    const response = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        route_id: parseInt(data.route_id),
        stop_id: data.stop_id ? parseInt(data.stop_id) : null,
        delay_minutes: data.delay_minutes ? parseInt(data.delay_minutes) : null,
      }),
    });
    if (!response.ok) throw new Error('Failed to create incident');
    return response.json();
  },

  // Routes
  async getRoutes(): Promise<Route[]> {
    const response = await fetch(`${API_BASE}/routes`);
    if (!response.ok) throw new Error('Failed to fetch routes');
    return response.json();
  },

  // Stops
  async getStops(): Promise<Stop[]> {
    const response = await fetch(`${API_BASE}/stops`);
    if (!response.ok) throw new Error('Failed to fetch stops');
    return response.json();
  },

  // Stats
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Users
  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // Verifications
  async createVerification(incidentId: number, userId: number, isVerified: boolean): Promise<void> {
    const response = await fetch(`${API_BASE}/verifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: incidentId,
        user_id: userId,
        is_verified: isVerified,
        comment: null,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to verify incident');
    }
  },
};
