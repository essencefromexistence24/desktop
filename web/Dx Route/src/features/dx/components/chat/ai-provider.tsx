"use client";

import { providers } from "@/lib/ai/providers";
import type { GeneratedProviderConfig } from "@/lib/ai/providers.generated";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType } from "react";

type ProviderItem = {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
};

const ITEMS: ProviderItem[] = Object.values(providers).map((p) => ({
  id: p.id,
  name: p.name,
  icon: p.icon,
}));

const SPRING = { type: "spring", stiffness: 300, damping: 32, mass: 0.9 } as const;

export interface AiProviderProps {
  selectedProvider?: string;
  onSelect?: (providerId: string) => void;
  className?: string;
}

export function AiProvider({ selectedProvider, onSelect, className }: AiProviderProps) {
  const reduce = useReducedMotion();
  const morph = reduce ? { duration: 0.15 } : SPRING;

  return (
    <div className={cn("relative", className)}>
      <div className="max-h-72 w-64 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">AI Providers</div>
        <div className="mt-1 grid grid-cols-1 gap-0.5">
          {ITEMS.map((item, i) => {
            const isSelected = selectedProvider === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : i * 0.012, duration: 0.2 }}
                onClick={() => onSelect?.(item.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate font-medium">{item.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
