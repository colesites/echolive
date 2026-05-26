"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "./Button";
import { PRICING } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "yearly";

export function PricingCards() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div>
      <div className="flex justify-center">
        <BillingToggle cycle={cycle} onChange={setCycle} />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PRICING.map((plan, i) => (
          <motion.article
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className={cn(
              "relative flex flex-col rounded-2xl border p-7 transition-colors",
              plan.highlight
                ? "border-red-500/40 bg-gradient-to-b from-red-500/5 via-zinc-950/60 to-zinc-950/40 shadow-[0_30px_60px_-20px_rgba(220,38,38,0.35)]"
                : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-700",
            )}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300 backdrop-blur">
                Most popular
              </span>
            )}

            <header>
              <h3 className="text-xl font-bold tracking-tight text-white">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
            </header>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight text-white">
                ${cycle === "monthly" ? plan.monthly : Math.round(plan.yearly / 12)}
              </span>
              <span className="text-sm text-zinc-500">/ month</span>
            </div>
            {cycle === "yearly" && (
              <p className="mt-1 text-[11px] text-zinc-500">
                Billed ${plan.yearly} yearly — save{" "}
                <span className="text-emerald-400">
                  ${plan.monthly * 12 - plan.yearly}
                </span>
              </p>
            )}

            <ul className="mt-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      plan.highlight ? "text-red-400" : "text-emerald-400",
                    )}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                href="/download"
                variant={plan.highlight ? "primary" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          </motion.article>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-zinc-500">
        All plans include unlimited stream keys, basic chat, and TLS-encrypted
        ingest. Cancel anytime.
      </p>
    </div>
  );
}

function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: Cycle;
  onChange: (c: Cycle) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/60 p-1"
    >
      {(["monthly", "yearly"] as const).map((c) => (
        <button
          key={c}
          type="button"
          role="tab"
          aria-selected={cycle === c}
          onClick={() => onChange(c)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
            cycle === c ? "text-white" : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {cycle === c && (
            <motion.span
              layoutId="cycle-bg"
              className="absolute inset-0 rounded-full bg-red-600"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">
            {c === "monthly" ? "Monthly" : "Yearly"}
            {c === "yearly" && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                -20%
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
