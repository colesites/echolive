import React from 'react';
import { useStudioStore } from '../../store/studioStore';
import { Button } from '../ui/button';
import { Play, Square, Settings, MonitorUp, Camera, LayoutTemplate, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function TopControls() {
  const { 
    isLive, isRecording, isVirtualCameraOn, isReplayBufferOn, isStudioMode, isConnecting,
    toggleLive, toggleRecording, toggleVirtualCamera, toggleReplayBuffer, toggleStudioMode,
    streamTitle, streamDuration 
  } = useStudioStore();

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
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
        <Button
          variant={isLive ? "destructive" : isConnecting ? "secondary" : "default"}
          onClick={toggleLive}
          disabled={isConnecting}
          className={cn(
            "min-w-[120px] justify-start shadow-md transition-all", 
            isLive ? "bg-red-600 hover:bg-red-700" : isConnecting ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isConnecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isLive ? (
            <Square className="w-4 h-4 fill-current mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isConnecting ? "Connecting..." : isLive ? "End Stream" : "Go Live"}
        </Button>
        <Button variant="ghost" size="icon" title="Settings" className="ml-2">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
