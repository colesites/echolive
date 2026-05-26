import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, MessageSquare, AlertTriangle, Info } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const MOCK_ALERTS = [
  { id: '1', type: 'follower', message: 'Alex started following you', time: '2 mins ago', read: false },
  { id: '2', type: 'system', message: 'Stream connection unstable. Bitrate dropped to 2500kbps', time: '15 mins ago', read: false },
  { id: '3', type: 'chat', message: 'New super chat from Sarah: "Love the stream!"', time: '1 hour ago', read: true },
  { id: '4', type: 'info', message: 'Echo Live update v0.2.0 is available', time: 'Yesterday', read: true },
];

export function AlertsView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-hidden max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground mt-1">Recent notifications and system alerts.</p>
          </div>
          <Button variant="outline" className="text-zinc-300">
            Mark all as read
          </Button>
        </div>

        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-2">
              {MOCK_ALERTS.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </StudioLayout>
  );
}

function AlertItem({ alert }: { alert: typeof MOCK_ALERTS[0] }) {
  const getIcon = () => {
    switch (alert.type) {
      case 'follower': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'system': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'chat': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'info':
      default: return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${alert.read ? 'bg-zinc-950/30 border-transparent' : 'bg-zinc-800/50 border-zinc-700'}`}>
      <div className="mt-0.5 shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${alert.read ? 'text-zinc-400' : 'text-zinc-200 font-medium'}`}>
          {alert.message}
        </p>
        <span className="text-xs text-zinc-500 mt-1 block">{alert.time}</span>
      </div>
      {!alert.read && (
        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
      )}
    </div>
  );
}
