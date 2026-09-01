import { LandingViewEvent } from "@/components/analytics-events";
import { DarkHomeFaq } from "@/components/home-faq";
import { HeroHeadline } from "@/components/hero-headline";
import { OnboardingJourney } from "@/components/onboarding-journey";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TickerSearch } from "@/components/ticker-search";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";

export default function Home() {
  return (
    <main className="homepage relative min-h-screen flex flex-col">
      <LandingViewEvent />
      <OnboardingJourney />

      {/* Background */}
      <div className="homepage-texture fixed inset-0 -z-10" />

      <SiteHeader fixed />

      {/* Content */}
      <div className="mobile-safe-home-content relative mx-auto flex w-full max-w-xl flex-col items-center px-5 sm:px-8 lg:max-w-4xl lg:px-10 xl:max-w-5xl" style={{ paddingBottom: "7rem", gap: "5.5rem" }}>

        {/* ── Hero ── */}
        <section className="w-full text-center lg:max-w-4xl" style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>

          {/* Headline */}
          <div className="animate-entrance delay-2 w-full">
            <HeroHeadline />
          </div>

          {/* Search */}
          <div id="ticker-search" className="w-full scroll-mt-20 animate-entrance delay-3" style={{ position: "relative", zIndex: 9999, isolation: "isolate" }}>
            <TickerSearch dark />
          </div>

        </section>


        {/* ── Testimonials ── */}
        <section className="animate-entrance delay-4 -mt-8 w-full sm:-mt-10 lg:-mt-14">
          <TestimonialsCarousel />
        </section>

        {/* ── FAQ ── */}
        <div id="faq" className="-mt-8 w-full scroll-mt-20 sm:-mt-10 lg:-mt-14">
          <DarkHomeFaq />
        </div>

        {/* ── CTA ── */}
        <section className="mx-auto w-full max-w-[40rem] text-center" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            className="dark-tile px-5 py-7 sm:px-8 sm:py-8"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <h2 className="mb-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">Understand stocks like a pro</h2>
            <p className="mx-auto mb-6 max-w-lg text-sm font-normal leading-6 text-[#8e909f]">Search any publicly listed company &amp; get a full breakdown of its financials in seconds.</p>
            <a
              href="#ticker-search"
              className="inline-flex items-center gap-2.5 border border-[#3f3f46] bg-[#27272a] px-6 py-3 text-sm font-bold text-[#f4f4f5] transition-all hover:-translate-y-0.5 hover:bg-[#303034] active:translate-y-0 active:scale-95"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Run a free analysis
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
