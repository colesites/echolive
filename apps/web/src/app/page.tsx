"use client";

import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Users, 
  Send, 
  Radio,
  MessageSquare
} from "lucide-react";
import Hls from "hls.js";

export default function PlaybackPage() {
  const stream = useQuery(api.streams.getLiveStream);
  const messages = useQuery(api.messages.list, stream ? { streamId: stream._id } : "skip");
  
  const sendMessage = useMutation(api.messages.send);
  const updateListeners = useMutation(api.streams.updateListeners);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [nickname, setNickname] = useState("");
  const [messageBody, setMessageBody] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Generate random guest nickname on mount
  useEffect(() => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setNickname(`Guest_${randomId}`);
  }, []);

  // Handle listener count tracking
  useEffect(() => {
    if (!stream) return;
    const streamId = stream._id;
    
    // Join stream
    updateListeners({ id: streamId, delta: 1 }).catch(console.error);

    return () => {
      // Leave stream
      updateListeners({ id: streamId, delta: -1 }).catch(console.error);
    };
  }, [stream, updateListeners]);

  // Handle HLS stream binding
  useEffect(() => {
    if (!stream || !stream.isLive) {
      if (isPlaying) {
        stopAudio();
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const streamUrl = "http://localhost:8888/live/stream/index.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 5,
        maxLiveSyncPlaybackRate: 1.5,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean }) => {
        if (data.fatal) {
          console.warn("HLS fatal error, retrying...", data);
          hls.startLoad();
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari support
      audio.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [stream]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error("Audio playback failed:", e));
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
      if (newVolume > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stream || !messageBody.trim()) return;

    sendMessage({
      streamId: stream._id,
      author: nickname.trim() || "Anonymous",
      body: messageBody.trim(),
    })
      .then(() => setMessageBody(""))
      .catch((err) => console.error("Failed to send chat:", err));
  };

  if (!stream) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0c1b] text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm tracking-wide">Connecting to Echo Live...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#0f0c1b] text-slate-200 font-sans">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Left Panel: Stream & Audio Player */}
      <div className="flex-1 flex flex-col p-6 md:p-10 justify-between gap-8 border-b md:border-b-0 md:border-r border-slate-800/50">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ECHO LIVE
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider ${
            stream.isLive 
              ? "bg-red-500/10 text-red-500 border border-red-500/20" 
              : "bg-slate-800/40 text-slate-400 border border-slate-700/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${stream.isLive ? "bg-red-500 animate-pulse" : "bg-slate-500"}`} />
            {stream.isLive ? "LIVE NOW" : "OFFLINE"}
          </div>
        </div>

        {/* Center: Audio player card */}
        <div className="flex flex-col items-center justify-center my-auto py-8">
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-3xl bg-slate-900/40 border border-slate-800/60 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Spinning Disc UI when live and playing */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)]" />
            
            <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner relative transition-transform duration-1000 ${
              isPlaying && stream.isLive ? "rotate-360 animate-spin-slow" : ""
            }`}>
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
              </div>
              
              {/* Pulsing rings around the player */}
              {isPlaying && stream.isLive && (
                <>
                  <div className="absolute -inset-2 rounded-full border border-indigo-500/20 animate-ping" />
                  <div className="absolute -inset-6 rounded-full border border-indigo-500/10 animate-ping [animation-delay:0.5s]" />
                </>
              )}
            </div>

            {/* Audio Waveform Visualization Indicator */}
            {isPlaying && stream.isLive ? (
              <div className="flex items-end gap-1 h-6 mt-8">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((v, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full animate-audio-bar" 
                    style={{ 
                      height: `${v * 4}px`,
                      animationDelay: `${i * 0.1}s`
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="h-6 mt-8 text-xs text-slate-500 font-medium italic tracking-wide">
                {stream.isLive ? "Press play to listen" : "Waiting for broadcast..."}
              </div>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
          <div className="text-center">
            <h2 className="text-lg font-bold truncate max-w-full">{stream.title}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5" />
              {stream.listeners} listener{stream.listeners !== 1 && "s"}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
            <button
              onClick={togglePlay}
              disabled={!stream.isLive}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !stream.isLive 
                  ? "bg-slate-800/40 text-slate-600 cursor-not-allowed" 
                  : isPlaying 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 flex items-center gap-3">
              <button 
                onClick={toggleMute}
                disabled={!stream.isLive}
                className="text-slate-400 hover:text-white transition-colors disabled:text-slate-600"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                disabled={!stream.isLive}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Chat Room */}
      <div className="w-full md:w-96 flex flex-col h-[500px] md:h-screen bg-slate-950/40 border-l border-slate-900">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm">Live Chat</span>
          </div>
          
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your name"
            maxLength={15}
            className="text-xs bg-slate-900/60 border border-slate-800 rounded-md px-2 py-1 outline-none text-slate-300 w-28 text-right font-medium"
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end">
          <div className="flex-1" />
          {messages && messages.length > 0 ? (
            [...messages].reverse().map((msg) => (
              <div key={msg._id} className="text-sm bg-slate-900/20 border border-slate-900/30 p-2.5 rounded-xl max-w-[85%] self-start">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-bold text-xs text-indigo-400">{msg.author}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed break-words">{msg.body}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-600 my-auto py-8">
              No messages yet. Say hello in the chat!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-slate-900 bg-slate-950/60">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 text-sm bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-600 text-slate-200 transition-colors"
            />
            <button
              type="submit"
              disabled={!messageBody.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
