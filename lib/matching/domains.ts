import { DOMAIN_CONFIG, SCORED_DOMAINS } from "@/lib/matching/config";
import type {
  DomainScore,
  EvidenceRef,
  MatchReason,
  PersonWithProfile,
} from "@/lib/types";
import type {
  CompatibilityDomain,
  MatchProfile,
  ProfileSignal,
} from "@/lib/matching/profile-schema";

type DomainEvaluation = {
  scores: DomainScore[];
  strengths: MatchReason[];
  complements: MatchReason[];
  cautions: MatchReason[];
  directionAtoB: MatchReason[];
  directionBtoA: MatchReason[];
};

const SELF_FIELDS = new Set([
  "religiosity",
  "religiosityDirection",
  "futureHomeReligious",
  "communityImportance",
  "familyCloseness",
  "bringIntoMarriage",
  "doDifferently",
  "threeWords",
  "selfDescription",
  "hiddenSide",
  "hobbies",
  "socialStyle",
  "perfectSunday",
  "loveLanguageGive",
  "conflictStyle",
  "workEnjoyment",
  "ambition",
  "familyImportance",
  "wantsChildren",
  "raisingFamily",
  "judaismForChildren",
  "fiveYearLife",
  "everydayLife",
  "readiness",
  "homeFeel",
  "ordinaryDay",
  "bringToRelationship",
  "unseenSide",
  "bestFriendDescription",
  "familyBackground",
]);

const SEEK_FIELDS = new Set([
  "partnerReligiosity",
  "datingBackgroundPreference",
  "partnerSuccessImportance",
  "successMeaning",
  "loveLanguageReceive",
  "coreEmotionalNeeds",
  "nonNegotiables",
  "partnerQualities",
  "qualityDefinitions",
  "personalityAttracted",
  "personalityNotAttracted",
  "attractionMeaning",
]);

function evidence(personId: string, signal: ProfileSignal): EvidenceRef {
  return {
    personId,
    field: signal.evidence.field,
    quote: signal.evidence.quote,
    confidence: signal.confidence,
  };
}

function terms(signals: ProfileSignal[]): Set<string> {
  return new Set(signals.flatMap((item) => item.normalized));
}

function overlap(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((term) => b.has(term));
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0.5;
  const shared = overlap(a, b).length;
  const denominator = Math.min(a.size, b.size);
  return Math.max(0.2, Math.min(1, 0.35 + (shared / denominator) * 0.65));
}

function preferenceFit(seeker: ProfileSignal[], target: ProfileSignal[]): number {
  const wants = terms(seeker.filter((item) => SEEK_FIELDS.has(item.key)));
  const offers = terms(target.filter((item) => SELF_FIELDS.has(item.key)));
  if (!wants.size || !offers.size) return 0.5;
  const matches = overlap(wants, offers).length;
  return Math.max(0.15, Math.min(1, 0.25 + (matches / Math.min(wants.size, 8)) * 0.75));
}

function careFit(seeker: ProfileSignal[], target: ProfileSignal[]): number {
  const wants = terms(
    seeker.filter((item) =>
      ["loveLanguageReceive", "coreEmotionalNeeds", "connectionDrivers", "connectionFollowup"].includes(
        item.key,
      ),
    ),
  );
  const offers = terms(
    target.filter((item) =>
      ["loveLanguageGive", "bringToRelationship", "bestFriendDescription", "threeWords"].includes(
        item.key,
      ),
    ),
  );
  if (!wants.size || !offers.size) return 0.5;
  return Math.max(
    0.15,
    Math.min(1, 0.3 + (overlap(wants, offers).length / Math.min(wants.size, 6)) * 0.7),
  );
}

