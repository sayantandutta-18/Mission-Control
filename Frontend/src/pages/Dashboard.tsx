import { useEffect, useState } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { api } from '../services/api';
import { Activity, AlertTriangle, Satellite as SatelliteIcon, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const { satellites, alerts, setSatellites, setAlerts } = useMissionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sats, alts] = await Promise.all([
          api.getSatellites(),
          api.getAlerts()
        ]);
        setSatellites(sats);
        setAlerts(alts);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setSatellites, setAlerts]);

  const satList = Object.values(satellites);
  const total = satList.length;
  const healthy = satList.filter(s => s.status === 'healthy').length;
  const warning = satList.filter(s => s.status === 'warning').length;
  const critical = satList.filter(s => s.status === 'critical').length;
  const activeAlerts = alerts.filter(a => !a.resolved);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Initializing Mission Data...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Mission Overview</h2>
          <p className="text-muted-foreground text-sm">Real-time status of all deployed orbital assets</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Satellites" value={total} icon={<SatelliteIcon className="text-primary h-5 w-5" />} />
        <MetricCard title="Healthy" value={healthy} icon={<CheckCircle2 className="text-success h-5 w-5" />} trend="nominal" />
        <MetricCard title="Warning" value={warning} icon={<AlertTriangle className="text-warning h-5 w-5" />} />
        <MetricCard title="Critical" value={critical} icon={<AlertTriangle className="text-destructive h-5 w-5" />} />
        <MetricCard title="Active Alerts" value={activeAlerts.length} icon={<Activity className="text-destructive h-5 w-5" />} trend={activeAlerts.length > 0 ? "attention" : "nominal"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Health Summary */}
        <div className="glass-panel rounded-xl p-6 flex flex-col">
          <h3 className="font-display font-semibold mb-4 text-sm text-muted-foreground tracking-wider uppercase">Mission Health</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`text-5xl font-display font-bold tracking-tighter ${critical > 0 ? 'text-destructive' : warning > 0 ? 'text-warning' : 'text-success'}`}>
              {critical > 0 ? 'CRITICAL' : warning > 0 ? 'DEGRADED' : 'NOMINAL'}
            </div>
            <p className="text-muted-foreground mt-4 text-center text-sm">
              {critical > 0 
                ? `${critical} assets require immediate attention.` 
                : warning > 0 
                  ? "Minor anomalies detected in fleet operations."
                  : "All systems operating within acceptable parameters."}
            </p>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-semibold text-sm text-muted-foreground tracking-wider uppercase">Recent Anomalies</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px]">
            {activeAlerts.slice(0, 5).map(alert => {
              const sat = satellites[alert.satelliteId];
              return (
                <div key={alert._id} className="p-4 rounded-lg bg-surface/50 border border-border flex items-start gap-4">
                  <div className={`mt-0.5 p-1.5 rounded-md ${alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{sat?.name || alert.satelliteId}</span>
                      <span className="text-xs text-muted-foreground tech-text">{new Date(alert.createdAt).toISOString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded border border-border">
                        {alert.type.toUpperCase()}: {alert.value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeAlerts.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No active anomalies detected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend?: 'nominal' | 'attention' }) {
  return (
    <div className={`glass-panel p-5 rounded-xl border-t-2 ${trend === 'attention' ? 'border-t-destructive' : trend === 'nominal' ? 'border-t-success' : 'border-t-transparent'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground font-medium tracking-wide">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-display font-bold">{value}</div>
    </div>
  );
}
