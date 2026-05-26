import { useStudioStore } from '../../store/studioStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { BoxSelect, Plus, Eye, EyeOff, MonitorPlay, Camera, Image as ImageIcon, Music, Globe, Network } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function SourceList() {
  const { activeSceneId, previewSceneId, isStudioMode, sources } = useStudioStore();
  
  const targetSceneId = isStudioMode ? previewSceneId : activeSceneId;
  const activeSources = targetSceneId ? (sources[targetSceneId] || []) : [];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'webcam': return <Camera className="w-4 h-4" />;
      case 'screen': return <MonitorPlay className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'browser': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'ndi': return <Network className="w-4 h-4 text-orange-400" />;
      default: return <BoxSelect className="w-4 h-4" />;
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <BoxSelect className="w-4 h-4" /> Sources
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 flex flex-col gap-1">
            {activeSources.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">
                No sources in this scene
              </div>
            ) : (
              activeSources.map((source) => (
                <div
                  key={source.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors group cursor-default"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/70">
                      {getSourceIcon(source.type)}
                    </span>
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    {source.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
