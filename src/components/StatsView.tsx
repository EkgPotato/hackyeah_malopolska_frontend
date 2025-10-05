import type { Stats } from '~/lib/types';

interface StatsViewProps {
  stats: Stats;
}

export function StatsView({ stats }: StatsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{stats.total_incidents}</div>
          <div className="text-sm text-gray-600">Total Incidents</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600">{stats.active_incidents}</div>
          <div className="text-sm text-gray-600">Active Incidents</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">{stats.resolved_incidents}</div>
          <div className="text-sm text-gray-600">Resolved Incidents</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">By Type</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_type).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">By Severity</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_severity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between items-center">
                <span className="capitalize">{severity}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}