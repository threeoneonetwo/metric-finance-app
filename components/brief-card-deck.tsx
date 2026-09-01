"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type BriefCardDeckProps = {
  paragraphs: string[];
  muted?: boolean;
  className?: string;
  fill?: boolean;
  packToLength?: number;
  prominentText?: boolean;
};

export function BriefCardDeck({
  paragraphs,
  muted = false,
  className = "",
  fill = false,
  packToLength,
  prominentText = false,
}: BriefCardDeckProps) {
  const cards = useMemo(
    () => packTextCards(paragraphs, packToLength),
    [packToLength, paragraphs],
  );
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const textColor = muted ? "text-[#c4c5d5]" : "text-[#dae2fd]";
  const canMove = cards.length > 1;
  const current = cards[Math.min(index, Math.max(0, cards.length - 1))] ?? "";

  function go(delta: number) {
    if (!cards.length) return;
    setIndex((value) => Math.min(cards.length - 1, Math.max(0, value + delta)));
  }

  function onTouchEnd(x: number) {
    if (touchStart === null) return;
    const distance = touchStart - x;
    setTouchStart(null);
    if (Math.abs(distance) < 38) return;
    go(distance > 0 ? 1 : -1);
  }

  if (!current) return null;

  return (
    <div className={`overflow-hidden rounded-xl border border-[#303034] bg-[#18181b] ${fill ? "flex min-h-[17rem] flex-1 flex-col" : ""} ${className}`}>
      <div
        className={fill ? "min-h-[12rem] flex-1 overflow-hidden" : "h-[15rem] overflow-hidden sm:h-[13rem] lg:h-[9.5rem]"}
        onTouchStart={(event) => setTouchStart(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {cards.map((card, cardIndex) => (
            <article
              key={`${cardIndex}-${card.slice(0, 24)}`}
              className="h-full w-full shrink-0 overflow-y-auto px-4 pb-5 pt-4 text-left sm:px-5 lg:px-5 lg:pb-4 lg:pt-4"
            >
              <p
                className={`whitespace-pre-line font-[Arial] font-normal tracking-normal ${prominentText ? "text-xl leading-8 lg:text-[22px] lg:leading-9" : "text-sm leading-7 lg:leading-6"} ${textColor}`}
              >
                {card}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!canMove || index === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3f3f46] bg-[#27272a] text-[#dae2fd] transition-colors hover:bg-[#303034] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[#27272a] disabled:hover:text-[#dae2fd]"
          aria-label="Previous brief part"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </button>

        <div className="flex items-center gap-2">
          {cards.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2 w-2 rounded-full transition-all ${dotIndex === index ? "bg-white" : "bg-white/20 hover:bg-white/40"}`}
              aria-label={`Open brief part ${dotIndex + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e909f]">
            {index + 1} / {cards.length}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!canMove || index === cards.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3f3f46] bg-[#27272a] text-[#dae2fd] transition-colors hover:bg-[#303034] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[#27272a] disabled:hover:text-[#dae2fd]"
            aria-label="Next brief part"
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function packTextCards(paragraphs: string[], maxLength?: number) {
  const cleaned = paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);
  if (!maxLength) return cleaned;

  const units = cleaned.flatMap((paragraph) => {
    const sentences = paragraph
      .split(/(?<=[.!?])\s+(?=[A-Z₹(])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    return sentences.length ? sentences : [paragraph];
  });

  const cards: string[] = [];
  let current = "";

  for (const unit of units) {
    const next = current ? `${current} ${unit}` : unit;
    if (current && next.length > maxLength) {
      cards.push(current);
      current = unit;
    } else {
      current = next;
    }
  }

  if (current) cards.push(current);
  return cards;
}
