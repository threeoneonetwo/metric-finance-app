"use client";

// Tracks the pointer over any element marked data-spot so CSS can draw a soft glow under the cursor.
export function SpotGlow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={className}
      onPointerMove={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("section, [data-spot]");
        if (!target) return;
        const box = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${event.clientX - box.left}px`);
        target.style.setProperty("--my", `${event.clientY - box.top}px`);
      }}
    >
      {children}
    </div>
  );
}
