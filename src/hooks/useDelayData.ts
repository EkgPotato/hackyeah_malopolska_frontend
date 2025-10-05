import { useState, useEffect } from 'react';
import { api } from '~/lib/api';
import type { Incident, Route, Stop, Stats } from '~/lib/types';

export function useDelayData() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 1; // Hardcoded for demo

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsData, routesData, stopsData, statsData, userData] = await Promise.all([
        api.getIncidents(),
        api.getRoutes(),
        api.getStops(),
        api.getStats(),
        api.getUser(currentUserId),
      ]);

      setIncidents(incidentsData);
      setRoutes(routesData);
      setStops(stopsData);
      setStats(statsData);
      setUserPoints(userData.points);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return {
    incidents,
    routes,
    stops,
    stats,
    userPoints,
    loading,
    error,
    currentUserId,
    refetch: fetchData,
  };
}