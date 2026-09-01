import { Mail } from "lucide-react";

type NewsletterSignupPromptProps = {
  ticker: string;
};

export function NewsletterSignupPrompt({ ticker }: NewsletterSignupPromptProps) {
  return (
    <aside
      className="mx-auto w-full max-w-[48rem] border border-[#3f3f46] bg-[#18181b] p-4 sm:p-5"
      aria-labelledby="newsletter-prompt-title"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center border border-[#3f3f46] bg-[#27272a] text-[#b8c4ff]">
          <Mail size={18} strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <p id="newsletter-prompt-title" className="text-xl font-semibold text-white sm:text-2xl">
            Want this analysis in your inbox?
          </p>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#a1a1aa] sm:text-base sm:leading-7">
            Sign up for the upcoming Metric Finance newsletter to get plain-English updates on {ticker} and the stocks you follow.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="border border-[#52525b] bg-[#27272a] px-5 py-3 text-sm font-semibold text-[#dbe2fd] disabled:cursor-not-allowed disabled:opacity-80"
        >
          Coming soon
        </button>
      </div>
    </aside>
  );
}
