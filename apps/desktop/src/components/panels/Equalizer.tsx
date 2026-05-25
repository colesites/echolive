import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { RotateCcw, Power, ChevronDown } from 'lucide-react';

// ─── EQ Band Configuration ────────────────────────────────────────────────────
const EQ_BANDS = [
  { id: 0, freq: 32, label: '32',   type: 'lowshelf' },
  { id: 1, freq: 64, label: '64',   type: 'peaking' },
  { id: 2, freq: 125, label: '125',  type: 'peaking' },
  { id: 3, freq: 250, label: '250',  type: 'peaking' },
  { id: 4, freq: 500, label: '500',  type: 'peaking' },
  { id: 5, freq: 1000, label: '1K',  type: 'peaking' },
  { id: 6, freq: 2000, label: '2K',  type: 'peaking' },
  { id: 7, freq: 4000, label: '4K',  type: 'peaking' },
  { id: 8, freq: 8000, label: '8K',  type: 'peaking' },
  { id: 9, freq: 16000, label: '16K', type: 'highshelf' },
] as const;

const PRESETS: Record<string, number[]> = {
  'Flat':       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Vocal Boost':[0, 0, 0, 2, 4, 6, 4, 2, 0, 0],
  'Bass Boost': [8, 6, 4, 2, 0, 0, 0, 0, 0, 0],
  'Treble Boost':[0, 0, 0, 0, 0, 0, 2, 4, 6, 8],
  'Podcast':    [2, 1, 0, 3, 5, 6, 4, 2, 1, 0],
  'Radio':      [4, 3, 0, 0, 2, 4, 5, 4, 3, 2],
  'De-Ess':     [0, 0, 0, 0, 0, -2, -4, -3, 0, 0],
  'Warmth':     [3, 2, 1, 0, -1, -1, 0, 0, 1, 2],
};

const DB_RANGE = 12;
const DB_TICKS = [-12, -6, 0, 6, 12];
const CANVAS_PADDING = 40;

