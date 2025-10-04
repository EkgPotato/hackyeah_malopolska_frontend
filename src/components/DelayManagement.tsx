"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Clock, TrendingUp, CheckCircle, XCircle, Plus, Search, Train, Bus, Zap, Navigation } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface User {
  id: number;
  username: string;
  points: number;
  created_at: string;
}

interface Route {
  id: number;
  route_number: string;
  route_name: string;
  transport_type: string;
  active_incidents: number;
}

interface Stop {
  id: number;
  stop_name: string;
  latitude: number;
  longitude: number;
  nearby_incidents: number;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  incident_type: string;
  severity: string;
  status: string;
  route_id: number;
  stop_id: number | null;
  reporter_id: number;
  delay_minutes: number | null;
  reported_at: string;
  resolved_at: string | null;
  verification_count: number;
  dispute_count: number;
  route?: Route;
  stop?: Stop;
  reporter?: User;
}

interface Stats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

// Cracow coordinates
const CRACOW_CENTER = { lat: 50.0647, lng: 19.9450 };
const MAP_BOUNDS = {
  minLat: 50.010,
  maxLat: 50.110,
  minLng: 19.850,
  maxLng: 20.050
};

export default function DelayManagement() {
  const [activeTab, setActiveTab] = useState<'map' | 'incidents' | 'report' | 'routes'>('map');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [currentUser] = useState<User>({ id: 1, username: 'john_traveler', points: 150, created_at: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [hoveredIncident, setHoveredIncident] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: 'delay',
    severity: 'medium',
    route_id: '',
    stop_id: '',
    delay_minutes: ''
  });

  useEffect(() => {
    void fetchIncidents();
    void fetchRoutes();
    void fetchStops();
    void fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'incidents') {
      void fetchIncidents(filterStatus);
    }
  }, [filterStatus, activeTab]);

  const fetchIncidents = async (status?: string) => {
    try {
      const url = status ? `${API_BASE_URL}/incidents?status=${status}` : `${API_BASE_URL}/incidents`;
      const response = await fetch(url);
      const data = await response.json() as Incident[];
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`);
      const data = await response.json() as Route[];
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchStops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stops`);
      const data = await response.json() as Stop[];
      setStops(data);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json() as Stats;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerifyIncident = async (incidentId: number, isVerified: boolean) => {
    try {
      await fetch(`${API_BASE_URL}/verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          user_id: currentUser.id,
          is_verified: isVerified,
          comment: isVerified ? 'Confirmed from my location' : 'Cannot confirm'
        })
      });
      void fetchIncidents();
      void fetchStats();
    } catch (error) {
      console.error('Error verifying incident:', error);
    }
  };

  const handleSubmitIncident = async () => {
    setLoading(true);

    try {
      await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reporter_id: currentUser.id,
          route_id: parseInt(formData.route_id),
          stop_id: formData.stop_id ? parseInt(formData.stop_id) : null,
          delay_minutes: formData.delay_minutes ? parseInt(formData.delay_minutes) : null
        })
      });

      setFormData({
        title: '',
        description: '',
        incident_type: 'delay',
        severity: 'medium',
        route_id: '',
        stop_id: '',
        delay_minutes: ''
      });

      void fetchIncidents();
      void fetchStats();
      setActiveTab('incidents');
    } catch (error) {
      console.error('Error reporting incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityDotColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#2563eb';
      default: return '#6b7280';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'train': return <Train className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      case 'tram': return <Zap className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Convert lat/lng to pixel coordinates for the map
  const latLngToPixel = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * width;
    const y = height - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
    return { x, y };
  };

  // Generate random coordinates within Cracow bounds
  const getRandomCracowLocation = (seed: number) => {
    // Use seed for consistent random positions
    const random1 = Math.sin(seed * 12.9898) * 43758.5453;
    const random2 = Math.sin(seed * 78.233) * 43758.5453;

    const lat = MAP_BOUNDS.minLat + (random1 - Math.floor(random1)) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    const lng = MAP_BOUNDS.minLng + (random2 - Math.floor(random2)) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);

    return { lat, lng };
  };

  const MapView = () => {
    const [mapDimensions, setMapDimensions] = useState({ width: 800, height: 600 });
    const activeIncidents = incidents.filter(inc => inc.status === 'active');

    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Cracow, Poland - Live Incident Map</h2>
            </div>
            <div className="text-sm text-gray-600">
              {activeIncidents.length} active incidents
            </div>
          </div>

          {/* Map Container */}
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300 bg-gradient-to-br from-green-50 to-blue-50">
            <svg
              viewBox="0 0 800 600"
              className="h-auto w-full"
              style={{ maxHeight: '600px' }}
              onLoad={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMapDimensions({ width: rect.width, height: rect.height });
              }}
            >
              {/* Background - Simplified Cracow Map */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>

              <rect width="800" height="600" fill="url(#grid)" />

              {/* Vistula River (simplified) */}
              <path
                d="M 450 0 Q 480 150 460 300 Q 440 450 470 600"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="25"
                opacity="0.4"
              />

              {/* Main Market Square area */}
              <rect x="350" y="250" width="80" height="80" fill="#fbbf24" opacity="0.3" rx="4" />
              <text x="390" y="295" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="bold">
                Main Market
              </text>

              {/* Wawel Castle area */}
              <circle cx="320" cy="380" r="30" fill="#dc2626" opacity="0.2" />
              <text x="320" y="385" fontSize="9" fill="#7f1d1d" textAnchor="middle" fontWeight="bold">
                Wawel
              </text>

              {/* Kazimierz district */}
              <rect x="420" y="370" width="70" height="60" fill="#8b5cf6" opacity="0.2" rx="4" />
              <text x="455" y="405" fontSize="9" fill="#5b21b6" textAnchor="middle" fontWeight="bold">
                Kazimierz
              </text>

              {/* Major streets */}
              <line x1="100" y1="290" x2="700" y2="290" stroke="#9ca3af" strokeWidth="3" opacity="0.5" />
              <line x1="390" y1="100" x2="390" y2="500" stroke="#9ca3af" strokeWidth="3" opacity="0.5" />

              {/* Railway lines */}
              <line x1="200" y1="150" x2="600" y2="150" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" opacity="0.4" />
              <line x1="250" y1="450" x2="550" y2="450" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" opacity="0.4" />

              {/* Incident markers */}
              {activeIncidents.map((incident, index) => {
                const location = getRandomCracowLocation(incident.id);
                const pos = latLngToPixel(location.lat, location.lng, 800, 600);
                const color = getSeverityDotColor(incident.severity);
                const isHovered = hoveredIncident === incident.id;
                const size = isHovered ? 20 : 14;

                return (
                  <g key={incident.id}>
                    {/* Pulsing circle for critical incidents */}
                    {incident.severity === 'critical' && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={size + 8}
                        fill={color}
                        opacity="0.2"
                        className="animate-ping"
                      />
                    )}

                    {/* Main marker */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size}
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      opacity={isHovered ? 1 : 0.8}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={() => setHoveredIncident(incident.id)}
                      onMouseLeave={() => setHoveredIncident(null)}
                      onClick={() => setSelectedIncident(incident)}
                    />

                    {/* Icon in marker */}
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      fontSize="10"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      !
                    </text>

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={pos.x - 100}
                          y={pos.y - 60}
                          width="200"
                          height="50"
                          fill="white"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                          rx="4"
                          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                        />
                        <text
                          x={pos.x}
                          y={pos.y - 38}
                          fontSize="11"
                          fill="#111827"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {incident.title.substring(0, 30)}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y - 25}
                          fontSize="9"
                          fill="#6b7280"
                          textAnchor="middle"
                        >
                          {incident.incident_type} • {incident.severity}
                        </text>
                        <text
                          x={pos.x}
                          y={pos.y - 13}
                          fontSize="8"
                          fill="#9ca3af"
                          textAnchor="middle"
                        >
                          {formatTimeAgo(incident.reported_at)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Legend:</div>
            {[
              { severity: 'critical', label: 'Critical' },
              { severity: 'high', label: 'High' },
              { severity: 'medium', label: 'Medium' },
              { severity: 'low', label: 'Low' }
            ].map(({ severity, label }) => (
              <div key={severity} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: getSeverityDotColor(severity) }}
                />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incident List Below Map */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {activeIncidents.slice(0, 6).map((incident) => (
            <div
              key={incident.id}
              className={`cursor-pointer rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg ${
                hoveredIncident === incident.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setHoveredIncident(incident.id)}
              onMouseLeave={() => setHoveredIncident(null)}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="mb-2 flex items-start justify-between">
                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-xs text-gray-500">{formatTimeAgo(incident.reported_at)}</span>
              </div>
              <h3 className="mb-1 font-semibold">{incident.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{incident.description}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3 w-3" />
                <span>{incident.verification_count} verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const IncidentsView = () => {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-4 shadow-md">
          <div className="flex gap-2">
            {['active', 'verified', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(incident.reported_at)}</span>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{incident.title}</h3>
                  <p className="mb-3 text-sm text-gray-600">{incident.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{incident.delay_minutes ? `${incident.delay_minutes} min delay` : 'No delay info'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{incident.verification_count} verified</span>
                    </div>
                    {incident.dispute_count > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span>{incident.dispute_count} disputed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => void handleVerifyIncident(incident.id, true)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => void handleVerifyIncident(incident.id, false)}
                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    Dispute
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ReportForm = () => {
    const canSubmit = formData.title.length >= 5 && formData.description.length >= 10 && formData.route_id;

    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold">Report New Incident</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-24 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of what happened"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Incident Type</label>
              <select
                value={formData.incident_type}
                onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="delay">Delay</option>
                <option value="cancellation">Cancellation</option>
                <option value="breakdown">Breakdown</option>
                <option value="crowding">Crowding</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Route</label>
              <select
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_number} - {route.route_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Stop (Optional)</label>
              <select
                value={formData.stop_id}
                onChange={(e) => setFormData({ ...formData, stop_id: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a stop</option>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.stop_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Delay (minutes, optional)</label>
            <input
              type="number"
              min="0"
              value={formData.delay_minutes}
              onChange={(e) => setFormData({ ...formData, delay_minutes: e.target.value })}
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Estimated delay in minutes"
            />
          </div>

          <button
            onClick={() => void handleSubmitIncident()}
            disabled={loading || !canSubmit}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Report Incident (+10 points)'}
          </button>
        </div>
      </div>
    );
  };

  const RoutesView = () => {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <div key={route.id} className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTransportIcon(route.transport_type)}
                <div>
                  <h3 className="text-lg font-bold">{route.route_number}</h3>
                  <p className="text-sm text-gray-600">{route.route_name}</p>
                </div>
              </div>
              {route.active_incidents > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  {route.active_incidents} active
                </span>
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                route.transport_type === 'train' ? 'bg-blue-100 text-blue-800' :
                route.transport_type === 'bus' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {route.transport_type}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Delay Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-90">{currentUser.username}</p>
                <p className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  {currentUser.points} points
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {stats && (
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.active_incidents}</p>
                <p className="text-xs text-gray-600">Active Incidents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.resolved_incidents}</p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{routes.length}</p>
                <p className="text-xs text-gray-600">Routes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stops.length}</p>
                <p className="text-xs text-gray-600">Stops</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'map' as const, label: 'Map View', icon: MapPin },
              { id: 'incidents' as const, label: 'Incidents', icon: AlertCircle },
              { id: 'routes' as const, label: 'Routes', icon: Train },
              { id: 'report' as const, label: 'Report', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'map' && <MapView />}
        {activeTab === 'incidents' && <IncidentsView />}
        {activeTab === 'report' && <ReportForm />}
        {activeTab === 'routes' && <RoutesView />}
      </main>

      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedIncident(null)}>
          <div className="w-full max-w-2xl rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4 text-gray-600">{selectedIncident.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {selectedIncident.incident_type}
              </div>
              <div>
                <span className="font-medium">Severity:</span> {selectedIncident.severity}
              </div>
              <div>
                <span className="font-medium">Status:</span> {selectedIncident.status}
              </div>
              <div>
                <span className="font-medium">Reported:</span> {formatTimeAgo(selectedIncident.reported_at)}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  void handleVerifyIncident(selectedIncident.id, true);
                  setSelectedIncident(null);
                }}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Verify Incident
              </button>
              <button
                onClick={() => {
                  void handleVerifyIncident(selectedIncident.id, false);
                  setSelectedIncident(null);
                }}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}