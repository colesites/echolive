import React from 'react';
import { useStudioStore } from '../../store/studioStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Layers, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function SceneSelector() {
  const { scenes, activeSceneId, previewSceneId, isStudioMode, setActiveScene, setPreviewScene, transitionType, setTransitionType } = useStudioStore();

  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layers className="w-4 h-4" /> Scenes
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {scenes.map((scene) => {
              const isActive = activeSceneId === scene.id;
              const isPreview = previewSceneId === scene.id && isStudioMode;
              
              return (
                <div
                  key={scene.id}
                  onClick={() => isStudioMode ? setPreviewScene(scene.id) : setActiveScene(scene.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all border border-transparent",
                    isActive && !isStudioMode
                      ? "bg-primary/20 text-primary border-primary/30"
                      : isActive && isStudioMode
                      ? "bg-red-500/20 text-red-500 border-red-500/30"
                      : isPreview
                      ? "bg-green-500/20 text-green-500 border-green-500/30"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-sm font-medium flex items-center gap-2">
                    {scene.name}
                  </span>
                  {(isActive || isPreview) && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="h-12 border-t border-border flex items-center px-3 justify-between bg-secondary/30 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transition
          </div>
          <select 
            value={transitionType}
            onChange={(e) => setTransitionType(e.target.value as any)}
            className="bg-background border border-border text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground"
          >
            <option value="Cut">Cut</option>
            <option value="Fade">Fade (300ms)</option>
            <option value="Swipe">Swipe</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
