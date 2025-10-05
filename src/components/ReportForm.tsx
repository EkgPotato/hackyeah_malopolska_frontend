'use client';

import { useState } from 'react';
import type { Route, Stop, IncidentFormData, IncidentType, Severity } from '~/lib/types';

interface ReportFormProps {
  routes: Route[];
  stops: Stop[];
  onSubmit: (data: IncidentFormData) => Promise<void>;
}

export function ReportForm({ routes, stops, onSubmit }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IncidentFormData>({
    title: '',
    description: '',
    incident_type: 'delay',
    severity: 'medium',
    route_id: '',
    stop_id: '',
    delay_minutes: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || formData.title.length < 5) {
      alert('Title must be at least 5 characters');
      return;
    }
    if (!formData.description || formData.description.length < 10) {
      alert('Description must be at least 10 characters');
      return;
    }
    if (!formData.route_id) {
      alert('Please select a route');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        incident_type: 'delay',
        severity: 'medium',
        route_id: '',
        stop_id: '',
        delay_minutes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the incident"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Detailed description of what happened"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type *</label>
          <select
            value={formData.incident_type}
            onChange={(e) =>
              setFormData({ ...formData, incident_type: e.target.value as IncidentType })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="delay">Delay</option>
            <option value="cancellation">Cancellation</option>
            <option value="breakdown">Breakdown</option>
            <option value="crowding">Crowding</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as Severity })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
          <select
            value={formData.route_id}
            onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.route_number} - {route.route_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stop (Optional)
          </label>
          <select
            value={formData.stop_id}
            onChange={(e) => setFormData({ ...formData, stop_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select stop</option>
            {stops.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.stop_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formData.incident_type === 'delay' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delay (minutes)
          </label>
          <input
            type="number"
            min="0"
            max="999"
            value={formData.delay_minutes}
            onChange={(e) => setFormData({ ...formData, delay_minutes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="15"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
      >
        {loading ? 'Reporting...' : 'Report Incident (+10 points)'}
      </button>
    </div>
  );
}