function conflictFit(seeker: ProfileSignal[], target: ProfileSignal[]): number {
  const own = terms(seeker.filter((item) => item.key === "conflictStyle"));
  const need = terms(seeker.filter((item) => item.key === "disagreementNeeds"));
  const targetStyle = terms(target.filter((item) => item.key === "conflictStyle"));
  if (!own.size || !targetStyle.size) return 0.5;
  const direct = similarity(own, targetStyle);
  const needOffer = need.size ? similarity(need, targetStyle) : 0.5;
  return direct * 0.55 + needOffer * 0.45;
}

function directionalScore(
  method: (typeof DOMAIN_CONFIG)[CompatibilityDomain]["method"],
  seeker: ProfileSignal[],
  target: ProfileSignal[],
): number {
  if (method === "preference") return preferenceFit(seeker, target);
  if (method === "care") return careFit(seeker, target);
  if (method === "mixed") {
    if (seeker.some((item) => item.domain === "communication")) {
      return conflictFit(seeker, target);
    }
    return preferenceFit(seeker, target) * 0.55 + similarity(terms(seeker), terms(target)) * 0.45;
  }
  return similarity(terms(seeker), terms(target));
}

function harmonic(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  return (2 * a * b) / (a + b);
}

function reasonFromOverlap(
  domain: CompatibilityDomain,
  a: PersonWithProfile,
  signalsA: ProfileSignal[],
  b: PersonWithProfile,
  signalsB: ProfileSignal[],
): MatchReason | null {
  const common = overlap(terms(signalsA), terms(signalsB)).slice(0, 3);
  if (!common.length) return null;
  const evidenceA = signalsA.find((item) =>
    item.normalized.some((term) => common.includes(term)),
  );
  const evidenceB = signalsB.find((item) =>
    item.normalized.some((term) => common.includes(term)),
  );
  if (!evidenceA || !evidenceB) return null;
  return {
    domain,
    label: DOMAIN_CONFIG[domain].label,
    detail: `Shared evidence around ${common.join(", ")}.`,
    evidence: [evidence(a.id, evidenceA), evidence(b.id, evidenceB)],
  };
}

function directionalReason(
  domain: CompatibilityDomain,
  seeker: PersonWithProfile,
  seekerSignals: ProfileSignal[],
  target: PersonWithProfile,
  targetSignals: ProfileSignal[],
): MatchReason | null {
  const wants = seekerSignals.filter((item) => SEEK_FIELDS.has(item.key));
  const offers = targetSignals.filter((item) => SELF_FIELDS.has(item.key));
  const common = overlap(terms(wants), terms(offers)).slice(0, 3);
  if (!common.length) return null;
  const wanted = wants.find((item) => item.normalized.some((term) => common.includes(term)));
  const offered = offers.find((item) => item.normalized.some((term) => common.includes(term)));
  if (!wanted || !offered) return null;
  return {
    domain,
    label: `What ${target.firstName || "the candidate"} may offer ${seeker.firstName || "them"}`,
    detail: `${seeker.firstName || "They"} asked for ${common.join(", ")}; ${
      target.firstName || "the candidate"
    } described related qualities.`,
    evidence: [evidence(seeker.id, wanted), evidence(target.id, offered)],
  };
}

