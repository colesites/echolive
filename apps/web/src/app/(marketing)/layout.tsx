import type { ReactNode } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black text-zinc-100">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
