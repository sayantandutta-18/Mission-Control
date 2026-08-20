import { useState, useEffect } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { api } from '../services/api';
import { AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AlertsView() {
  const { alerts, satellites, setAlerts } = useMissionStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');

  useEffect(() => {
    // Refresh alerts to ensure we have historical ones
    api.getAlerts().then(setAlerts).catch(console.error);
  }, [setAlerts]);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return a.severity === filter && !a.resolved;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Alert Center</h2>
          <p className="text-muted-foreground text-sm">System-wide anomaly detection and history</p>
        </div>

        <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
          {(['all', 'critical', 'warning', 'resolved'] as const).map(f => (
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
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const sat = satellites[alert.satelliteId];
            return (
              <div 
                key={alert._id} 
                className={`glass-panel p-4 rounded-xl border-l-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-white/5 ${
                  alert.resolved ? 'border-l-success' :
                  alert.severity === 'critical' ? 'border-l-destructive bg-destructive/5' : 'border-l-warning bg-warning/5'
                }`}
              >
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    alert.resolved ? 'bg-success/20 text-success' :
                    alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                  }`}>
                    {alert.resolved ? <CheckCircle2 className="h-5 w-5" /> : alert.severity === 'critical' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{sat?.name || alert.satelliteId}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        alert.resolved ? 'bg-success/20 text-success' :
                        alert.severity === 'critical' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'
                      }`}>
                        {alert.resolved ? 'RESOLVED' : alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:w-[300px] justify-between text-sm shrink-0 pl-[52px] md:pl-0">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Parameter</span>
                    <span className="font-mono">{alert.type.toUpperCase()}: {alert.value.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time (UTC)</span>
                    <span className="font-mono">{format(new Date(alert.createdAt), "HH:mm:ss dd MMM")}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No alerts matching the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
