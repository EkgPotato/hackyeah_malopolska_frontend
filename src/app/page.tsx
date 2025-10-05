'use client';

import { useState } from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useDelayData } from '~/hooks/useDelayData';
import { IncidentMap } from '~/components/IncidentMap';
import { IncidentsList } from '~/components/IncidentsList';
import { RoutesList } from '~/components/RoutesList';
import { ReportForm } from '~/components/ReportForm';
import { StatsView } from '~/components/StatsView';
import { api } from '~/lib/api';

type Tab = 'incidents' | 'routes' | 'report' | 'stats';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('incidents');
  const { incidents, routes, stops, stats, userPoints, loading, error, currentUserId, refetch } =
    useDelayData();

  const handleReportIncident = async (formData: any) => {
    try {
      await api.createIncident({ ...formData, reporter_id: currentUserId });
      alert('Incident reported successfully! +10 points');
      await refetch();
      setActiveTab('incidents');
    } catch (err) {
      alert('Failed to report incident');
      throw err;
    }
  };

  const handleVerify = async (incidentId: number, isVerified: boolean) => {
    try {
      await api.createVerification(incidentId, currentUserId, isVerified);
      alert(`Incident ${isVerified ? 'verified' : 'disputed'}! +2 points`);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to verify incident');
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">
            Make sure the backend API is running on http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Delay Management</h1>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{userPoints} points</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {(['incidents', 'routes', 'report', 'stats'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Active Incidents</h2>
              <span className="text-sm text-gray-600">
                {incidents.filter((i) => i.status === 'active').length} active
              </span>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-4">Incident Map</h3>
              <IncidentMap incidents={incidents} stops={stops} />
            </div>

            <IncidentsList incidents={incidents} onVerify={handleVerify} />
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Transport Routes</h2>
            <RoutesList routes={routes} />
          </div>
        )}

        {activeTab === 'report' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Report New Incident</h2>
            <ReportForm routes={routes} stops={stops} onSubmit={handleReportIncident} />
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Statistics</h2>
            <StatsView stats={stats} />
          </div>
        )}
      </main>
    </div>
  );
}