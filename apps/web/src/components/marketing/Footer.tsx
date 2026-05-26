import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";

// Brand icons (lucide dropped these for license reasons — inline SVGs keep them safe).
function Github(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2H21l-6.523 7.46L22.5 22h-6.97l-4.59-5.99L5.65 22H3l7.02-8.02L1.5 2h7.13l4.14 5.47L18.244 2Zm-1.222 18.18h1.65L7.16 3.76H5.39l11.633 16.42Z" />
    </svg>
  );
}
function Youtube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.5 6.2c-.27-1.02-1.07-1.82-2.09-2.09C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.41.51C1.57 4.38.77 5.18.5 6.2 0 8.07 0 12 0 12s0 3.93.5 5.8c.27 1.02 1.07 1.82 2.09 2.09 1.86.51 9.41.51 9.41.51s7.55 0 9.41-.51c1.02-.27 1.82-1.07 2.09-2.09.5-1.87.5-5.8.5-5.8s0-3.93-.5-5.8ZM9.6 15.6V8.4l6.24 3.6L9.6 15.6Z" />
    </svg>
  );
}

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/download", label: "Download" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "https://docs.echolive.app", label: "Docs", external: true },
      { href: "https://status.echolive.app", label: "Status", external: true },
      { href: "mailto:hello@echolive.app", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-900 bg-black">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Modern livestreaming built for creators. Stream, control, create —
              from anywhere.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <SocialLink href="https://github.com/echolive" label="GitHub">
                <Github className="h-3.5 w-3.5" />
              </SocialLink>
              <SocialLink href="https://twitter.com/echolive" label="Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </SocialLink>
              <SocialLink href="https://youtube.com/@echolive" label="YouTube">
                <Youtube className="h-3.5 w-3.5" />
              </SocialLink>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Echo Live. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            All systems operational
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
    >
      {children}
    </a>
  );
}
