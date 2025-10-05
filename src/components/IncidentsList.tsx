'use client';

import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { TransportIcon } from './TransportIcon';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import type { Incident } from '~/lib/types';

interface IncidentsListProps {
  incidents: Incident[];
  onVerify: (incidentId: number, isVerified: boolean) => void;
}

export function IncidentsList({ incidents, onVerify }: IncidentsListProps) {
  return (
    <div className="grid gap-4">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3">
              {incident.route && (
                <TransportIcon
                  type={incident.route.transport_type}
                  className="h-6 w-6 text-gray-600 mt-1"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{incident.title}</h3>
                {incident.route && (
                  <p className="text-sm text-gray-600">
                    {incident.route.route_number} - {incident.route.route_name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
          </div>

          <p className="text-gray-700 mb-3">{incident.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            {incident.delay_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{incident.delay_minutes} min delay</span>
              </div>
            )}
            {incident.stop && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{incident.stop.stop_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {incident.verification_count}
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                {incident.dispute_count}
              </span>
            </div>
          </div>

          {incident.status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={() => onVerify(incident.id, true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
              >
                Verify (+2 pts)
              </button>
              <button
                onClick={() => onVerify(incident.id, false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
              >
                Dispute (+2 pts)
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}