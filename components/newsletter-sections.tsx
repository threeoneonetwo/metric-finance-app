"use client";

import { ChevronDown, UserRound } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    quote: "I want a quick update on the stocks I actually follow and this gives me exactly that without making the market feel overwhelming",
    name: "Aditi R.",
    role: "Product Manager",
    location: "Bengaluru",
  },
  {
    quote: "A simple morning brief would save me from opening five different apps just to understand what changed in my portfolio",
    name: "Karan M.",
    role: "Growth Marketer",
    location: "Mumbai",
  },
  {
    quote: "Choosing my own watchlist makes the update feel personal and the plain English format is exactly how I want market news explained",
    name: "Sneha P.",
    role: "UX Designer",
    location: "Pune",
  },
];

const faqItems = [
  {
    question: "What will I receive in each newsletter?",
    answer: "You will get a simple update on the companies in your watchlist with the latest price moves, important news, business signals and useful context",
  },
  {
    question: "Can I change the stocks I follow?",
    answer: "Yes, you will be able to add or remove companies whenever your watchlist changes so every edition stays relevant to you",
  },
  {
    question: "What is the difference between 9 AM and 5 PM EST?",
    answer: "The 9 AM edition helps you prepare for the day while the 5 PM edition gives you a clear recap after the market has moved",
  },
  {
    question: "Does the newsletter tell me what to buy or sell?",
    answer: "No, Metric Finance explains what is happening and why it may matter so you can make your own decisions with better context",
  },
  {
    question: "Can I unsubscribe whenever I want?",
    answer: "Yes, every email will include a simple way to unsubscribe and you can leave at any time",
  },
];

export function NewsletterTestimonials() {
  return (
    <section className="mx-auto w-full max-w-[40rem] text-center" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="mb-7 text-center sm:mb-8">
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
          A calmer way to follow the market
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 sm:gap-4">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="group relative flex min-h-[11.5rem] cursor-default flex-col items-center justify-between gap-4 overflow-hidden border border-[#303034] bg-[#18181b] px-5 py-5 text-center shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:border-[#52525b] hover:bg-[#202023] hover:shadow-2xl hover:shadow-black/30 sm:min-h-[12rem] sm:px-6 sm:py-6"
          >
            <blockquote className="relative z-10">
              <p className="text-[clamp(0.95rem,1.8vw,1.05rem)] font-medium leading-[1.5] tracking-[-0.01em] text-[#dbe2fd]">
                {testimonial.quote}
              </p>
            </blockquote>
            <div className="relative z-10 flex min-w-0 items-center justify-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#3f3f46] bg-[#27272a] text-[#b8c4ff] transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11">
                <UserRound size={19} strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold leading-tight text-white">{testimonial.name}</p>
                <p className="mt-0.5 text-[10px] text-[#8e909f] sm:text-[11px]">
                  {testimonial.role} · {testimonial.location}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function NewsletterFaq() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section id="newsletter-faq" className="mx-auto w-full max-w-[40rem] space-y-6 text-center">
      <h2 className="text-center text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl">FAQ</h2>
      <div className="space-y-2.5 sm:space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question} className="glass-panel overflow-hidden">
              <button
                type="button"
                className={`flex w-full cursor-pointer items-center justify-center gap-4 px-5 py-3.5 text-center transition-colors sm:px-6 sm:py-4 ${isOpen ? "" : "hover:bg-[#27272a]"}`}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="text-[13px] font-bold leading-6 text-white sm:text-sm">{item.question}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className="shrink-0 text-[#90909a] transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-0 sm:px-6 sm:pb-5">
                  <p className="mx-auto max-w-lg text-[13px] font-normal leading-6 text-[#c6c5d0] sm:text-sm sm:leading-7">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
