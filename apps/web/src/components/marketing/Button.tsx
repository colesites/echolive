import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";

interface BaseProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

type Props = BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">)
    | ({ href?: undefined } & Omit<
        ComponentProps<"button">,
        "children" | "className"
      >)
  );

const sizeStyles: Record<NonNullable<BaseProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] hover:bg-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.55)]",
  ghost: "text-zinc-300 hover:text-white",
  outline:
    "border border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  const cls = cn(base, sizeStyles[size], variantStyles[variant], className);
  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }
  const { href: _href, ...btnRest } = rest as { href?: undefined } & ComponentProps<"button">;
  return (
    <button type="button" className={cls} {...btnRest}>
      {children}
    </button>
  );
}
