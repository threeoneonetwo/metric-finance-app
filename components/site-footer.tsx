export function SiteFooter() {
  return (
    <footer
      className="mt-auto w-full px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-center sm:px-8 sm:pt-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,21,38,0.94)",
        backdropFilter: "blur(16px)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <p className="text-[10px] font-medium leading-4 tracking-wide text-[#8993ab]">
        Metric Finance · Built by{" "}
        <a
          href="https://www.linkedin.com/in/yashnapandugala/"
          target="_blank"
          rel="noreferrer"
          className="text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
        >
          Yashna
        </a>
        {" "}&{" "}
        <a
          href="https://www.linkedin.com/in/vanshpandita-real/"
          target="_blank"
          rel="noreferrer"
          className="text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
        >
          Vansh
        </a>
        {" "}· Not financial advice
      </p>
    </footer>
  );
}
