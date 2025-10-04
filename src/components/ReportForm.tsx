"use client";

import React, { useState } from 'react';
// Import 'Plus' jeśli jest używana, ale w JSX formularza nie jest widoczna.
// Możesz ją usunąć, jeśli nie jest nigdzie wykorzystywana w tym komponencie.
import { Plus } from 'lucide-react'; 

// Importujemy interfejsy z głównego komponentu lub definiujemy je tutaj,
// jeśli mają być używane tylko w tym pliku. Dla czystości, zakładam, że są one
// albo dostępne globalnie, albo powinny być przekazane jako propsy.
// W tym przypadku kopiujemy je dla samodzielności komponentu.

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

// Typ dla początkowego stanu formularza (pola jako stringi)
const initialFormData = {
  title: '',
  description: '',
  incident_type: 'delay',
  severity: 'medium',
  route_id: '',
  stop_id: '',
  delay_minutes: ''
};

// Typ dla przetworzonych danych formularza, które są wysyłane (pola liczbowe/null)
export interface ProcessedFormData { // Exportujemy ten interfejs, aby użyć go w DelayManagement
  title: string;
  description: string;
  incident_type: 'delay' | 'cancellation' | 'breakdown' | 'crowding' | 'other'; // Lepsze typowanie dla select
  severity: 'low' | 'medium' | 'high' | 'critical'; // Lepsze typowanie dla select
  route_id: number;
  stop_id: number | null;
  delay_minutes: number | null;
}

// Definiujemy propsy, które ReportForm będzie otrzymywał
interface ReportFormProps {
  currentUser: User;
  routes: Route[];
  stops: Stop[];
  loading: boolean;
  onSubmit: (formData: ProcessedFormData) => Promise<void>; // Funkcja do wysłania danych z poprawnym typem
}

export default function ReportForm({ currentUser, routes, stops, loading, onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState(initialFormData);

  // Walidacja formularza: title i description minimalna długość, route_id musi być wybrane
  const canSubmit = 
    formData.title.length >= 5 && 
    formData.description.length >= 10 && 
    formData.route_id !== ''; 

  // Ogólna funkcja do obsługi zmian we wszystkich polach formularza
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const parsedStopId = formData.stop_id === '' ? null : parseInt(formData.stop_id, 10);
    const parsedDelayMinutes = formData.delay_minutes === '' ? null : parseInt(formData.delay_minutes, 10);

    const dataToSubmit: ProcessedFormData = {
      title: formData.title,
      description: formData.description,
      incident_type: formData.incident_type as 'delay' | 'cancellation' | 'breakdown' | 'crowding' | 'other',
      severity: formData.severity as 'low' | 'medium' | 'high' | 'critical',
      route_id: parseInt(formData.route_id, 10),
      stop_id: parsedStopId !== null && !isNaN(parsedStopId) ? parsedStopId : null,
      delay_minutes: parsedDelayMinutes !== null && !isNaN(parsedDelayMinutes) ? parsedDelayMinutes : null
    };

    await onSubmit(dataToSubmit);
    setFormData(initialFormData);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Report New Incident</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title" 
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the incident"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description" 
            value={formData.description}
            onChange={handleChange}
            className="h-24 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of what happened"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="incident_type" className="mb-2 block text-sm font-medium">Incident Type</label>
            <select
              id="incident_type"
              name="incident_type" 
              value={formData.incident_type}
              onChange={handleChange}
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
            <label htmlFor="severity" className="mb-2 block text-sm font-medium">Severity</label>
            <select
              id="severity"
              name="severity" 
              value={formData.severity}
              onChange={handleChange}
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
            <label htmlFor="route_id" className="mb-2 block text-sm font-medium">Route</label>
            <select
              id="route_id"
              name="route_id" 
              value={formData.route_id}
              onChange={handleChange}
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
            <label htmlFor="stop_id" className="mb-2 block text-sm font-medium">Stop (Optional)</label>
            <select
              id="stop_id"
              name="stop_id" 
              value={formData.stop_id}
              onChange={handleChange}
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
          <label htmlFor="delay_minutes" className="mb-2 block text-sm font-medium">Delay (minutes, optional)</label>
          <input
            type="number"
            id="delay_minutes"
            name="delay_minutes" 
            min="0"
            value={formData.delay_minutes}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Estimated delay in minutes"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Report Incident (+10 points)'}
        </button>
      </div>
    </div>
  );
}