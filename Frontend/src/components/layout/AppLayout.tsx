import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIAssistant from '../ai/AIAssistant';

export const AppLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};
