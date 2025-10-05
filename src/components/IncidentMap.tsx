'use client';

import { useEffect, useRef } from 'react';
import type { Incident, Stop } from '~/lib/types';

interface IncidentMapProps {
  incidents: Incident[];
  stops: Stop[];
}

export function IncidentMap({ incidents, stops }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet dynamically (client-side only)
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      import('leaflet').then((L) => {
        if (!mapRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([50.0647, 19.9450], 12);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Add markers for stops
        stops.forEach((stop) => {
          const incidentCount = incidents.filter(
            (i) => i.stop_id === stop.id && i.status === 'active'
          ).length;
          const color = incidentCount > 2 ? 'red' : incidentCount > 0 ? 'orange' : 'green';

          L.circleMarker([stop.latitude, stop.longitude], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.8,
          })
            .addTo(map)
            .bindPopup(`<b>${stop.stop_name}</b><br/>Active incidents: ${incidentCount}`);
        });
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [incidents, stops]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className="h-96 w-full rounded-lg" />
    </>
  );
}