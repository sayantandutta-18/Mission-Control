import { useEffect, useState } from 'react';
import { useMissionStore } from '../../store/useMissionStore';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';

export default function Topbar() {
  const { connectionStatus, alerts } = useMissionStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>

      <div className="flex items-center gap-6">
        <div className="tech-text text-muted-foreground hidden sm:block">
          UTC {format(time, "HH:mm:ss")}
        </div>

        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            <span className={activeAlerts.length > 0 ? "text-destructive" : "text-success"}>
              {activeAlerts.length}
            </span> active alerts
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          {connectionStatus === 'live' ? (
            <>
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-bold text-success uppercase tracking-wider">Live</span>
              <Wifi className="h-3 w-3 text-success ml-1" />
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs font-bold text-destructive uppercase tracking-wider">Offline</span>
              <WifiOff className="h-3 w-3 text-destructive ml-1" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
