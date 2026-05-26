"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Section, SectionEyebrow, SectionHeading, SectionLead } from "./Section";
import { SCREENSHOTS } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

const TILES = [
  { idx: 0, size: "tall", className: "row-span-2" },
  { idx: 1, size: "square", className: "" },
  { idx: 2, size: "square", className: "" },
  { idx: 3, size: "wide", className: "md:col-span-2" },
  { idx: 4, size: "square", className: "" },
] as const;

export function ProductShowcase() {
  return (
    <Section className="border-t border-zinc-900/80">
      <Container>
        <div className="text-center">
          <SectionEyebrow>Inside Echo Live</SectionEyebrow>
          <SectionHeading className="mx-auto">
            One app. The whole production.
          </SectionHeading>
          <SectionLead className="mx-auto">
            From the studio to the dashboard, every surface is designed for
            speed, clarity, and focus.
          </SectionLead>
        </div>

        <div className="mt-16 grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3">
          {TILES.map((t, i) => {
            const shot = SCREENSHOTS[t.idx];
            if (!shot) return null;
            return (
              <motion.figure
                key={shot.src}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950",
                  t.className,
                )}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-white">
                  {shot.caption}
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