function complementarity(
  a: PersonWithProfile,
  pa: MatchProfile,
  b: PersonWithProfile,
  pb: MatchProfile,
): MatchReason[] {
  const results: MatchReason[] = [];
  const attractionA = pa.signals.filter((item) => item.key === "personalityAttracted");
  const attractionB = pb.signals.filter((item) => item.key === "personalityAttracted");
  const selfA = pa.signals.filter((item) =>
    ["socialStyle", "ambition", "threeWords", "bringToRelationship"].includes(item.key),
  );
  const selfB = pb.signals.filter((item) =>
    ["socialStyle", "ambition", "threeWords", "bringToRelationship"].includes(item.key),
  );
  const fitA = overlap(terms(attractionA), terms(selfB));
  const fitB = overlap(terms(attractionB), terms(selfA));

  const socialDifference =
    pa.traits.socialEnergy != null && pb.traits.socialEnergy != null
      ? Math.abs(pa.traits.socialEnergy - pb.traits.socialEnergy)
      : 0;
  const ambitionDifference =
    pa.traits.ambition != null && pb.traits.ambition != null
      ? Math.abs(pa.traits.ambition - pb.traits.ambition)
      : 0;

  if ((socialDifference >= 0.4 || ambitionDifference >= 0.4) && fitA.length && fitB.length) {
    const aWant = attractionA.find((item) => item.normalized.some((term) => fitA.includes(term)));
    const bOffer = selfB.find((item) => item.normalized.some((term) => fitA.includes(term)));
    const bWant = attractionB.find((item) => item.normalized.some((term) => fitB.includes(term)));
    const aOffer = selfA.find((item) => item.normalized.some((term) => fitB.includes(term)));
    if (aWant && bOffer && bWant && aOffer) {
      results.push({
        domain: socialDifference >= 0.4 ? "lifestyle" : "ambition",
        label: "Potential two-way balance",
        detail:
          "Their styles differ, and each person explicitly described valuing something the other says they offer. Confirm the day-to-day pace together.",
        evidence: [
          evidence(a.id, aWant),
          evidence(b.id, bOffer),
          evidence(b.id, bWant),
          evidence(a.id, aOffer),
        ],
      });
    }
  }
  return results;
}

export function evaluateDomains(
  a: PersonWithProfile,
  pa: MatchProfile,
  b: PersonWithProfile,
  pb: MatchProfile,
): DomainEvaluation {
  const scores: DomainScore[] = [];
  const strengths: MatchReason[] = [];
  const cautions: MatchReason[] = [];
  const directionAtoB: MatchReason[] = [];
  const directionBtoA: MatchReason[] = [];

  for (const [domain, config] of SCORED_DOMAINS) {
    const signalsA = pa.signals.filter((item) => item.domain === domain);
    const signalsB = pb.signals.filter((item) => item.domain === domain);
    const rawAtoB = directionalScore(config.method, signalsA, signalsB);
    const rawBtoA = directionalScore(config.method, signalsB, signalsA);
    const answeredSides = Number(signalsA.length > 0) + Number(signalsB.length > 0);
    const coverage = answeredSides / 2;
    const confidence = coverage === 1 ? Math.min(1, (signalsA.length + signalsB.length) / 6) : 0.25;
    const reciprocal = harmonic(rawAtoB, rawBtoA);
    scores.push({
      key: domain,
      label: config.label,
      weight: config.weight,
      fitAtoB: Math.round(rawAtoB * 100),
      fitBtoA: Math.round(rawBtoA * 100),
      reciprocal: Math.round(reciprocal * 100),
      confidence: Number(confidence.toFixed(2)),
    });

    const shared = reasonFromOverlap(domain, a, signalsA, b, signalsB);
    if (shared && reciprocal >= 0.58) strengths.push(shared);
    const aToBReason = directionalReason(domain, a, signalsA, b, signalsB);
    const bToAReason = directionalReason(domain, b, signalsB, a, signalsA);
    if (aToBReason) directionAtoB.push(aToBReason);
    if (bToAReason) directionBtoA.push(bToAReason);
    if (reciprocal < 0.38 && confidence >= 0.5) {
      cautions.push({
        domain,
        label: `${config.label} needs discussion`,
        detail: "The available answers show limited reciprocal alignment in this domain.",
        evidence: [
          ...signalsA.slice(0, 1).map((item) => evidence(a.id, item)),
          ...signalsB.slice(0, 1).map((item) => evidence(b.id, item)),
        ],
      });
    }
  }

  return {
    scores,
    strengths: strengths.slice(0, 5),
    complements: complementarity(a, pa, b, pb).slice(0, 3),
    cautions: cautions.slice(0, 3),
    directionAtoB: directionAtoB.slice(0, 5),
    directionBtoA: directionBtoA.slice(0, 5),
  };
}
