import { useState, useEffect, useCallback } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { api } from '../services/api';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AlertsView() {
  const {
    alerts,
    satellites,
    setAlerts,
  } = useMissionStore();

  const [filter, setFilter] = useState<
    'all' | 'critical' | 'warning' | 'resolved'
  >('all');

  const [loading, setLoading] = useState(false);

  /*
   * Load alerts directly from backend
   */
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);

      const data = await api.getAlerts();

      console.log('========== ALERT DEBUG ==========');
      console.log('Alerts received from backend:', data);
      console.log('Number of alerts:', data.length);

      if (data.length > 0) {
        console.log('First alert:', data[0]);
        console.log('Severity:', data[0].severity);
        console.log('Resolved:', data[0].resolved);
      }

      console.log('=================================');

      /*
       * Replace Zustand alerts with the latest
       * backend data.
       *
       * Backend is the source of truth for alerts.
       */
      setAlerts(data);

    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [setAlerts]);

  /*
   * Initial load
   */
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  /*
   * Refresh every 5 seconds.
   *
   * This guarantees that newly generated alerts
   * appear even if Socket.IO misses an event.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [loadAlerts]);

  /*
   * Filter alerts
   */
  const filteredAlerts = alerts.filter((alert) => {
    const severity = String(alert.severity || '').toLowerCase();
    const resolved = Boolean(alert.resolved);

    if (filter === 'all') {
      return !resolved;
    }

    if (filter === 'resolved') {
      return resolved;
    }

    return severity === filter && !resolved;
  });

  /*
   * Sort newest first
   */
  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  /*
   * Counts
   */
  const criticalCount = alerts.filter(
    (a) =>
      String(a.severity).toLowerCase() === 'critical' &&
      !a.resolved
  ).length;

  const warningCount = alerts.filter(
    (a) =>
      String(a.severity).toLowerCase() === 'warning' &&
      !a.resolved
  ).length;

  const activeCount = alerts.filter(
    (a) => !a.resolved
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">
            Alert Center
          </h2>

          <p className="text-muted-foreground text-sm">
            System-wide anomaly detection and history
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Live count */}
          <div className="text-xs text-muted-foreground">
            Active:{' '}
            <span className="text-foreground font-bold">
              {activeCount}
            </span>
          </div>

          {/* Refresh */}
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="p-2 rounded-lg border border-border bg-surface hover:bg-white/5 transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">

            {(
              [
                'all',
                'critical',
                'warning',
                'resolved',
              ] as const
            ).map((f) => {

              let count: number | null = null;

              if (f === 'critical') {
                count = criticalCount;
              }

              if (f === 'warning') {
                count = warningCount;
              }

              if (f === 'all') {
                count = activeCount;
              }

              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                    filter === f
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  {f}

                  {count !== null && (
                    <span className="ml-1.5 text-xs opacity-80">
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-auto pr-2">

        <div className="space-y-3">

          {sortedAlerts.map((alert) => {

            const sat = satellites[alert.satelliteId];

            const severity = String(
              alert.severity || ''
            ).toLowerCase();

            return (
              <div
                key={alert._id}
                className={`glass-panel p-4 rounded-xl border-l-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/5 ${
                  alert.resolved
                    ? 'border-l-success'
                    : severity === 'critical'
                    ? 'border-l-destructive bg-destructive/5'
                    : 'border-l-warning bg-warning/5'
                }`}
              >

                {/* Alert information */}
                <div className="flex items-start md:items-center gap-4 flex-1">

                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      alert.resolved
                        ? 'bg-success/20 text-success'
                        : severity === 'critical'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {alert.resolved ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : severity === 'critical' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div>

                    <div className="flex items-center gap-3 mb-1">

                      <h4 className="font-semibold">
                        {sat?.name ||
                          `Satellite ${alert.satelliteId}`}
                      </h4>

                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                          alert.resolved
                            ? 'bg-success/20 text-success'
                            : severity === 'critical'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-warning text-warning-foreground'
                        }`}
                      >
                        {alert.resolved
                          ? 'RESOLVED'
                          : severity}
                      </span>

                    </div>

                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>

                  </div>
                </div>

                {/* Parameter + time */}
                <div className="flex items-center gap-6 md:w-[300px] justify-between text-sm shrink-0 pl-[52px] md:pl-0">

                  <div className="flex flex-col">

                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Parameter
                    </span>

                    <span className="font-mono">
                      {String(alert.type || 'N/A').toUpperCase()}:{' '}
                      {Number(alert.value || 0).toFixed(1)}
                    </span>

                  </div>

                  <div className="flex flex-col items-end">

                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Time (UTC)
                    </span>

                    <span className="font-mono">
                      {format(
                        new Date(alert.createdAt),
                        'HH:mm:ss dd MMM'
                      )}
                    </span>

                  </div>

                </div>

              </div>
            );
          })}

          {/* Empty state */}
          {sortedAlerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">

              <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-40" />

              <p>
                No alerts matching the selected filter.
              </p>

              <p className="text-xs mt-2 opacity-60">
                Total alerts received: {alerts.length}
              </p>

              {alerts.length > 0 && (
                <p className="text-xs mt-1 opacity-60">
                  Try another filter.
                </p>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}