import type { CompatibilityDomain } from "@/lib/matching/profile-schema";

export const ALGORITHM_VERSION = "explainable-reciprocal-v1";

export const DOMAIN_CONFIG: Record<
  CompatibilityDomain,
  { label: string; weight: number; method: "similarity" | "preference" | "care" | "mixed" }
> = {
  jewish_life: { label: "Jewish life & religious home", weight: 22, method: "similarity" },
  family_future: { label: "Family, children & shared future", weight: 18, method: "similarity" },
  values_character: { label: "Core values & character", weight: 18, method: "preference" },
  emotional_fit: { label: "Emotional needs & care", weight: 14, method: "care" },
  communication: { label: "Communication & conflict", weight: 10, method: "mixed" },
  lifestyle: { label: "Lifestyle & daily rhythm", weight: 8, method: "mixed" },
  ambition: { label: "Ambition & work-life orientation", weight: 5, method: "mixed" },
  culture: { label: "Culture, background & community", weight: 3, method: "mixed" },
  attraction: { label: "Stated personality preferences", weight: 2, method: "preference" },
  practical: { label: "Practical constraints", weight: 0, method: "similarity" },
  coaching: { label: "Coaching context", weight: 0, method: "mixed" },
};

export const SCORED_DOMAINS = (
  Object.entries(DOMAIN_CONFIG) as [
    CompatibilityDomain,
    (typeof DOMAIN_CONFIG)[CompatibilityDomain],
  ][]
).filter(([, config]) => config.weight > 0);

export const MATCH_ENGINE_MODE = process.env.MATCH_ENGINE_MODE || "shadow";
export const MINIMUM_CONFIDENCE_FOR_EXCEPTIONAL = 0.72;
