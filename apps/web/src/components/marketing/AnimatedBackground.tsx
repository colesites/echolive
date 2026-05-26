"use client";

import { motion } from "framer-motion";

/**
 * Hero backdrop: subtle grid, two slow-pulsing radial gradient blobs,
 * and a vignette. Pure CSS+SVG so it's cheap, GPU-friendly, and renders
 * server-side first paint as static.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      {/* Red glow */}
      <motion.div
        className="absolute left-1/2 top-[-20%] h-[640px] w-[640px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(220,38,38,0.45), rgba(220,38,38,0) 60%)",
          filter: "blur(40px)",
        }}
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Soft amber accent */}
      <motion.div
        className="absolute -bottom-32 right-[-15%] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(244,63,94,0.28), rgba(244,63,94,0) 60%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
