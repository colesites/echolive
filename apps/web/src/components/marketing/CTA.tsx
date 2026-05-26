"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Container } from "./Container";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-900 bg-gradient-to-br from-zinc-950 via-zinc-950 to-black p-12 text-center sm:p-16"
        >
          {/* Red wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-12 -z-10"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(220,38,38,0.18), transparent 60%)",
            }}
          />

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to go live?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-400">
            Download Echo Live for your platform and stream your first show in
            under five minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button href="/download" size="lg">
              Download free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/pricing" variant="outline" size="lg">
              See pricing
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
