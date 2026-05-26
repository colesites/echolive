import type { Metadata } from "next";
import { Container } from "@/components/marketing/Container";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
  SectionLead,
} from "@/components/marketing/Section";
import { PricingCards } from "@/components/marketing/PricingCards";
import { CTA } from "@/components/marketing/CTA";

export const metadata: Metadata = {
  title: "Pricing — Echo Live",
  description:
    "Simple monthly or yearly plans for creators, studios, and producers. Start streaming for $10/mo.",
};

const FAQ = [
  {
    q: "Can I switch plans later?",
    a: "Yes — upgrades take effect instantly and we prorate the difference. Downgrades apply at the end of your current billing period.",
  },
  {
    q: "Is there a free tier?",
    a: "Echo Live is free to download and self-host. The paid plans unlock cloud-hosted ingest, recordings, and team features.",
  },
  {
    q: "Do you offer refunds?",
    a: "Within 14 days of your first subscription payment, no questions asked.",
  },
  {
    q: "Do you offer non-profit pricing?",
    a: "Yes — churches, schools, and registered non-profits get 30% off any plan. Email hello@echolive.app with your registration info.",
  },
  {
    q: "What happens when I exceed cloud-recording hours?",
    a: "We never stop your stream. You'll get an email when you cross the threshold and recordings beyond your quota are kept for 7 days.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Section tight className="pt-24 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <SectionHeading className="mx-auto">
              Pick a plan that fits.
            </SectionHeading>
            <SectionLead className="mx-auto">
              Start small, scale to a full production team. No hidden fees, no
              usage traps.
            </SectionLead>
          </div>
        </Container>
      </Section>

      <Section tight className="pt-0">
        <Container>
          <PricingCards />
        </Container>
      </Section>

      <Section tight className="border-t border-zinc-900/80">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Frequently asked questions
          </h2>
          <dl className="mt-8 divide-y divide-zinc-900 rounded-2xl border border-zinc-900 bg-zinc-950/40">
            {FAQ.map((item) => (
              <div key={item.q} className="px-6 py-5">
                <dt className="text-sm font-semibold text-white">{item.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <CTA />
    </>
  );
}
