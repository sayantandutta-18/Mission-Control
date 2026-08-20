import { useState, useMemo } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, Thermometer, Wifi } from 'lucide-react';

// For demo purposes, we will store a short history locally in the component for the selected satellite.
// In a real app with historical telemetry endpoints, we'd fetch it. The backend provides GET /api/telemetry/:satelliteId

export default function TelemetryView() {
  const { satellites, liveTelemetry } = useMissionStore();
  const [selectedSatId, setSelectedSatId] = useState<string>('');
  
  const satList = Object.values(satellites);
  
  // Set initial selected satellite
  if (!selectedSatId && satList.length > 0) {
    setSelectedSatId(satList[0]._id);
  }

  const selectedSat = satellites[selectedSatId];
  const currentTelemetry = liveTelemetry[selectedSatId];

  // We would normally fetch historical data here. Since we only have live events streaming in this demo,
  // we'll just mock a short array using the current value to show the chart structure.
  const chartData = useMemo(() => {
    if (!currentTelemetry) return [];
    
    // Create a mock trail of 20 points ending in the current value for visual effect
    const data = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      data.push({
        time: new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        battery: Math.max(0, Math.min(100, currentTelemetry.battery + (Math.random() * 4 - 2))),
        temperature: currentTelemetry.temperature + (Math.random() * 2 - 1),
        signal: Math.max(0, Math.min(100, currentTelemetry.signal + (Math.random() * 4 - 2))),
      });
    }
    // Make sure the last point is exact
    data[20] = {
      time: now.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
      battery: currentTelemetry.battery,
      temperature: currentTelemetry.temperature,
      signal: currentTelemetry.signal
    };
    return data;
  }, [currentTelemetry]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Live Telemetry</h2>
          <p className="text-muted-foreground text-sm">Real-time asset instrumentation and sensor data</p>
        </div>

        <select 
          value={selectedSatId}
          onChange={(e) => setSelectedSatId(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary font-medium"
        >
          {satList.map(sat => (
            <option key={sat._id} value={sat._id}>{sat.name} ({sat.noradId})</option>
          ))}
        </select>
      </div>

      {!selectedSat ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a satellite to view telemetry</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          
          {/* Current Values Sidebar */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="font-display text-lg font-bold mb-1">{selectedSat.name}</h3>
              <div className="text-sm text-muted-foreground font-mono mb-4">NORAD: {selectedSat.noradId}</div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedSat.status === 'critical' ? 'bg-destructive/20 text-destructive' :
                selectedSat.status === 'warning' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>
                {selectedSat.status}
              </div>
            </div>

            {currentTelemetry ? (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <GaugeCard icon={<Battery />} label="Battery" value={currentTelemetry.battery} unit="%" color="#00E5FF" />
                <GaugeCard icon={<Thermometer />} label="Temperature" value={currentTelemetry.temperature} unit="°C" color="#FFC400" />
                <GaugeCard icon={<Wifi />} label="Signal" value={currentTelemetry.signal} unit="%" color="#00E676" />
                <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
                  <span className="text-sm text-muted-foreground uppercase tracking-wider">Attitude</span>
                  <span className="font-mono font-bold text-lg">{currentTelemetry.attitude.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-xl text-center text-muted-foreground animate-pulse">
                Awaiting telemetry signal...
              </div>
            )}
          </div>

          {/* Charts Area */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col min-h-[500px]">
            <h3 className="font-display font-semibold text-sm text-muted-foreground tracking-wider uppercase mb-6">Historical Trends</h3>
            
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151A24', borderColor: '#2a3441', borderRadius: '8px' }}
                      itemStyle={{ color: '#00E5FF' }}
                    />
                    <Line type="monotone" dataKey="battery" stroke="#00E5FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3441" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 'dataMax + 20']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151A24', borderColor: '#2a3441', borderRadius: '8px' }}
                      itemStyle={{ color: '#FFC400' }}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="#FFC400" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function GaugeCard({ icon, label, value, unit, color }: { icon: React.ReactNode, label: string, value: number, unit: string, color: string }) {
  return (
    <div className="glass-panel p-4 rounded-xl">
      <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-display font-bold" style={{ color }}>
          {value.toFixed(1)}<span className="text-lg text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
}
