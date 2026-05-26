import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { Users, Video, Clock, TrendingUp } from 'lucide-react';

export function DashboardView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with your broadcasts.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Listeners" value="1,248" icon={<Users className="w-4 h-4 text-zinc-400" />} trend="+12% from last month" />
          <StatCard title="Total Streams" value="34" icon={<Video className="w-4 h-4 text-zinc-400" />} trend="+4 this week" />
          <StatCard title="Hours Broadcasted" value="124.5" icon={<Clock className="w-4 h-4 text-zinc-400" />} trend="Steady" />
          <StatCard title="Followers Gained" value="+142" icon={<TrendingUp className="w-4 h-4 text-green-400" />} trend="+24% from last month" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex flex-col gap-4">
              <ActivityItem title="Late Night Vibes" type="Audio Only" date="Yesterday, 10:00 PM" duration="2h 15m" />
              <ActivityItem title="Just Chatting #23" type="Video + Audio" date="Oct 24, 8:00 PM" duration="3h 45m" />
              <ActivityItem title="Podcast Ep 5" type="Simulcast" date="Oct 20, 5:00 PM" duration="1h 30m" />
            </Card>
          </div>

          {/* Quick Actions or System Status */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">MediaMTX Ingest</span>
                <span className="text-green-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Convex Realtime DB</span>
                <span className="text-green-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Local FFmpeg Engine</span>
                <span className="text-green-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Ready</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <Card className="p-4 bg-zinc-900/50 border-zinc-800 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <p className="text-xs text-zinc-500 mt-1">{trend}</p>
    </Card>
  );
}

function ActivityItem({ title, type, date, duration }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-500">{type} • {date}</p>
      </div>
      <div className="text-sm text-zinc-400 tabular-nums">
        {duration}
      </div>
    </div>
  );
}
