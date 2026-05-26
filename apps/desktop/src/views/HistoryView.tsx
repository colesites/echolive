import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Clock, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

const MOCK_HISTORY = [
  { id: '1', title: 'Late Night Vibes', date: 'Yesterday', duration: '2h 15m', health: 'Excellent', drops: 0 },
  { id: '2', title: 'Just Chatting #23', date: 'Oct 24, 2026', duration: '3h 45m', health: 'Good', drops: 2 },
  { id: '3', title: 'Podcast Ep 5', date: 'Oct 20, 2026', duration: '1h 30m', health: 'Poor', drops: 14 },
  { id: '4', title: 'Dev Stream: Rust', date: 'Oct 15, 2026', duration: '4h 10m', health: 'Excellent', drops: 0 },
];

export function HistoryView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stream History</h1>
            <p className="text-muted-foreground mt-1">Review past broadcast performance and health metrics.</p>
          </div>
        </div>

        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 flex flex-col overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 text-sm font-semibold text-zinc-400 bg-zinc-950/30 shrink-0">
            <div className="col-span-4">Session</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2">Health</div>
            <div className="col-span-2 text-right">Dropped Frames</div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {MOCK_HISTORY.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </StudioLayout>
  );
}

function HistoryRow({ item }: { item: typeof MOCK_HISTORY[0] }) {
  const HealthIcon = item.health === 'Excellent' ? CheckCircle2 : item.health === 'Good' ? Activity : AlertCircle;
  const healthColor = item.health === 'Excellent' ? 'text-green-500' : item.health === 'Good' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 items-center transition-colors">
      <div className="col-span-4 flex flex-col">
        <span className="font-medium text-zinc-200">{item.title}</span>
        <span className="text-xs text-zinc-500">Session ID: {item.id.padStart(6, '0')}</span>
      </div>
      <div className="col-span-2 text-sm text-zinc-400">
        {item.date}
      </div>
      <div className="col-span-2 text-sm text-zinc-400 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        {item.duration}
      </div>
      <div className={`col-span-2 text-sm flex items-center gap-1.5 ${healthColor}`}>
        <HealthIcon className="w-4 h-4" />
        {item.health}
      </div>
      <div className="col-span-2 text-sm text-zinc-400 text-right tabular-nums">
        {item.drops === 0 ? '-' : <span className="text-red-400">{item.drops}</span>}
      </div>
    </div>
  );
}
