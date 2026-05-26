import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, MoreHorizontal, Video, Mic, Radio } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const MOCK_STREAMS = [
  { id: '1', title: 'Late Night Vibes', type: 'Audio Only', date: 'Yesterday, 10:00 PM', duration: '2h 15m', size: '145 MB' },
  { id: '2', title: 'Just Chatting #23', type: 'Video + Audio', date: 'Oct 24, 8:00 PM', duration: '3h 45m', size: '1.2 GB' },
  { id: '3', title: 'Podcast Ep 5', type: 'Simulcast', date: 'Oct 20, 5:00 PM', duration: '1h 30m', size: '480 MB' },
  { id: '4', title: 'Dev Stream: Rust', type: 'Video + Audio', date: 'Oct 15, 2:00 PM', duration: '4h 10m', size: '1.8 GB' },
  { id: '5', title: 'Q&A Session', type: 'Audio Only', date: 'Oct 10, 7:00 PM', duration: '1h 00m', size: '85 MB' },
];

export function StreamsView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
            <p className="text-muted-foreground mt-1">Manage and download your past broadcasts.</p>
          </div>
          <Button variant="outline" className="text-zinc-300">
            Storage Settings
          </Button>
        </div>

        <Card className="flex-1 bg-zinc-900/50 border-zinc-800 flex flex-col overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 text-sm font-semibold text-zinc-400 bg-zinc-950/30 shrink-0">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2 text-right">Size</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {MOCK_STREAMS.map((stream) => (
                <StreamRow key={stream.id} stream={stream} />
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </StudioLayout>
  );
}

function StreamRow({ stream }: { stream: typeof MOCK_STREAMS[0] }) {
  const Icon = stream.type === 'Audio Only' ? Mic : stream.type === 'Simulcast' ? Radio : Video;

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 items-center transition-colors group">
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div>
          <p className="font-medium text-zinc-200">{stream.title}</p>
          <p className="text-xs text-zinc-500">{stream.type}</p>
        </div>
      </div>
      <div className="col-span-2 text-sm text-zinc-400">
        {stream.date}
      </div>
      <div className="col-span-2 text-sm text-zinc-400 tabular-nums">
        {stream.duration}
      </div>
      <div className="col-span-2 text-sm text-zinc-400 text-right tabular-nums">
        {stream.size}
      </div>
      <div className="col-span-1 flex justify-center items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700" title="Download">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
