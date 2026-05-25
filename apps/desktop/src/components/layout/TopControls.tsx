import { GoLiveModal } from '../panels/GoLiveModal';
import { useStudioStore } from '../../store/studioStore';
import { Button } from '../ui/button';
import { Square, Settings, MonitorUp, Camera, LayoutTemplate, RotateCcw, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function TopControls() {
  const {
    isLive, isRecording, isVirtualCameraOn, isReplayBufferOn, isStudioMode, isConnecting,
    goLive, endLive, toggleRecording, toggleVirtualCamera, toggleReplayBuffer, toggleStudioMode,
    streamTitle, streamDuration, liveSession, lastError, clearError,
  } = useStudioStore();

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
    {lastError && (
      <div className="flex items-start justify-between gap-3 border-b border-red-900/50 bg-red-950/40 px-6 py-2 text-sm text-red-200">
        <div className="min-w-0 flex-1">
          <span className="font-semibold">Stream failed:</span>{" "}
          <span className="font-mono text-xs opacity-90 break-all">{lastError}</span>
        </div>
        <button
          type="button"
          onClick={clearError}
          className="text-red-300 hover:text-white text-xs shrink-0"
        >
          Dismiss
        </button>
      </div>
    )}
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">{streamTitle}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            {isLive ? (
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5 text-red-500 font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                LIVE
              </motion.div>
            ) : (
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                OFFLINE
              </span>
            )}
            <span className="tabular-nums">{formatDuration(streamDuration)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant={isStudioMode ? "default" : "outline"} 
          size="sm" 
          onClick={toggleStudioMode}
          title="Studio Mode (Preview & Program)"
          className={cn("text-xs font-semibold", isStudioMode && "bg-primary text-primary-foreground")}
        >
          <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
          Studio Mode
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button 
          variant={isReplayBufferOn ? "default" : "outline"} 
          size="sm" 
          onClick={toggleReplayBuffer}
          title="Replay Buffer"
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Replay
        </Button>
        <Button 
          variant={isVirtualCameraOn ? "default" : "outline"} 
          size="sm" 
          onClick={toggleVirtualCamera}
          title="Virtual Camera"
          className="text-xs"
        >
          <Camera className="w-3.5 h-3.5 mr-1.5" />
          Virtual Cam
        </Button>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <Button
          variant={isRecording ? "destructive" : "secondary"}
          onClick={toggleRecording}
          className="min-w-[120px] justify-start"
        >
          {isRecording ? <Square className="w-4 h-4 fill-current mr-2" /> : <MonitorUp className="w-4 h-4 mr-2" />}
          {isRecording ? "Stop REC" : "Record"}
        </Button>
        {isConnecting || isLive ? (
          <>
            {liveSession && <ShareUrlPill url={liveSession.shareUrl} />}
            <Button
              variant={isLive ? "destructive" : "secondary"}
              onClick={() => { void endLive(); }}
              disabled={isConnecting}
              className={cn(
                "min-w-[120px] justify-start shadow-md transition-all",
                isLive ? "bg-red-600 hover:bg-red-700" : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Square className="w-4 h-4 fill-current mr-2" />
              )}
              {isConnecting ? "Connecting..." : "End Stream"}
            </Button>
          </>
        ) : (
          <GoLiveModal
            onStart={async (data) => {
              const title = data.title.trim() || streamTitle;
              await goLive({ title, coverFile: data.coverFile });
            }}
          />
        )}
        <Button variant="ghost" size="icon" title="Settings" className="ml-2">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
    </>
  );
}

function ShareUrlPill({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('[echolive] Clipboard write failed:', err);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy listener URL"
      className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors max-w-[280px]"
    >
      <span className="truncate font-mono">{url}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" />
      )}
    </button>
  );
}
