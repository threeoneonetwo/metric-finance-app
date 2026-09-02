import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <main className="report-page relative flex min-h-screen flex-col">
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: "#050810" }} />
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col justify-center px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#b8c4ff]">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Page not found</h1>
        <p className="mx-auto mt-4 max-w-[30rem] text-sm leading-6 text-[#8993ab]">
          This page does not exist. Head back to the homepage instead.
        </p>
        <div className="mt-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-[#24304d] bg-[#182238] px-5 py-3 text-sm font-bold text-[#f4f5f7] transition-all hover:bg-[#1e2b47] active:scale-95"
          >
            Go to homepage
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
