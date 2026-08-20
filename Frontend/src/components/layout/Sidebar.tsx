import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Satellite, Activity, AlertTriangle, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Satellites', path: '/satellites', icon: Satellite },
  { name: 'Telemetry', path: '/telemetry', icon: Activity },
  { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  { name: 'Orbital Map', path: '/globe', icon: Globe },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="font-display font-bold text-xl tracking-wider text-primary">
          MISSION<span className="text-foreground">CONTROL</span>
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-mono">
          SYSTEM VER: 1.0.4<br/>
          STATION: HOUSTON_PRIMARY
        </div>
      </div>
    </aside>
  );
}
