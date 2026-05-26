import type { Metadata } from "next";
import { Container } from "@/components/marketing/Container";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
  SectionLead,
} from "@/components/marketing/Section";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CTA } from "@/components/marketing/CTA";
import { FEATURES } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Features — Echo Live",
  description:
    "Everything you need to broadcast: audio + video, remote control, wireless mobile camera, multistream, analytics, recordings, and more.",
};

export default function FeaturesPage() {
  return (
    <>
      <Section tight className="pt-24 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>Features</SectionEyebrow>
            <SectionHeading className="mx-auto">
              A complete broadcast toolkit.
            </SectionHeading>
            <SectionLead className="mx-auto">
              From the first byte off your microphone to the last viewer who
              clicks away — Echo Live owns the entire pipeline.
            </SectionLead>
          </div>
        </Container>
      </Section>

      <Section tight className="pt-0">
        <Container>
          <FeatureGrid items={FEATURES} />
        </Container>
      </Section>

      <CTA />
    </>
  );
}
