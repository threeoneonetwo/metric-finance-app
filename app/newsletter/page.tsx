import type { Metadata } from "next";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { NewsletterFaq, NewsletterTestimonials } from "@/components/newsletter-sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Daily Stock Newsletter | Metric Finance",
  description: "Build a personalized daily stock brief for the companies you follow and receive it in plain English at the time you choose",
};

export default function NewsletterPage() {
  return (
    <main className="homepage relative min-h-screen flex flex-col">
      <div className="homepage-texture fixed inset-0 -z-10" />
      <SiteHeader fixed faqHref="#newsletter-faq" />

      <div
        className="mobile-safe-home-content relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 sm:px-8 lg:max-w-4xl lg:px-10 xl:max-w-5xl"
        style={{ paddingBottom: "7rem", gap: "5.5rem" }}
      >
        <section className="w-full text-center lg:max-w-4xl">
          <div className="animate-entrance delay-2 mx-auto flex w-full max-w-[40rem] flex-col items-center gap-6">
            <h1 className="w-full text-center text-[clamp(2.65rem,11vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white">
              Your stocks explained in one daily email
            </h1>
            <p className="w-full text-center text-lg font-normal leading-8 text-[#8e909f] sm:text-xl sm:leading-9">
              Choose the companies you care about and get a simple update at the time that works for you
            </p>
          </div>
        </section>

        <section className="animate-entrance delay-3 w-full max-w-[40rem]">
          <NewsletterSignupForm />
        </section>

        <section className="animate-entrance delay-4 -mt-8 w-full sm:-mt-10 lg:-mt-14">
          <NewsletterTestimonials />
        </section>

        <div className="-mt-8 w-full scroll-mt-20 sm:-mt-10 lg:-mt-14">
          <NewsletterFaq />
        </div>

        <section className="mx-auto w-full max-w-[40rem] text-center">
          <div className="dark-tile px-5 py-7 sm:px-8 sm:py-8">
            <h2 className="mb-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">One email with zero noise</h2>
            <p className="mx-auto max-w-lg text-sm font-normal leading-6 text-[#8e909f]">
              Follow the market without letting it take over your day
            </p>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
