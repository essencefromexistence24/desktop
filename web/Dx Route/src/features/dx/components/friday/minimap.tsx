"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/friday-ui/hover-card";
import { cn } from "@/lib/friday/utils";

type Section = {
  id: string;
  label: string;
  preview: string;
};

type MinimapProps = {
  sections: Section[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

export function Minimap({ sections, scrollContainerRef }: MinimapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);

      const target = el.getBoundingClientRect().top + el.clientHeight / 3;
      let best: { id: string; dist: number } | null = null;
      for (const s of sections) {
        const node = el.querySelector<HTMLElement>(`[data-section-id="${s.id}"]`);
        if (!node) continue;
        const top = node.getBoundingClientRect().top;
        const dist = Math.abs(top - target);
        if (!best || dist < best.dist) best = { id: s.id, dist };
      }
      if (best) setActiveId(best.id);
    };
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sections, scrollContainerRef]);

  const scrollTo = (id: string) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const node = el.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
    if (!node) return;
    const target = node.offsetTop - el.clientHeight / 2 + node.clientHeight / 2;
    el.scrollTo({ top: target, behavior: "smooth" });
  };

  if (sections.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed left-1 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center justify-center pl-2 pointer-events-none"
    >
      <div className="relative flex flex-col items-center gap-3 py-2">
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />

        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <HoverCard key={s.id} openDelay={120} closeDelay={0}>
              <HoverCardTrigger asChild>
                <motion.button
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  aria-label={`Navigate to ${s.label}`}
                  className="pointer-events-auto relative grid h-4 w-full cursor-pointer place-items-center group"
                  whileTap={{ scale: 0.82 }}
                  animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      isActive
                        ? "h-[3px] w-4 bg-foreground shadow-[0_0_10px_var(--color-foreground)]"
                        : "h-[2px] w-3 bg-border-strong",
                    )}
                  />
                </motion.button>
              </HoverCardTrigger>
              <HoverCardContent side="right" align="center" sideOffset={10} className="w-64 p-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-foreground truncate">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                    {s.preview}
                  </p>
                  <div className="flex items-center gap-1 pt-1 text-[10px] text-muted-foreground">
                    <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[9px] font-mono">
                      click
                    </kbd>
                    <span>to jump</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </motion.div>
  );
}
