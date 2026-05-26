import type { Metadata } from "next";
import { Container } from "@/components/marketing/Container";

export const metadata: Metadata = {
  title: "Privacy Policy — Echo Live",
  description: "How Echo Live handles your data.",
};

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "data-we-collect", title: "Data we collect" },
  { id: "how-we-use-it", title: "How we use it" },
  { id: "sharing", title: "Sharing" },
  { id: "storage", title: "Storage & retention" },
  { id: "your-rights", title: "Your rights" },
  { id: "cookies", title: "Cookies" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <section className="pt-20 sm:pt-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              On this page
            </p>
            <nav className="mt-4 flex flex-col gap-1 text-sm">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="prose prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:mt-12 prose-h2:text-2xl prose-p:leading-relaxed prose-p:text-zinc-300 prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white max-w-none pb-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-400">
              Privacy policy
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              We respect your stream.
            </h1>
            <p className="mt-3 text-sm text-zinc-500">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>

            <h2 id="overview">Overview</h2>
            <p>
              Echo Live is a livestreaming platform. We collect the minimum
              information required to make broadcasts work, surface useful
              analytics, and keep your account secure — nothing more.
            </p>

            <h2 id="data-we-collect">Data we collect</h2>
            <ul className="ml-5 list-disc text-zinc-300 [&>li]:my-2 [&>li]:leading-relaxed">
              <li>
                <strong>Account</strong>: email, name, profile picture (if you
                sign in with Google), and the organisations you belong to.
              </li>
              <li>
                <strong>Streams</strong>: titles, cover images, slugs, start/end
                times, and viewer counts.
              </li>
              <li>
                <strong>Chat & presence</strong>: chat messages and anonymous
                session ids while you're on a listener page.
              </li>
              <li>
                <strong>Diagnostics</strong>: app version, OS, and crash
                reports — never the contents of your stream.
              </li>
            </ul>

            <h2 id="how-we-use-it">How we use it</h2>
            <p>
              To operate Echo Live: authenticate you, route streams, fan out
              chat, generate analytics, and email transactional notices like
              password resets and invitations. We don't sell your data. We
              don't use it to train AI models.
            </p>

            <h2 id="sharing">Sharing</h2>
            <p>
              We share data only with the sub-processors we need to run the
              service: Convex (database + realtime), Resend (email), and
              Cloudflare (CDN + storage). Each is bound by a written data
              processing agreement.
            </p>

            <h2 id="storage">Storage & retention</h2>
            <p>
              Account data lives until you delete your account. Stream metadata
              and chat are retained for as long as the stream exists; you can
              delete a stream at any time and its data is hard-deleted within
              30 days. Cloud recordings live for the duration tied to your
              plan, after which they are permanently destroyed.
            </p>

            <h2 id="your-rights">Your rights</h2>
            <p>
              Wherever you live, you can ask us to access, correct, export, or
              delete your data. Email <a href="mailto:privacy@echolive.app">privacy@echolive.app</a>
              {" "}and we'll respond within 30 days.
            </p>

            <h2 id="cookies">Cookies</h2>
            <p>
              We use a minimal set of first-party cookies for authentication
              and theme preferences. We do not use third-party advertising
              cookies. Browser localStorage is used for chat name and listener
              session ids only.
            </p>

            <h2 id="children">Children</h2>
            <p>
              Echo Live isn't directed at children under 13. If we discover
              we've collected information from a child, we delete it.
            </p>

            <h2 id="changes">Changes</h2>
            <p>
              We'll notify you of material changes by email or in-app banner at
              least 14 days before they take effect.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              Questions or requests? Email{" "}
              <a href="mailto:privacy@echolive.app">privacy@echolive.app</a>.
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
