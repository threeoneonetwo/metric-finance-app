import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type SiteHeaderProps = {
  fixed?: boolean;
  faqHref?: string;
};

export function SiteHeader({ fixed = false, faqHref = "/#faq" }: SiteHeaderProps) {
  return (
    <header
      className={`mobile-safe-top-nav ${fixed ? "fixed top-0" : "relative"} z-50 flex w-full items-center px-5 sm:px-8 lg:px-10`}
      style={{
        background: "rgba(15,21,38,0.94)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #24304d",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
      <Link href="/" aria-label="Metric Finance home" className="flex shrink-0 items-center" style={{ fontFamily: "Arial, sans-serif" }}>
        <Image src="/mf-icon.png" alt="Metric Finance" width={48} height={48} priority className="h-10 w-10 rounded-[11px] sm:h-12 sm:w-12 sm:rounded-[13px]" />
      </Link>
      <nav className="hidden min-w-0 items-center gap-6 sm:flex" style={{ fontFamily: "Arial, sans-serif" }} aria-label="Main navigation">
        <Link href={faqHref} className="px-1 py-2 text-base font-medium text-[#8993ab] transition-colors hover:text-white">
          FAQ
        </Link>
        <Link href="/privacy" className="px-1 py-2 text-base font-medium text-[#8993ab] transition-colors hover:text-white">
          Privacy
        </Link>
      </nav>
      <details className="group relative sm:hidden">
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
    </header>
  );
}
