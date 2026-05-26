"use client";

import { motion } from "framer-motion";
import { Apple, ArrowDown, Smartphone, AppWindow } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

type Platform = {
  name: string;
  tagline: string;
  icon: typeof Apple;
  comingSoon?: boolean;
  download?: string;
  requirements: string[];
};

const PLATFORMS: Platform[] = [
  {
    name: "macOS",
    tagline: "Apple silicon + Intel · Universal binary",
    icon: Apple,
    download: "/download/macos",
    requirements: ["macOS 12 Monterey or later", "Apple silicon or Intel x86_64", "200 MB free"],
  },
  {
    name: "Windows",
    tagline: "Windows 10 & 11 · x64",
    icon: AppWindow,
    download: "/download/windows",
    requirements: ["Windows 10 (1909) or later", "x86_64 processor", "250 MB free"],
  },
  {
    name: "Linux",
    tagline: "AppImage + .deb · x86_64 / arm64",
    icon: AppWindow,
    download: "/download/linux",
    requirements: ["Ubuntu 22.04 or compatible", "WebKitGTK 4.1", "200 MB free"],
  },
  {
    name: "Android",
    tagline: "Phone & tablet · API 26+",
    icon: Smartphone,
    download: "/download/android",
    requirements: ["Android 8.0 or later", "ARMv8 / ARMv7", "80 MB free"],
  },
  {
    name: "iOS",
    tagline: "iPhone & iPad",
    icon: Apple,
    comingSoon: true,
    requirements: ["iOS 16 or later", "iPhone 11 or newer recommended"],
  },
];

export function DownloadCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {PLATFORMS.map((p, i) => (
        <PlatformCard key={p.name} platform={p} index={i} />
      ))}
    </div>
  );
}

function PlatformCard({
  platform,
  index,
}: {
  platform: Platform;
  index: number;
}) {
  const Icon = platform.icon;
  const disabled = platform.comingSoon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-zinc-950/40 p-6 transition-colors",
        disabled
          ? "border-zinc-900 opacity-60"
          : "border-zinc-900 hover:border-zinc-700",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
          <Icon className="h-5 w-5 text-zinc-200" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-white">{platform.name}</h3>
          <p className="text-xs text-zinc-500">{platform.tagline}</p>
        </div>
        {disabled && (
          <span className="ml-auto rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Soon
          </span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-1.5 text-xs text-zinc-500">
        {platform.requirements.map((r) => (
          <li key={r} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-zinc-700" />
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {disabled ? (
          <Button variant="outline" className="w-full opacity-60" size="sm">
            Coming soon
          </Button>
        ) : (
          <Button href={platform.download!} className="w-full" size="sm">
            <ArrowDown className="h-3.5 w-3.5" />
            Download
          </Button>
        )}
      </div>
    </motion.div>
  );
}
