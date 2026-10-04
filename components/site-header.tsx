import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { MetricWordmark } from "./metric-wordmark";

type SiteHeaderProps = {
  fixed?: boolean;
  faqHref?: string;
  // Shown on the landing page only, for people who were signed out.
  signIn?: boolean;
};

export function SiteHeader({ fixed = false, faqHref = "/#faq", signIn = false }: SiteHeaderProps) {
  return (
    <header
      className={`mobile-safe-top-nav ${fixed ? "fixed top-0" : "relative"} z-50 flex w-full items-center px-5 sm:px-8 lg:px-10`}
      style={{
        background: "rgba(15,21,38,0.94)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #24304d",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 lg:gap-4">
      <Link href="/" aria-label="Metric Finance home" className="flex shrink-0 items-center gap-2.5" style={{ fontFamily: "Arial, sans-serif" }}>
        <Image src="/mf-icon.png" alt="" width={48} height={48} priority className="h-10 w-10 rounded-[11px] lg:h-[38px] lg:w-[38px] lg:rounded-[9px]" />
        {/* The full name shows on desktop; on phones and tablets the icon alone is the logo. */}
        <MetricWordmark className="hidden text-3xl font-bold leading-none tracking-[-0.04em] text-white lg:inline" />
      </Link>
      <div className="flex items-center gap-2 lg:gap-3">
      <nav className="hidden min-w-0 items-center gap-6 lg:flex" style={{ fontFamily: "Arial, sans-serif" }} aria-label="Main navigation">
        <Link href="/learn" className="px-1 py-2 text-base font-medium text-[#8993ab] transition-colors hover:text-white">
          Learn
        </Link>
        <Link href={faqHref} className="px-1 py-2 text-base font-medium text-[#8993ab] transition-colors hover:text-white">
          FAQ
        </Link>
        <Link href="/privacy" className="px-1 py-2 text-base font-medium text-[#8993ab] transition-colors hover:text-white">
          Privacy
        </Link>
        {signIn && (
          <Link
            href="/manage?signin=1"
            className="whitespace-nowrap rounded-xl border border-[#2b3a66] px-4 py-2 text-sm font-bold text-[#b3c9ff] transition hover:border-[#8fa8fa] hover:bg-[#8fa8fa]/10 hover:text-white"
          >
            Sign in
          </Link>
        )}
      </nav>
      {signIn && (
        <Link
          href="/manage?signin=1"
          className="flex h-9 items-center whitespace-nowrap rounded-lg border border-[#2b3a66] px-2.5 text-[13px] font-bold text-[#b3c9ff] transition hover:border-[#8fa8fa] hover:text-white lg:hidden"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          Sign in
        </Link>
      )}
      <details className="group relative lg:hidden">
        <summary
          aria-label="Open navigation menu"
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[#24304d] bg-[#182238] text-[#f4f5f7] transition hover:bg-[#24304d] [&::-webkit-details-marker]:hidden"
        >
          <Menu className="group-open:hidden" size={18} strokeWidth={2.25} />
          <X className="hidden group-open:block" size={18} strokeWidth={2.25} />
        </summary>
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-[#24304d] bg-[#0f1526] p-2 shadow-2xl shadow-black/60"
        >
          <Link href="/learn" className="block rounded-xl px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#182238]">
            Learn
          </Link>
          <Link
            href={faqHref}
            className="block rounded-xl px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#182238]"
          >
            FAQ
          </Link>
          <Link href="/privacy" className="block rounded-xl px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#182238]">
          Privacy
        </Link>
        </nav>
      </details>
      </div>
      </div>
    </header>
  );
}
