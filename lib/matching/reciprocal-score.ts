import { ALGORITHM_VERSION, MINIMUM_CONFIDENCE_FOR_EXCEPTIONAL } from "@/lib/matching/config";
import { evaluateDomains } from "@/lib/matching/domains";
import { evaluateGates } from "@/lib/matching/gates";
import { PROFILE_VERSION, type MatchProfile } from "@/lib/matching/profile-schema";
import type {
  FitBand,
  MatchAssessmentData,
  MatchReason,
  PersonWithProfile,
} from "@/lib/types";

function fitBand(score: number, confidence: number): FitBand {
  if (score >= 86 && confidence >= MINIMUM_CONFIDENCE_FOR_EXCEPTIONAL) return "exceptional";
  if (score >= 74) return "strong";
  if (score >= 62) return "promising";
  if (score >= 48) return "possible";
  return "low";
}

function contradictionReasons(
  person: PersonWithProfile,
  profile: MatchProfile,
): MatchReason[] {
  const supportingSignals = profile.signals.filter((signal) =>
    [
      "partnerSuccessImportance",
      "nonNegotiables",
      "backgroundOpenToOther",
      "backgroundImportance",
    ].includes(signal.key),
  );
  return profile.contradictions.map((detail) => ({
    domain: "coaching",
    label: `${person.firstName || "Profile"} has an answer to clarify`,
    detail,
    evidence: supportingSignals.slice(0, 2).map((signal) => ({
      personId: person.id,
      field: signal.evidence.field,
      quote: signal.evidence.quote,
      confidence: signal.confidence,
    })),
  }));
}

export function scoreReciprocalPair(
  a: PersonWithProfile,
  profileA: MatchProfile,
  b: PersonWithProfile,
  profileB: MatchProfile,
): MatchAssessmentData {
  const eligibility = evaluateGates(a, profileA, b, profileB);
  const evaluation = evaluateDomains(a, profileA, b, profileB);

  const weightedScore = evaluation.scores.reduce(
    (sum, domain) => sum + (domain.reciprocal / 100) * domain.weight,
    0,
  );
  const weightedConfidence = evaluation.scores.reduce(
    (sum, domain) => sum + domain.confidence * domain.weight,
    0,
  );
  const totalWeight = evaluation.scores.reduce((sum, domain) => sum + domain.weight, 0);
  const confidence = totalWeight ? weightedConfidence / totalWeight : 0;
  const score = Math.round(weightedScore);

  const unknowns: MatchReason[] = [];
  for (const domain of evaluation.scores) {
    if (domain.confidence < 0.5) {
      unknowns.push({
        domain: domain.key,
        label: `More ${domain.label.toLowerCase()} information needed`,
        detail: "One or both profiles do not contain enough evidence for a confident comparison.",
        evidence: [],
      });
    }
  }
  for (const gate of eligibility.gates.filter((item) => item.status === "needs_review")) {
    unknowns.push({
      domain: "practical",
      label: gate.label,
      detail: gate.detail,
      evidence: gate.evidence,
    });
  }

  const cautions = [
    ...contradictionReasons(a, profileA),
    ...contradictionReasons(b, profileB),
    ...evaluation.cautions,
  ].slice(0, 5);
  const whyNotHigher: string[] = [];
  const weakest = [...evaluation.scores]
    .filter((item) => item.confidence >= 0.5)
    .sort((x, y) => x.reciprocal - y.reciprocal)
    .slice(0, 2);
  for (const domain of weakest) {
    if (domain.reciprocal < 70) {
      whyNotHigher.push(
        `${domain.label} has ${domain.reciprocal}% reciprocal evidence (${domain.fitAtoB}% one way, ${domain.fitBtoA}% the other).`,
      );
    }
  }
  if (confidence < 0.7) {
    whyNotHigher.push("Missing or uncertain answers reduce confidence rather than counting as incompatibility.");
  }
  if (eligibility.status === "needs_review") {
    whyNotHigher.push("At least one practical requirement still needs matchmaker confirmation.");
  }
  if (eligibility.status === "blocked") {
    whyNotHigher.push("A confirmed eligibility gate blocks this pair, regardless of compatibility score.");
  }

  return {
    eligibility: eligibility.status,
    fitBand: fitBand(score, confidence),
    score,
    confidence: Number(confidence.toFixed(2)),
    domains: evaluation.scores,
    gates: eligibility.gates,
    strengths: evaluation.strengths,
    complements: evaluation.complements,
    cautions,
    unknowns: unknowns.slice(0, 8),
    directionAtoB: evaluation.directionAtoB,
    directionBtoA: evaluation.directionBtoA,
    whyNotHigher,
    algorithmVersion: ALGORITHM_VERSION,
    profileVersion: PROFILE_VERSION,
  };
}
