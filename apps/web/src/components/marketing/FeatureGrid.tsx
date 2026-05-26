"use client";

import { motion } from "framer-motion";
import type { Feature } from "@/lib/marketing-content";
import { Icon } from "./Icon";

interface Props {
  items: Feature[];
}

export function FeatureGrid({ items }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((feature, i) => (
        <FeatureCard key={feature.title} feature={feature} index={i} />
      ))}
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-950/80"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent transition-all duration-500 group-hover:via-red-500/60" />

      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-red-400 transition-all group-hover:border-red-500/40 group-hover:bg-red-500/10 group-hover:text-red-300">
        <Icon name={feature.icon} className="h-5 w-5" />
      </span>

      <h3 className="mt-5 text-base font-semibold text-white">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {feature.description}
      </p>
    </motion.div>
  );
}
