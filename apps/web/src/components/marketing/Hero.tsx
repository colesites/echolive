"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "./Button";
import { Container } from "./Container";
import { AnimatedBackground } from "./AnimatedBackground";
import { Icon } from "./Icon";
import { TRUST_BADGES } from "@/lib/marketing-content";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-24 sm:pb-32 sm:pt-32">
      <AnimatedBackground />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3.5 py-1 text-[11px] font-medium tracking-wide text-zinc-300 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            Now in private beta
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Modern livestreaming
            <br />
            <span className="bg-gradient-to-r from-white via-red-300 to-red-500 bg-clip-text text-transparent">
              built for creators
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Studio-grade audio and video streaming, remote production, and a
            wireless mobile camera — in one elegant app. Stream, control,
            create from anywhere.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button href="/download" size="lg">
              Start streaming
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/features" variant="outline" size="lg">
              <Play className="h-4 w-4" />
              See features
            </Button>
          </div>

          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-zinc-500">
            {TRUST_BADGES.map((b) => (
              <li key={b.label} className="flex items-center gap-1.5">
                <Icon name={b.icon} className="h-3.5 w-3.5 text-red-400" />
                {b.label}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          {/* Glow under the card */}
          <div className="absolute inset-x-0 -bottom-12 -top-8 -z-10 mx-12 rounded-[40px] bg-gradient-to-b from-red-500/30 via-red-500/10 to-transparent blur-3xl" />

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 shadow-[0_30px_90px_-20px_rgba(220,38,38,0.35)] backdrop-blur">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-zinc-900/80 bg-zinc-950/80 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-[11px] font-medium text-zinc-500">
                echolive.app — Studio
              </span>
            </div>

            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/echolive-studio.png"
                alt="Echo Live studio interface"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Floating badges */}
          <FloatingBadge
            className="left-[-2%] top-[18%] hidden sm:flex"
            delay={0.5}
            color="emerald"
            label="847 listeners"
            sub="On air now"
          />
          <FloatingBadge
            className="right-[-3%] bottom-[14%] hidden sm:flex"
            delay={0.7}
            color="red"
            label="1080p60"
            sub="High definition"
          />
        </motion.div>
      </Container>
    </section>
  );
}

function FloatingBadge({
  className,
  delay,
  color,
  label,
  sub,
}: {
  className?: string;
  delay: number;
  color: "emerald" | "red";
  label: string;
  sub: string;
}) {
  const dot = color === "emerald" ? "bg-emerald-400" : "bg-red-400";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-black/60 px-4 py-3 shadow-2xl backdrop-blur-xl ${className ?? ""}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dot} opacity-75`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-zinc-500">{sub}</p>
      </div>
    </motion.div>
  );
}
