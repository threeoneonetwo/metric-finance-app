export function HeroHeadline() {
  return (
    <div className="mx-auto flex w-full max-w-[40rem] flex-col items-center gap-6" style={{ fontFamily: "Arial, sans-serif" }}>
      <h1
        className="w-full text-center text-[clamp(2.65rem,11vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white"
      >
        <span className="inline-block">Stocks explained</span><br />like you&apos;re 5
      </h1>
      <p
        className="w-full text-center text-lg leading-8 text-[#8e909f] sm:text-xl sm:leading-9"
      >
        Agentic analysis for public equities in plain English to help you become a smarter investor for free
      </p>
    </div>
  );
}
