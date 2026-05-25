import React from 'react';
import { StudioLayout } from '../components/layout/StudioLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Settings, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const MOCK_DESTINATIONS = [
  { id: '1', name: 'Echo Live', platform: 'echolive', url: 'rtmp://ingest.echolive.app/live', key: '••••••••abcd', enabled: true, connected: true },
  { id: '2', name: 'Twitch', platform: 'twitch', url: 'rtmp://live.twitch.tv/app', key: '••••••••efgh', enabled: true, connected: false },
  { id: '3', name: 'YouTube', platform: 'youtube', url: 'rtmp://a.rtmp.youtube.com/live2', key: '••••••••ijkl', enabled: false, connected: false },
];

const PLATFORM_COLORS: Record<string, string> = {
  echolive: 'from-violet-600 to-indigo-600',
  twitch: 'from-purple-600 to-purple-800',
  youtube: 'from-red-600 to-red-800',
};

const PLATFORM_LABELS: Record<string, string> = {
  echolive: 'EL',
  twitch: 'TW',
  youtube: 'YT',
};

export function DestinationsView() {
  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
            <p className="text-muted-foreground mt-1">Manage your multistream output targets.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-full flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Destination
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {MOCK_DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-zinc-900/30 border-zinc-800 border-dashed">
          <h3 className="font-semibold text-zinc-300 mb-2">How multistreaming works</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            When you go live, Echo Live will push your stream to all enabled destinations simultaneously.
            Each destination requires a valid RTMP URL and stream key. You can toggle individual destinations
            on or off without removing them.
          </p>
        </Card>
      </div>
    </StudioLayout>
  );
}

function DestinationCard({ dest }: { dest: typeof MOCK_DESTINATIONS[0] }) {
  const [enabled, setEnabled] = React.useState(dest.enabled);

  return (
    <Card className={cn(
      "p-5 border transition-all",
      enabled ? "bg-zinc-900/50 border-zinc-700" : "bg-zinc-950/50 border-zinc-800 opacity-60"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Platform Badge */}
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg",
            PLATFORM_COLORS[dest.platform] || 'from-zinc-600 to-zinc-800'
          )}>
            {PLATFORM_LABELS[dest.platform] || '??'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-white">{dest.name}</h3>
              {dest.connected && enabled && (
                <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              )}
              {!dest.connected && enabled && (
                <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                  <WifiOff className="w-3 h-3" /> Idle
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1 font-mono">{dest.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch */}
          <button
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors",
              enabled ? "bg-green-600" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
              enabled ? "translate-x-5" : "translate-x-0"
            )} />
          </button>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white" title="Open Platform">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stream Key */}
      {enabled && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-3">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Stream Key</span>
          <code className="text-xs bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-zinc-400 font-mono">
            {dest.key}
          </code>
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white h-7">
            Reveal
          </Button>
        </div>
      )}
    </Card>
  );
}
