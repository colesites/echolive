import { useStudioStore } from '../../store/studioStore';
import { Button } from '../ui/button';
import { Calendar, History, Bell, LayoutDashboard, Share2, Video, PlaySquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { UserMenu } from '../auth/UserMenu';

export function Sidebar() {
  const { activeView, setActiveView } = useStudioStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'studio', label: 'Studio', icon: <Video className="w-4 h-4" /> },
    { id: 'streams', label: 'Streams', icon: <PlaySquare className="w-4 h-4" /> },
    { id: 'scheduler', label: 'Scheduler', icon: <Calendar className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'multistream', label: 'Destinations', icon: <Share2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-16 hover:w-64 flex flex-col h-full bg-card border-r border-border transition-all duration-300 overflow-hidden group">
      <div className="h-16 border-b border-border flex items-center px-2 group-hover:px-3 shrink-0 transition-all">
        <UserMenu collapsed />
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-2 px-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start h-12 relative",
                activeView === item.id ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground"
              )}
              onClick={() => setActiveView(item.id as any)}
            >
              <div className="w-6 flex justify-center shrink-0 z-10">
                {item.icon}
              </div>
              <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
