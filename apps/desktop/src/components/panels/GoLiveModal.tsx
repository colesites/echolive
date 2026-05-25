import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Radio, MonitorPlay, Mic, Image as ImageIcon, UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";

type StreamMode = "video+audio" | "audio-only" | "both";

interface GoLiveModalProps {
  onStart: (data: any) => void;
}

export function GoLiveModal({ onStart }: GoLiveModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<StreamMode | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Just Chatting");
  const [description, setDescription] = useState("");

  const handleNext = () => {
    if (mode) setStep(2);
  };

  const handleGoLive = () => {
    onStart({ mode, title, category, description });
    setOpen(false);
    // Reset state after close
    setTimeout(() => {
      setStep(1);
      setMode(null);
      setTitle("");
      setDescription("");
    }, 300);
  };

  const isAudioOnly = mode === "audio-only";
  const isBoth = mode === "both";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-8 h-12 rounded-full font-bold tracking-wide transition-all duration-300 hover:scale-105 group relative overflow-hidden">
          <span className="relative z-10 flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" />
            GO LIVE
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] border-zinc-800/50 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              {step === 1 ? "Select Stream Mode" : "Stream Details"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {step === 1 ? "Choose how you want to broadcast today." : "Set up your event information before going live."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 relative min-h-[360px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-3 gap-4 h-full"
              >
                <ModeCard
                  icon={<MonitorPlay className="w-8 h-8" />}
                  title="Video + Audio"
                  desc="Full interactive stream"
                  selected={mode === "video+audio"}
                  onClick={() => setMode("video+audio")}
                />
                <ModeCard
                  icon={<Mic className="w-8 h-8" />}
                  title="Audio Only"
                  desc="Podcast or radio style"
                  selected={mode === "audio-only"}
                  onClick={() => setMode("audio-only")}
                />
                <ModeCard
                  icon={<Radio className="w-8 h-8" />}
                  title="Simulcast"
                  desc="Both video and audio endpoints"
                  selected={mode === "both"}
                  onClick={() => setMode("both")}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5 h-full"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stream Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Late Night Vibes"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none"
                    >
                      <option>Just Chatting</option>
                      <option>Gaming</option>
                      <option>Music</option>
                      <option>Podcast</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cover Image</label>
                    <button className="w-full h-[50px] border border-dashed border-zinc-700 bg-zinc-900/30 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      Upload {isAudioOnly ? "1:1" : "16:9"}
                    </button>
                  </div>
                </div>

                {isBoth && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Audio Cover (1:1)</label>
                    <button className="w-full h-[50px] border border-dashed border-zinc-700 bg-zinc-900/30 rounded-lg flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      Upload 1:1 Image
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell your viewers what this is about..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none h-20"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 pt-0 flex justify-between items-center bg-zinc-950/80 border-t border-zinc-800/50 mt-4 h-20">
          {step === 2 ? (
            <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setStep(1)}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step === 1 ? (
            <Button
              className="bg-zinc-100 text-zinc-900 hover:bg-white rounded-full px-8 font-medium"
              disabled={!mode}
              onClick={handleNext}
            >
              Next Step
            </Button>
          ) : (
            <Button
              className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
              onClick={handleGoLive}
            >
              Start Streaming
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModeCard({ icon, title, desc, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-center transition-all duration-300",
        selected
          ? "border-red-500 bg-red-500/10 text-white shadow-[0_0_30px_rgba(220,38,38,0.15)]"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800/60 hover:border-zinc-700"
      )}
    >
      <div className={cn("p-3 rounded-full", selected ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-300")}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
