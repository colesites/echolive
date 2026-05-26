import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { Container } from "@/components/marketing/Container";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
  SectionLead,
} from "@/components/marketing/Section";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { PricingCards } from "@/components/marketing/PricingCards";
import { CTA } from "@/components/marketing/CTA";
import { FEATURES } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Echo Live — Modern livestreaming for creators",
  description:
    "Studio-grade audio and video streaming, remote production, and a wireless mobile camera in one elegant app.",
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section className="border-t border-zinc-900/80">
        <Container>
          <div className="max-w-2xl">
            <SectionEyebrow>Everything in one place</SectionEyebrow>
            <SectionHeading>The full broadcasting stack.</SectionHeading>
            <SectionLead>
              Audio, video, remote production, and a mobile camera — Echo Live
              replaces a dozen tools with one focused app.
            </SectionLead>
          </div>

          <div className="mt-14">
            <FeatureGrid items={FEATURES.slice(0, 9)} />
          </div>
        </Container>
      </Section>

      <ProductShowcase />

      <Section className="border-t border-zinc-900/80">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <SectionHeading className="mx-auto">
              Simple plans that scale with you.
            </SectionHeading>
            <SectionLead className="mx-auto">
              Start free, upgrade when you outgrow it. No surprises, no usage
              traps.
            </SectionLead>
          </div>

          <div className="mt-14">
            <PricingCards />
          </div>
        </Container>
      </Section>

      <CTA />
    </>
  );
}
