import { UserRound } from "lucide-react";

const testimonials = [
  {
    quote: "I had been holding Zomato for months without really knowing why. Ran it on Metric and finally understood what I actually owned. Sent the link to three friends that same evening.",
    name: "Aditi R.",
    role: "Product Manager",
    location: "Bengaluru",
  },
  {
    quote: "I always found stock research intimidating. Metric broke it down so simply that I read the whole brief in one sitting. My whole team uses it now.",
    name: "Karan M.",
    role: "Growth Marketer",
    location: "Mumbai",
  },
  {
    quote: "Searched HDFC Bank before adding more. The brief was so clear I actually felt confident about the decision. Shared it with my flatmate who started investing the same week.",
    name: "Sneha P.",
    role: "UX Designer",
    location: "Pune",
  },
  {
    quote: "I used to spend an hour reading multiple sites before making any move. Now I just run Metric and I understand the stock in plain language within minutes.",
    name: "Rahul T.",
    role: "Software Engineer",
    location: "Hyderabad",
  },
  {
    quote: "Metric made me realise I had no real understanding of half my portfolio. Fixed that in an afternoon. Forwarded it to my whole college group chat.",
    name: "Nisha K.",
    role: "Content Strategist",
    location: "Delhi",
  },
];

export function TestimonialsCarousel() {
  return (
    <div className="mx-auto w-full max-w-[40rem]" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="mb-7 text-center sm:mb-8">
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
          Decide with confidence.
        </h2>
      </div>

      <div className="flex flex-col gap-3.5 sm:gap-4">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="group relative flex min-h-[11.5rem] cursor-default flex-col justify-between gap-4 overflow-hidden border border-[#303034] bg-[#18181b] px-5 py-5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:border-[#52525b] hover:bg-[#202023] hover:shadow-2xl hover:shadow-black/30 sm:min-h-[12rem] sm:px-6 sm:py-6"
          >
            <blockquote className="relative z-10">
              <p className="text-[clamp(0.95rem,1.8vw,1.05rem)] font-medium leading-[1.5] tracking-[-0.01em] text-[#dbe2fd]">
                {testimonial.quote}
              </p>
            </blockquote>

            <div className="relative z-10 flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-[#b8c4ff] transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11">
                <UserRound size={19} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-white">{testimonial.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-[#8e909f] sm:text-[11px]">
                  {testimonial.role} · {testimonial.location}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
