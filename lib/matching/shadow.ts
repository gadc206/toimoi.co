import { normalize } from "@/lib/toimo/branches";
import type { PersonWithProfile } from "@/lib/types";

export type LegacyShadowScore = {
  eligible: boolean;
  score: number;
};

function gender(value: string | null): "woman" | "man" | null {
  const text = normalize(value || "");
  if (text.includes("woman") || text.includes("female") || text === "f") return "woman";
  if (text.includes("man") || text.includes("male") || text === "m") return "man";
  return null;
}

/**
 * Frozen copy of the pre-v1 heuristic. It exists only for shadow comparison
 * and must never drive introductions or override explainable-engine gates.
 */
export function legacyShadowScore(a: PersonWithProfile, b: PersonWithProfile): LegacyShadowScore {
  if (a.id === b.id || a.status !== "complete" || b.status !== "complete") {
    return { eligible: false, score: 0 };
  }
  const genderA = gender(a.gender);
  const genderB = gender(b.gender);
  if (!genderA || !genderB || genderA === genderB) return { eligible: false, score: 0 };
  let score = 10;
  if (a.age != null && b.age != null) {
    const difference = Math.abs(a.age - b.age);
    if (difference > 6) return { eligible: false, score: 0 };
    score += Math.max(0, 12 - difference * 2);
  }
  const religionA = normalize(a.profile?.religiosity || "");
  const religionB = normalize(b.profile?.religiosity || "");
  if (religionA && religionB) score += religionA === religionB ? 18 : 6;
  if (
    a.profile?.wantsChildren &&
    b.profile?.wantsChildren &&
    normalize(a.profile.wantsChildren).includes("yes") &&
    normalize(b.profile.wantsChildren).includes("yes")
  ) {
    score += 10;
  }
  if (
    a.profile?.familyImportance &&
    b.profile?.familyImportance &&
    normalize(a.profile.familyImportance) === normalize(b.profile.familyImportance)
  ) {
    score += 6;
  }
  if (
    a.profile?.communityImportance &&
    b.profile?.communityImportance &&
    normalize(a.profile.communityImportance) === normalize(b.profile.communityImportance)
  ) {
    score += 4;
  }
  return { eligible: true, score };
}

export function pairwiseRankAgreement(newOrder: string[], legacyOrder: string[]): number {
  const common = newOrder.filter((id) => legacyOrder.includes(id));
  if (common.length < 2) return 1;
  const newPosition = new Map(newOrder.map((id, index) => [id, index]));
  const oldPosition = new Map(legacyOrder.map((id, index) => [id, index]));
  let agreements = 0;
  let comparisons = 0;
  for (let i = 0; i < common.length; i += 1) {
    for (let j = i + 1; j < common.length; j += 1) {
      comparisons += 1;
      const first = common[i];
      const second = common[j];
      const newDirection = (newPosition.get(first) || 0) - (newPosition.get(second) || 0);
      const oldDirection = (oldPosition.get(first) || 0) - (oldPosition.get(second) || 0);
      if (Math.sign(newDirection) === Math.sign(oldDirection)) agreements += 1;
    }
  }
  return comparisons ? agreements / comparisons : 1;
}
