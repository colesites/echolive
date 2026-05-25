import React from 'react';
import { useStudioStore } from '../../store/studioStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Mic, MicOff, Volume2, VolumeX, Settings2, SlidersHorizontal } from 'lucide-react';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { ScrollArea } from '../ui/scroll-area';

export function AudioMixer() {
  const { 
    audioChannels, 
    setAudioVolume, 
    toggleAudioMute, 
    devices, 
    selectedDeviceName, 
    selectDevice, 
    audioLevel 
  } = useStudioStore();

  const openEQWindow = async () => {
    try {
      const eqWindow = new WebviewWindow('eq-window', {
        url: '/?view=eq',
        title: 'Parametric Equalizer',
        width: 800,
        height: 500,
        resizable: false,
        theme: 'dark',
      });
      await eqWindow.once('tauri://error', function (e) {
        console.error('Error creating EQ window:', e);
      });
    } catch (e) {
      console.error('Failed to open EQ window:', e);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            Audio Mixer
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded"
            onClick={openEQWindow}
            title="Open Equalizer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 max-w-[60%]">
          <select
            value={selectedDeviceName || ''}
            onChange={(e) => selectDevice(e.target.value || null)}
            className="text-xs bg-secondary/50 border border-border rounded-md px-2 py-1 outline-none text-foreground cursor-pointer hover:bg-secondary transition-colors w-full truncate"
          >
            <option value="">Default Input Device</option>
            {devices.map((device) => (
              <option key={device.name} value={device.name} className="bg-card text-foreground">
                {device.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex p-4 gap-6 min-w-max">
            {audioChannels.map((channel) => {
              const isMic = channel.id === 'audio-2';
              // Calculate level: Mic gets the real level from backend, desktop is static 0 for now.
              const level = isMic ? audioLevel : 0;
              const levelPercent = channel.muted ? 0 : Math.min(level * 100, 100);

              return (
                <div key={channel.id} className="flex flex-col items-center gap-4 w-16 group">
                  <div className="h-48 relative flex justify-center w-full bg-secondary/30 rounded-lg py-3">
                    {/* Volume Slider - Vertical */}
                    <Slider
                      orientation="vertical"
                      min={0}
                      max={100}
                      step={1}
                      value={[channel.volume]}
                      onValueChange={(val) => setAudioVolume(channel.id, val[0])}
                      className="h-full"
                    />
                    {/* Real-time VU Meter */}
                    <div className="absolute right-2 bottom-3 top-3 w-1.5 bg-background rounded-full overflow-hidden flex flex-col justify-end">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-75"
                        style={{ height: `${levelPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 w-full mt-1">
                    <span className="text-xs font-medium text-center truncate w-full text-muted-foreground group-hover:text-foreground transition-colors mb-1">
                      {channel.name}
                    </span>
                    <Button
                      variant={channel.muted ? "destructive" : "secondary"}
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => toggleAudioMute(channel.id)}
                    >
                      {channel.muted ? (
                        isMic ? <MicOff className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />
                      ) : (
                        isMic ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