export function Equalizer() {
  const [gains, setGains] = useState<number[]>(PRESETS['Flat']);
  const [enabled, setEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('Flat');
  const [activeBand, setActiveBand] = useState<number | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setGain = useCallback((bandId: number, value: number) => {
    setGains(prev => {
      const next = [...prev];
      next[bandId] = Math.max(-DB_RANGE, Math.min(DB_RANGE, value));
      return next;
    });
    setSelectedPreset('Custom');
  }, []);

  const applyPreset = useCallback((name: string) => {
    if (PRESETS[name]) {
      setGains([...PRESETS[name]]);
      setSelectedPreset(name);
    }
    setShowPresets(false);
  }, []);

  const resetEQ = useCallback(() => {
    setGains(PRESETS['Flat']);
    setSelectedPreset('Flat');
  }, []);

  // ─── Draw EQ Curve ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    // Horizontal grid lines
    for (const db of DB_TICKS) {
      const y = H / 2 - (db / DB_RANGE) * (H / 2 - 20);
      ctx.beginPath();
      ctx.moveTo(CANVAS_PADDING, y);
      ctx.lineTo(W - 10, y);
      ctx.stroke();
    }
    // Vertical grid lines for each band
    for (let i = 0; i < EQ_BANDS.length; i++) {
      const x = CANVAS_PADDING + (i / (EQ_BANDS.length - 1)) * (W - CANVAS_PADDING - 10);
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, H - 10);
      ctx.stroke();
    }

    // dB labels
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (const db of DB_TICKS) {
      const y = H / 2 - (db / DB_RANGE) * (H / 2 - 20);
      ctx.fillText(`${db > 0 ? '+' : ''}${db}`, CANVAS_PADDING - 8, y + 3);
    }

    // Zero line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_PADDING, H / 2);
    ctx.lineTo(W - 10, H / 2);
    ctx.stroke();

    if (!enabled) {
      // Disabled state — flat gray line
      ctx.strokeStyle = 'rgba(100,100,100,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CANVAS_PADDING, H / 2);
      ctx.lineTo(W - 10, H / 2);
      ctx.stroke();
      return;
    }

    // Build points
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < EQ_BANDS.length; i++) {
      const x = CANVAS_PADDING + (i / (EQ_BANDS.length - 1)) * (W - CANVAS_PADDING - 10);
      const y = H / 2 - (gains[i] / DB_RANGE) * (H / 2 - 20);
      points.push({ x, y });
    }

    // Fill area under curve
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
    gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    gradient.addColorStop(1, 'rgba(236, 72, 153, 0.15)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, H / 2);
    // Smooth curve using cardinal spline
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.lineTo(points[i].x, points[i].y);
      } else {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
    }
    ctx.lineTo(points[points.length - 1].x, H / 2);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw curve line
    const lineGradient = ctx.createLinearGradient(0, 0, W, 0);
    lineGradient.addColorStop(0, '#6366f1');
    lineGradient.addColorStop(0.5, '#a855f7');
    lineGradient.addColorStop(1, '#ec4899');

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        ctx.moveTo(points[i].x, points[i].y);
      } else {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw control dots
    for (let i = 0; i < points.length; i++) {
      const isActive = activeBand === i;
      const { x, y } = points[i];

      // Glow
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.fill();
      }

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#a855f7' : '#6366f1';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }, [gains, enabled, activeBand]);

  // ─── Mouse Interaction ─────────────────────────────────────────────────────
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = rect.width;
    const H = rect.height;

    // Find closest band
    let closestBand = -1;
    let closestDist = Infinity;
    for (let i = 0; i < EQ_BANDS.length; i++) {
      const x = CANVAS_PADDING + (i / (EQ_BANDS.length - 1)) * (W - CANVAS_PADDING - 10);
      const y = H / 2 - (gains[i] / DB_RANGE) * (H / 2 - 20);
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < closestDist && dist < 30) {
        closestDist = dist;
        closestBand = i;
      }
    }

    if (closestBand >= 0) {
      setActiveBand(closestBand);

      const handleMouseMove = (ev: MouseEvent) => {
        const ry = ev.clientY - rect.top;
        const dbVal = -((ry - H / 2) / (H / 2 - 20)) * DB_RANGE;
        setGain(closestBand, Math.round(dbVal * 2) / 2);
      };

      const handleMouseUp = () => {
        setActiveBand(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  }, [gains, enabled, setGain]);

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] text-white select-none overflow-hidden">

      {/* ─── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0 bg-[#111114]">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Equalizer
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">10-Band Parametric</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEQ}
            className="text-xs text-zinc-400 hover:text-white h-7 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
          <button
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all",
              enabled
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700"
            )}
          >
            <Power className="w-3.5 h-3.5" />
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ─── Preset Selector ──────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 border-b border-zinc-800/40 flex items-center gap-3 bg-[#0e0e11] shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">Preset</span>
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors min-w-[140px] justify-between"
          >
            {selectedPreset}
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showPresets && "rotate-180")} />
          </button>
          {showPresets && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    selectedPreset === name
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── EQ Curve Canvas ──────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 relative px-2 pt-4 pb-2 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair rounded-xl"
          onMouseDown={handleCanvasMouseDown}
        />
      </div>

      {/* ─── Band Sliders ─────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="grid grid-cols-10 gap-1">
          {EQ_BANDS.map((band) => {
            const gain = gains[band.id];
            const percent = ((gain + DB_RANGE) / (DB_RANGE * 2)) * 100;
            return (
              <div key={band.id} className="flex flex-col items-center gap-1.5">
                {/* Gain value */}
                <span className={cn(
                  "text-[10px] font-mono tabular-nums font-medium w-10 text-center transition-colors",
                  !enabled ? "text-zinc-700" :
                  gain > 0 ? "text-green-400" : gain < 0 ? "text-red-400" : "text-zinc-500"
                )}>
                  {gain > 0 ? '+' : ''}{gain.toFixed(1)}
                </span>

                {/* Vertical slider track */}
                <div className="relative w-5 h-24 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  {/* Zero line */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-700" />
                  {/* Fill */}
                  {enabled && gain !== 0 && (
                    <div
                      className="absolute left-0.5 right-0.5 rounded-full transition-all"
                      style={{
                        background: gain > 0
                          ? 'linear-gradient(to top, rgba(99,102,241,0.5), rgba(168,85,247,0.7))'
                          : 'linear-gradient(to bottom, rgba(239,68,68,0.4), rgba(239,68,68,0.7))',
                        top: gain > 0 ? `${100 - percent}%` : '50%',
                        bottom: gain > 0 ? '50%' : `${percent}%`,
                      }}
                    />
                  )}
                  {/* Thumb */}
                  <input
                    type="range"
                    min={-DB_RANGE}
                    max={DB_RANGE}
                    step={0.5}
                    value={gain}
                    onChange={(e) => setGain(band.id, parseFloat(e.target.value))}
                    disabled={!enabled}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
                  />
                  {/* Visual thumb */}
                  <div
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 w-4 h-2 rounded-full border transition-colors",
                      enabled
                        ? "bg-zinc-200 border-zinc-100 shadow-[0_0_6px_rgba(168,85,247,0.4)]"
                        : "bg-zinc-700 border-zinc-600"
                    )}
                    style={{ top: `calc(${100 - percent}% - 4px)` }}
                  />
                </div>

                {/* Frequency label */}
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  enabled ? "text-zinc-400" : "text-zinc-700"
                )}>
                  {band.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hz label row */}
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[9px] text-zinc-600">Low</span>
          <span className="text-[9px] text-zinc-600">Hz</span>
          <span className="text-[9px] text-zinc-600">High</span>
        </div>
      </div>
    </div>
  );
}
