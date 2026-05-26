import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/marketing/Container";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
  SectionLead,
} from "@/components/marketing/Section";
import { DownloadCards } from "@/components/marketing/DownloadCards";

export const metadata: Metadata = {
  title: "Download — Echo Live",
  description:
    "Download Echo Live for macOS, Windows, Linux, Android, and iOS.",
};

export default function DownloadPage() {
  return (
    <>
      <Section tight className="pt-24 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>Download</SectionEyebrow>
            <SectionHeading className="mx-auto">
              Get Echo Live for your device.
            </SectionHeading>
            <SectionLead className="mx-auto">
              Free to download, free to self-host. Sign in unlocks cloud
              ingest, recordings, and team features.
            </SectionLead>
          </div>
        </Container>
      </Section>

      <Section tight className="pt-0">
        <Container>
          <DownloadCards />
        </Container>
      </Section>

      <Section tight className="border-t border-zinc-900/80">
        <Container>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <SectionEyebrow>What you get</SectionEyebrow>
              <SectionHeading>The studio that fits in a window.</SectionHeading>
              <SectionLead>
                Scenes, mixers, encoders, scheduling, and analytics — all in
                one native app. Hardware-accelerated, low-CPU, and beautiful.
              </SectionLead>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-900">
              <Image
                src="/echolive-studio.png"
                alt="Echo Live studio preview"
                width={1280}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
