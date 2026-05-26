import Link from "next/link";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-white",
        className,
      )}
      aria-label="Echo Live home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_18px_rgba(220,38,38,0.45)] transition-shadow group-hover:shadow-[0_0_28px_rgba(220,38,38,0.65)]">
        <Radio className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-[15px] font-bold tracking-tight">Echo Live</span>
    </Link>
  );
}
