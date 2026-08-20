import { useState } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { Search, Satellite as SatelliteIcon, AlertTriangle, CheckCircle2, Battery, Thermometer, Wifi } from 'lucide-react';

export default function Satellites() {
  const { satellites, liveTelemetry } = useMissionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const filteredSatellites = Object.values(satellites).filter(sat => {
    const matchesSearch = sat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sat.noradId.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || sat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Satellite Explorer</h2>
          <p className="text-muted-foreground text-sm">Detailed status and telemetry for individual assets</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or NORAD ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSatellites.map(sat => {
            const telemetry = liveTelemetry[sat._id];
            
            return (
              <div key={sat._id} className={`glass-panel p-5 rounded-xl border-t-2 transition-all hover:bg-white/5 cursor-pointer ${
                sat.status === 'critical' ? 'border-t-destructive' : 
                sat.status === 'warning' ? 'border-t-warning' : 'border-t-success'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      sat.status === 'critical' ? 'bg-destructive/20 text-destructive' : 
                      sat.status === 'warning' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                    }`}>
                      <SatelliteIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{sat.name}</h3>
                      <div className="tech-text text-muted-foreground text-xs">NORAD: {sat.noradId}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sat.status === 'healthy' && <><CheckCircle2 className="h-4 w-4 text-success" /><span className="text-xs uppercase text-success font-bold tracking-wider">Nominal</span></>}
                    {sat.status === 'warning' && <><AlertTriangle className="h-4 w-4 text-warning" /><span className="text-xs uppercase text-warning font-bold tracking-wider">Warning</span></>}
                    {sat.status === 'critical' && <><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-xs uppercase text-destructive font-bold tracking-wider">Critical</span></>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <TelemetryIndicator icon={<Battery className="h-4 w-4" />} label="Battery" value={telemetry ? `${telemetry.battery}%` : '---'} />
                  <TelemetryIndicator icon={<Thermometer className="h-4 w-4" />} label="Temp" value={telemetry ? `${telemetry.temperature}°C` : '---'} />
                  <TelemetryIndicator icon={<Wifi className="h-4 w-4" />} label="Signal" value={telemetry ? `${telemetry.signal}%` : '---'} />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Attitude</span>
                    <span className="font-mono text-sm">{telemetry ? telemetry.attitude.toFixed(2) : '---'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredSatellites.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No satellites found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

function TelemetryIndicator({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
