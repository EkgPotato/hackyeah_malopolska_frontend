import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Clock, TrendingUp, CheckCircle, XCircle, Plus, Search, Train, Bus, Zap } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [incidents, setIncidents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentUser] = useState({ id: 1, username: 'john_traveler', points: 150, created_at: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
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
    fetchIncidents();
    fetchRoutes();
    fetchStops();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'incidents') {
      fetchIncidents(filterStatus);
    }
  }, [filterStatus, activeTab]);

  const fetchIncidents = async (status) => {
    try {
      const url = status ? `${API_BASE_URL}/incidents?status=${status}` : `${API_BASE_URL}/incidents`;
      const response = await fetch(url);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/routes`);
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchStops = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stops`);
      const data = await response.json();
      setStops(data);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerifyIncident = async (incidentId, isVerified) => {
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
      fetchIncidents();
      fetchStats();
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

      fetchIncidents();
      fetchStats();
      setActiveTab('incidents');
    } catch (error) {
      console.error('Error reporting incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'train': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'tram': return <Zap className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const MapView = () => {
    const filteredStops = stops.filter(stop =>
      stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stops or routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStops.map((stop) => (
            <div key={stop.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">{stop.stop_name}</h3>
                </div>
                {stop.nearby_incidents > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {stop.nearby_incidents} active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
              </p>
              <div className="mt-3">
                {incidents
                  .filter(inc => inc.stop_id === stop.id && inc.status === 'active')
                  .slice(0, 2)
                  .map((incident) => (
                    <div key={incident.id} className="text-xs bg-red-50 p-2 rounded mt-1 cursor-pointer hover:bg-red-100"
                      onClick={() => setSelectedIncident(incident)}>
                      <span className="font-medium">{incident.title}</span>
                    </div>
                  ))}
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
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            {['active', 'verified', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
            <div key={incident.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(incident.reported_at)}</span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{incident.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{incident.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{incident.delay_minutes ? `${incident.delay_minutes} min delay` : 'No delay info'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{incident.verification_count} verified</span>
                    </div>
                    {incident.dispute_count > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>{incident.dispute_count} disputed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleVerifyIncident(incident.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerifyIncident(incident.id, false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
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
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Report New Incident</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Detailed description of what happened"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Incident Type</label>
              <select
                value={formData.incident_type}
                onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="delay">Delay</option>
                <option value="cancellation">Cancellation</option>
                <option value="breakdown">Breakdown</option>
                <option value="crowding">Crowding</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium mb-2">Route</label>
              <select
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium mb-2">Stop (Optional)</label>
              <select
                value={formData.stop_id}
                onChange={(e) => setFormData({ ...formData, stop_id: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium mb-2">Delay (minutes, optional)</label>
            <input
              type="number"
              min="0"
              value={formData.delay_minutes}
              onChange={(e) => setFormData({ ...formData, delay_minutes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Estimated delay in minutes"
            />
          </div>

          <button
            onClick={handleSubmitIncident}
            disabled={loading || !canSubmit}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Report Incident (+10 points)'}
          </button>
        </div>
      </div>
    );
  };

  const RoutesView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTransportIcon(route.transport_type)}
                <div>
                  <h3 className="font-bold text-lg">{route.route_number}</h3>
                  <p className="text-sm text-gray-600">{route.route_name}</p>
                </div>
              </div>
              {route.active_incidents > 0 && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {route.active_incidents} active
                </span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
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
              <AlertCircle className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Delay Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-90">{currentUser.username}</p>
                <p className="text-xs flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {currentUser.points} points
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {stats && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'map', label: 'Map View', icon: MapPin },
              { id: 'incidents', label: 'Incidents', icon: AlertCircle },
              { id: 'routes', label: 'Routes', icon: Train },
              { id: 'report', label: 'Report', icon: Plus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIncident(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedIncident.title}</h2>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">{selectedIncident.description}</p>
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
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  handleVerifyIncident(selectedIncident.id, true);
                  setSelectedIncident(null);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Verify Incident
              </button>
              <button
                onClick={() => {
                  handleVerifyIncident(selectedIncident.id, false);
                  setSelectedIncident(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;