import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tight?: boolean;
}

export function Section({ className, tight, ...rest }: SectionProps) {
  return (
    <section
      className={cn(
        "relative",
        tight ? "py-16 sm:py-20" : "py-24 sm:py-32",
        className,
      )}
      {...rest}
    />
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-400",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg", className)}>
      {children}
    </p>
  );
}
