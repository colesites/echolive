import { useStudioStore } from '../../store/studioStore';
import { Card } from '../ui/card';
import { Monitor, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

export function PreviewStage() {
  const { 
    isStudioMode, activeSceneId, previewSceneId, scenes, transitionPreviewToActive 
  } = useStudioStore();
  
  const activeScene = scenes.find((s) => s.id === activeSceneId);
  const previewScene = scenes.find((s) => s.id === previewSceneId);

  const DisplayScreen = ({ scene, label, isLive }: { scene: any, label: string, isLive: boolean }) => (
    <div className="relative flex-1 bg-black overflow-hidden flex flex-col border border-border shadow-2xl rounded-lg h-full">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
        <span className="text-xs font-bold tracking-widest text-white uppercase">{label}</span>
      </div>
      
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-grid-white/[0.02] bg-[size:32px_32px]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={scene?.id || 'none'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <Monitor className="w-12 h-12 text-muted-foreground/30" />
            <h2 className="text-xl font-bold text-white/50 tracking-wide">
              {scene?.name || 'No Scene Selected'}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-7 border-t border-border/50 bg-black/40 backdrop-blur-md flex items-center px-4 justify-between text-[10px] text-muted-foreground">
        <span>1920x1080 • 60 FPS</span>
        <span>{isLive ? 'LIVE' : 'READY'}</span>
      </div>
    </div>
  );

  return (
    <Card className="relative flex-1 bg-background/50 flex flex-col border-none shadow-none p-0 overflow-hidden gap-4">
      <div className="flex-1 flex gap-4 overflow-hidden p-2">
        {isStudioMode ? (
          <>
            <DisplayScreen scene={previewScene} label="Preview" isLive={false} />
            <div className="flex flex-col items-center justify-center gap-2 px-2 shrink-0">
               <Button size="icon" variant="outline" onClick={transitionPreviewToActive} className="rounded-full w-12 h-12 border-primary/50 text-primary hover:bg-primary/20">
                 <ArrowRight className="w-5 h-5" />
               </Button>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transition</span>
            </div>
            <DisplayScreen scene={activeScene} label="Program" isLive={true} />
          </>
        ) : (
          <DisplayScreen scene={activeScene} label="Program" isLive={true} />
        )}
      </div>
      
      <div className="h-10 border-t border-border bg-card flex items-center px-4 justify-between text-xs text-muted-foreground shrink-0 rounded-b-xl">
        <div className="flex gap-4">
          <span>CPU: 12%</span>
          <span>RAM: 1.2 GB</span>
        </div>
        <span>0 Dropped Frames</span>
      </div>
    </Card>
  );
}
