import { TransportIcon } from './TransportIcon';
import type { Route } from '~/lib/types';

interface RoutesListProps {
  routes: Route[];
}

export function RoutesList({ routes }: RoutesListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {routes.map((route) => (
        <div key={route.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-3 mb-3">
            <TransportIcon
              type={route.transport_type}
              className="h-6 w-6 text-gray-600 mt-1"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{route.route_number}</h3>
              <p className="text-sm text-gray-600">{route.route_name}</p>
            </div>
          </div>
          {route.active_incidents !== undefined && route.active_incidents > 0 && (
            <div className="mt-3 px-3 py-2 bg-red-50 rounded-md">
              <span className="text-sm font-medium text-red-800">
                {route.active_incidents} active incident
                {route.active_incidents !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}