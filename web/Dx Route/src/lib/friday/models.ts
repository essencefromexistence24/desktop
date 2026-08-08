import type { ComponentType } from "react";
import { providers } from "@/lib/ai/providers";

export type ModelTier = "low" | "medium" | "high";

export type TierPricing = {
  label: string;
  pricePer1M: number;
  contextWindow: number;
};

export type ZenModel = {
  id: string;
  label: string;
  provider: string;
  providerId: string;
  description: string;
  badge?: string;
  tiers: Record<ModelTier, TierPricing>;
  maxTier: ModelTier;
  Icon?: ComponentType<{ className?: string }>;
};

export const TIER_LABELS: Record<ModelTier, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TIER_LABELS_LIST: ModelTier[] = ["low", "medium", "high"];

const TIER_MULTIPLIERS: Record<ModelTier, number> = {
  low: 0.25,
  medium: 0.5,
  high: 1,
};

function buildTiers(contextLength: number): Record<ModelTier, TierPricing> {
  return {
    low: {
      label: "Low",
      pricePer1M: 0,
      contextWindow: Math.round(contextLength * TIER_MULTIPLIERS.low),
    },
    medium: {
      label: "Medium",
      pricePer1M: 0,
      contextWindow: Math.round(contextLength * TIER_MULTIPLIERS.medium),
    },
    high: {
      label: "High",
      pricePer1M: 0,
      contextWindow: Math.round(contextLength * TIER_MULTIPLIERS.high),
    },
  };
}

let _allModels: ZenModel[] | null = null;

export function getAllModels(): ZenModel[] {
  if (_allModels) return _allModels;

  const seen = new Set<string>();
  const result: ZenModel[] = [];

  for (const provider of Object.values(providers)) {
    for (const model of provider.models) {
      if (seen.has(model.id)) continue;
      seen.add(model.id);
      const ctx = model.contextLength || 128_000;
      result.push({
        id: model.id,
        label: model.name,
        provider: provider.name,
        providerId: provider.id,
        description: "",
        tiers: buildTiers(ctx),
        maxTier: "high",
        Icon: provider.icon,
      });
    }
  }

  _allModels = result;
  return result;
}
