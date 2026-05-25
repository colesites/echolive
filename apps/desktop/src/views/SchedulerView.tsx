import React from 'react';
import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar as CalendarIcon, Clock, Edit, Trash2, Plus } from 'lucide-react';

const MOCK_SCHEDULED = [
  { id: '1', title: 'Community Townhall', date: 'Oct 30, 2026', time: '18:00', type: 'Video + Audio' },
  { id: '2', title: 'Weekend Coding Stream', date: 'Nov 2, 2026', time: '14:00', type: 'Video + Audio' },
  { id: '3', title: 'Late Night Chill', date: 'Nov 5, 2026', time: '23:00', type: 'Audio Only' },
];

export function SchedulerView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scheduler</h1>
            <p className="text-muted-foreground mt-1">Plan and manage your upcoming broadcasts.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-full flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Stream
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget Area (Placeholder) */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 flex flex-col items-center justify-center min-h-[300px]">
              <CalendarIcon className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-medium">Calendar integration coming soon</p>
            </Card>
          </div>

          {/* Upcoming Streams List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Upcoming Streams</h2>
            
            {MOCK_SCHEDULED.length === 0 ? (
              <Card className="p-12 border-dashed border-2 border-zinc-800 bg-transparent flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                  <CalendarIcon className="w-6 h-6 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No upcoming streams</h3>
                <p className="text-zinc-500 max-w-sm mb-6">Schedule your next broadcast to notify your followers and build anticipation.</p>
                <Button variant="outline">Schedule Now</Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {MOCK_SCHEDULED.map((item) => (
                  <ScheduledItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

function ScheduledItem({ item }: { item: typeof MOCK_SCHEDULED[0] }) {
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0">
          <span className="text-xs font-bold text-red-500 uppercase">{item.date.split(' ')[0]}</span>
          <span className="text-lg font-bold text-white">{item.date.split(' ')[1].replace(',', '')}</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-white leading-tight mb-1">{item.title}</h3>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.time}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>{item.type}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" title="Edit">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" title="Delete">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
