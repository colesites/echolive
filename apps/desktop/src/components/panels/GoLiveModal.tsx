import * as React from "react";
import { useRef, useState } from "react";
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

export interface GoLivePayload {
  mode: StreamMode;
  title: string;
  category: string;
  description: string;
  coverDataUrl: string | null;
  coverFile: File | null;
  audioCoverDataUrl: string | null;
  audioCoverFile: File | null;
}

interface GoLiveModalProps {
  onStart: (data: GoLivePayload) => void | Promise<void>;
}

const MAX_COVER_BYTES = 4 * 1024 * 1024; // 4 MB

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function GoLiveModal({ onStart }: GoLiveModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<StreamMode | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Just Chatting");
  const [description, setDescription] = useState("");
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioCoverDataUrl, setAudioCoverDataUrl] = useState<string | null>(null);
  const [audioCoverFile, setAudioCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioCoverInputRef = useRef<HTMLInputElement>(null);

  const pickCover = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setDataUrl: (v: string | null) => void,
    setFile: (v: File | null) => void,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Cover must be an image.");
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setError("Cover must be under 4 MB.");
      return;
    }
    setError(null);
    setDataUrl(await fileToDataUrl(file));
    setFile(file);
  };

  const handleNext = () => {
    if (mode) setStep(2);
  };

  const handleGoLive = async () => {
    if (!mode) return;
    setError(null);
    setSubmitting(true);
    try {
      await onStart({
        mode,
        title,
        category,
        description,
        coverDataUrl,
        coverFile,
        audioCoverDataUrl,
        audioCoverFile,
      });
      setOpen(false);
      setTimeout(() => {
        setStep(1);
        setMode(null);
        setTitle("");
        setDescription("");
        setCoverDataUrl(null);
        setCoverFile(null);
        setAudioCoverDataUrl(null);
        setAudioCoverFile(null);
      }, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
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
                  <CoverPicker
                    label={`Cover Image (${isAudioOnly ? "1:1" : "16:9"})`}
                    aspect={isAudioOnly ? "1:1" : "16:9"}
                    value={coverDataUrl}
                    onClear={() => {
                      setCoverDataUrl(null);
                      setCoverFile(null);
                    }}
                    onPick={() => coverInputRef.current?.click()}
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickCover(e, setCoverDataUrl, setCoverFile)}
                  />
                </div>

                {isBoth && (
                  <>
                    <CoverPicker
                      label="Audio Cover (1:1)"
                      aspect="1:1"
                      value={audioCoverDataUrl}
                      onClear={() => {
                        setAudioCoverDataUrl(null);
                        setAudioCoverFile(null);
                      }}
                      onPick={() => audioCoverInputRef.current?.click()}
                    />
                    <input
                      ref={audioCoverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        pickCover(e, setAudioCoverDataUrl, setAudioCoverFile)
                      }
                    />
                  </>
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

        {error && (
          <div className="mx-6 mb-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

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
              className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all disabled:opacity-60"
              onClick={handleGoLive}
              disabled={submitting || !title.trim()}
            >
              {submitting ? "Starting…" : "Start Streaming"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CoverPickerProps {
  label: string;
  aspect: "1:1" | "16:9";
  value: string | null;
  onPick: () => void;
  onClear: () => void;
}

function CoverPicker({ label, aspect, value, onPick, onClear }: CoverPickerProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      {value ? (
        <div className="relative h-[50px] w-full overflow-hidden rounded-lg border border-zinc-800">
          <img
            src={value}
            alt="Cover preview"
            className={cn(
              "h-full w-full object-cover",
              aspect === "1:1" ? "object-center" : "object-center",
            )}
          />
          <div className="absolute inset-0 flex items-center justify-end gap-2 bg-black/40 px-3 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={onPick}
              className="text-xs font-medium text-white hover:underline"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-red-300 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
        >
          <UploadCloud className="h-4 w-4" />
          Upload {aspect}
        </button>
      )}
    </div>
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
