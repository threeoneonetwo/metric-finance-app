import Link from "next/link";
import { Menu, X } from "lucide-react";

type SiteHeaderProps = {
  fixed?: boolean;
};

export async function SiteHeader({ fixed = false }: SiteHeaderProps) {
  return (
    <header
      className={`mobile-safe-top-nav ${fixed ? "fixed top-0" : "relative"} z-50 flex w-full items-center justify-between gap-4 px-4 sm:px-7 lg:px-10`}
      style={{
        background: "rgba(24,24,27,0.94)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #303034",
      }}
    >
      <Link href="/" className="shrink-0 text-3xl font-bold leading-none tracking-[-0.04em] text-white" style={{ fontFamily: "Arial, sans-serif" }}>
        Metric Finance
      </Link>
      <nav className="hidden min-w-0 items-center gap-6 sm:flex" style={{ fontFamily: "Arial, sans-serif" }} aria-label="Main navigation">
        <Link href="/#faq" className="px-1 py-2 text-base font-medium text-[#8e909f] transition-colors hover:text-white">
          FAQ
        </Link>
        <a
          href="https://metricfinance.notion.site/Privacy-Policy-377bc65fd7b380a7bb9af9f5df0b0911"
          target="_blank"
          rel="noreferrer"
          className="px-1 py-2 text-base font-medium text-[#8e909f] transition-colors hover:text-white"
        >
          Privacy
        </a>
      </nav>
      <details className="group relative sm:hidden">
        <summary
          aria-label="Open navigation menu"
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[#303034] bg-[#27272a] text-[#f4f4f5] transition hover:bg-[#303034] [&::-webkit-details-marker]:hidden"
        >
          <Menu className="group-open:hidden" size={18} strokeWidth={2.25} />
          <X className="hidden group-open:block" size={18} strokeWidth={2.25} />
        </summary>
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-[#303034] bg-[#18181b] p-2 shadow-2xl shadow-black/60"
        >
          <Link
            href="/#faq"
            className="block rounded-xl px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#27272a]"
          >
            FAQ
          </Link>
          <a
            href="https://metricfinance.notion.site/Privacy-Policy-377bc65fd7b380a7bb9af9f5df0b0911"
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#27272a]"
          >
            Privacy
          </a>
        </nav>
      </details>
    </header>
  );
}
