import { prisma } from "@/lib/db";
import { ALGORITHM_VERSION, MATCH_ENGINE_MODE } from "@/lib/matching/config";
import {
  extractFreeTextSignalsWithOpenAI,
  extractMatchProfile,
} from "@/lib/matching/extract-profile";
import {
  EXTRACTOR_VERSION,
  matchProfileSchema,
  type MatchProfile,
  type ProfileSignal,
} from "@/lib/matching/profile-schema";
import { scoreReciprocalPair } from "@/lib/matching/reciprocal-score";
import {
  legacyShadowScore,
  pairwiseRankAgreement,
} from "@/lib/matching/shadow";
import type {
  MatchAssessmentData,
  PersonWithProfile,
  StoredMatchAssessment,
} from "@/lib/types";

export type MatchSuggestion = {
  person: PersonWithProfile;
  score: number;
  reasons: string[];
  assessment: StoredMatchAssessment;
  mode: string;
  legacyScore: number | null;
};

const inflightProfiles = new Map<string, Promise<MatchProfile>>();

function mergeSignals(base: ProfileSignal[], extra: ProfileSignal[]): ProfileSignal[] {
  const seen = new Set(base.map((signal) => `${signal.key}:${signal.evidence.quote}`));
  const merged = [...base];
  for (const signal of extra) {
    const key = `${signal.key}:${signal.evidence.quote}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(signal);
  }
  return merged;
}

export async function enrichMatchProfile(person: PersonWithProfile): Promise<MatchProfile> {
  const base = extractMatchProfile(person);
  const cacheKey = `${person.id}:${base.sourceHash}:${EXTRACTOR_VERSION}`;
  const existing = inflightProfiles.get(cacheKey);
  if (existing) return existing;

  const pending = (async () => {
    const cached = await prisma.derivedMatchProfile.findUnique({
      personId: person.id,
      sourceHash: base.sourceHash,
      extractorVersion: EXTRACTOR_VERSION,
    });
    if (cached) {
      try {
        return matchProfileSchema.parse(JSON.parse(cached.profileJson));
      } catch {
        // Rebuild if an older cached payload no longer matches the schema.
      }
    }

    let signals = base.signals;
    if (process.env.OPENAI_API_KEY) {
      const extra = await extractFreeTextSignalsWithOpenAI(person);
      if (extra.length) signals = mergeSignals(base.signals, extra);
    }

    const enriched = matchProfileSchema.parse({
      ...base,
      signals,
    });
    await prisma.derivedMatchProfile.upsert({
      personId: person.id,
      profileJson: JSON.stringify(enriched),
      sourceHash: enriched.sourceHash,
      extractorVersion: enriched.extractorVersion,
    });
    return enriched;
  })();

  inflightProfiles.set(cacheKey, pending);
  try {
    return await pending;
  } finally {
    inflightProfiles.delete(cacheKey);
  }
}

export function assessEnrichedPair(
  first: PersonWithProfile,
  firstProfile: MatchProfile,
  second: PersonWithProfile,
  secondProfile: MatchProfile,
): {
  personA: PersonWithProfile;
  personB: PersonWithProfile;
  profileA: MatchProfile;
  profileB: MatchProfile;
  data: MatchAssessmentData;
} {
  const ordered =
    first.id.localeCompare(second.id) <= 0
      ? { personA: first, profileA: firstProfile, personB: second, profileB: secondProfile }
      : { personA: second, profileA: secondProfile, personB: first, profileB: firstProfile };
  return {
    ...ordered,
    data: scoreReciprocalPair(ordered.personA, ordered.profileA, ordered.personB, ordered.profileB),
  };
}

export async function assessPair(
  first: PersonWithProfile,
  second: PersonWithProfile,
): Promise<{
  personA: PersonWithProfile;
  personB: PersonWithProfile;
  profileA: MatchProfile;
  profileB: MatchProfile;
  data: MatchAssessmentData;
}> {
  const [firstProfile, secondProfile] = await Promise.all([
    enrichMatchProfile(first),
    enrichMatchProfile(second),
  ]);
  return assessEnrichedPair(first, firstProfile, second, secondProfile);
}

export async function assessAndStorePair(
  first: PersonWithProfile,
  second: PersonWithProfile,
  options: { force?: boolean; exposureForPersonId?: string; location?: string } = {},
): Promise<StoredMatchAssessment> {
  const assessment = await assessPair(first, second);
  await Promise.all([
    prisma.derivedMatchProfile.upsert({
      personId: assessment.personA.id,
      profileJson: JSON.stringify(assessment.profileA),
      sourceHash: assessment.profileA.sourceHash,
      extractorVersion: assessment.profileA.extractorVersion,
    }),
    prisma.derivedMatchProfile.upsert({
      personId: assessment.personB.id,
      profileJson: JSON.stringify(assessment.profileB),
      sourceHash: assessment.profileB.sourceHash,
      extractorVersion: assessment.profileB.extractorVersion,
    }),
  ]);

  let stored = options.force
    ? null
    : await prisma.matchAssessment.findLatest({
        personAId: assessment.personA.id,
        personBId: assessment.personB.id,
        profileHashA: assessment.profileA.sourceHash,
        profileHashB: assessment.profileB.sourceHash,
        algorithmVersion: ALGORITHM_VERSION,
      });
  if (!stored) {
    stored = await prisma.matchAssessment.create({
      personAId: assessment.personA.id,
      personBId: assessment.personB.id,
      profileHashA: assessment.profileA.sourceHash,
      profileHashB: assessment.profileB.sourceHash,
      algorithmVersion: assessment.data.algorithmVersion,
      profileVersion: assessment.data.profileVersion,
      dataJson: JSON.stringify(assessment.data),
    });
  }
  if (options.exposureForPersonId) {
    await prisma.matchExposure.create({
      data: {
        assessmentId: stored.id,
        personId: options.exposureForPersonId,
        location: options.location || "profile_suggestions",
      },
    });
  }
  return stored;
}

export async function loadPair(personAId: string, personBId: string) {
  const [personA, personB] = (await Promise.all([
    prisma.person.findUnique({ where: { id: personAId }, include: { profile: true } }),
    prisma.person.findUnique({ where: { id: personBId }, include: { profile: true } }),
  ])) as [PersonWithProfile | null, PersonWithProfile | null];
  if (!personA || !personB) throw new Error("One or both people were not found");
  if (personA.id === personB.id) throw new Error("Choose two different people");
  return { personA, personB };
}

export async function suggestMatches(personId: string, limit = 8): Promise<MatchSuggestion[]> {
  const person = (await prisma.person.findUnique({
    where: { id: personId },
    include: { profile: true },
  })) as PersonWithProfile | null;
  if (!person || person.status !== "complete") return [];

  const candidates = (await prisma.person.findMany({
    where: { status: "complete", id: { not: personId } },
    include: { profile: true },
  })) as PersonWithProfile[];

  const subjectProfile = await enrichMatchProfile(person);
  const evaluated = await Promise.all(
    candidates.map(async (candidate) => {
      const candidateProfile = await enrichMatchProfile(candidate);
      return {
        candidate,
        preview: assessEnrichedPair(person, subjectProfile, candidate, candidateProfile),
        legacy: legacyShadowScore(person, candidate),
      };
    }),
  );
  const ranked = evaluated
    .filter((item) => item.preview.data.eligibility !== "blocked")
    .sort((a, b) => {
      if (a.preview.data.eligibility !== b.preview.data.eligibility) {
        return a.preview.data.eligibility === "pass" ? -1 : 1;
      }
      return b.preview.data.score - a.preview.data.score;
    });
  const newOrder = ranked.map((item) => item.candidate.id);
  const legacyOrder = evaluated
    .filter((item) => item.legacy.eligible)
    .sort((a, b) => b.legacy.score - a.legacy.score)
    .map((item) => item.candidate.id);
  if (MATCH_ENGINE_MODE === "shadow") {
    await prisma.matchingAnalytics.recordShadowEvaluation({
      personId,
      algorithmVersion: ALGORITHM_VERSION,
      newRanking: newOrder,
      legacyRanking: legacyOrder,
      pairwiseAgreement: pairwiseRankAgreement(newOrder, legacyOrder),
      falseExclusions: evaluated.filter(
        (item) => item.legacy.eligible && item.preview.data.eligibility === "blocked",
      ).length,
    });
  }

  return Promise.all(
    ranked.slice(0, limit).map(async (item) => {
      const stored = await assessAndStorePair(person, item.candidate, {
        exposureForPersonId: personId,
      });
      return {
        person: item.candidate,
        score: stored.score,
        reasons: stored.strengths.map((reason) => reason.detail).slice(0, 6),
        assessment: stored,
        mode: MATCH_ENGINE_MODE,
        legacyScore: item.legacy.eligible ? item.legacy.score : null,
      };
    }),
  );
}
