"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  hlsUrl: string | null;
  /** Stream is live? Controls whether the play button is enabled. */
  isLive: boolean;
}

export function AudioPlayer({ hlsUrl, isLive }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);

  // Bind HLS source whenever it changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hlsUrl) return;

    setError(null);

    // ngrok-free shows an HTML interstitial on first request; bypass it
    // with a custom header. Sending it to non-ngrok hosts (like MediaMTX
    // on localhost) triggers a CORS preflight those hosts don't allow,
    // so gate it strictly on the URL.
    const isNgrok = /\.ngrok(-free)?\.(dev|app|io)/.test(hlsUrl);

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Conservative live tuning — pairs with mediamtx's `fmp4` variant
        // (2s segments). Trying to chase the edge too aggressively over
        // plain HTTP causes the player to thrash and surface "Lost
        // connection" errors instead of just buffering.
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        xhrSetup: isNgrok
          ? (xhr) => {
              xhr.setRequestHeader("ngrok-skip-browser-warning", "1");
            }
          : undefined,
      });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          console.warn("[echolive] HLS fatal:", data);
          setError("Lost connection to the stream. Retrying…");
          hls.startLoad();
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // iOS Safari uses the native HLS player — we can't inject headers
      // there. For ngrok, warm its session with one preflight fetch.
      if (isNgrok) {
        fetch(hlsUrl, {
          headers: { "ngrok-skip-browser-warning": "1" },
        }).catch(() => {});
      }
      audio.src = hlsUrl;
    } else {
      setError("Your browser doesn't support HLS playback.");
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hlsUrl]);

  // Apply volume / mute to the element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    audio.muted = muted;
  }, [volume, muted]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Playback failed.");
      }
    }
  };

  const canPlay = isLive && !!hlsUrl;

  return (
    <div className="w-full">
      <audio ref={audioRef} preload="none" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!canPlay}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full transition-all",
            canPlay
              ? "bg-red-600 text-white shadow-lg shadow-red-900/40 hover:scale-105 hover:bg-red-500"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed",
          )}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="h-7 w-7 fill-current ml-1" />
          )}
        </button>

        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted) setMuted(false);
            }}
            className="flex-1 accent-red-600"
            aria-label="Volume"
          />
          <span className="w-9 text-right font-mono text-xs text-zinc-500">
            {muted ? 0 : volume}
          </span>
        </div>
      </div>

      {/* VU bars — purely decorative, animate while playing. */}
      <div className="mt-6 flex h-8 items-end justify-center gap-1.5">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-1.5 rounded-full bg-gradient-to-t from-red-700 to-red-400",
              playing ? "animate-audio-bar" : "opacity-30",
            )}
            style={{
              height: `${30 + (i % 5) * 14}%`,
              animationDelay: `${(i * 80) % 1200}ms`,
            }}
          />
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
