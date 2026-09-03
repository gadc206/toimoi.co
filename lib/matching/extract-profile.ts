import crypto from "crypto";
import OpenAI from "openai";
import { z } from "zod";
import { normalize } from "@/lib/toimo/branches";
import type { PersonWithProfile, ProfileAnswers } from "@/lib/types";
import {
  EXTRACTOR_VERSION,
  PROFILE_VERSION,
  matchProfileSchema,
  profileSignalSchema,
  type CompatibilityDomain,
  type MatchProfile,
  type ProfileSignal,
  type SignalImportance,
} from "@/lib/matching/profile-schema";

type AnswerField = Exclude<
  keyof ProfileAnswers,
  "id" | "personId" | "createdAt" | "updatedAt" | "profileJson"
>;

const FIELD_DOMAINS: Record<AnswerField, CompatibilityDomain> = {
  location: "practical",
  everydayLife: "lifestyle",
  grewUp: "culture",
  grewUpInfluence: "culture",
  familyBackground: "culture",
  momBackground: "culture",
  dadBackground: "culture",
  connectedSide: "culture",
  datingBackgroundPreference: "culture",
  backgroundImportance: "culture",
  backgroundWhy: "culture",
  backgroundOpenToOther: "culture",
  familyCloseness: "family_future",
  siblings: "family_future",
  bringIntoMarriage: "family_future",
  doDifferently: "family_future",
  religiosity: "jewish_life",
  religiosityDirection: "jewish_life",
  partnerReligiosity: "jewish_life",
  futureHomeReligious: "jewish_life",
  synagogueYesNo: "jewish_life",
  synagogueName: "jewish_life",
  communityImportance: "jewish_life",
  studied: "ambition",
  work: "ambition",
  workEnjoyment: "ambition",
  ambition: "ambition",
  partnerSuccessImportance: "ambition",
  successMeaning: "ambition",
  threeWords: "values_character",
  selfDescription: "values_character",
  hiddenSide: "values_character",
  misunderstoodAs: "values_character",
  hobbies: "lifestyle",
  socialStyle: "lifestyle",
  perfectSunday: "lifestyle",
  loveLanguageReceive: "emotional_fit",
  loveLanguageGive: "emotional_fit",
  connectionDrivers: "emotional_fit",
  connectionFollowup: "emotional_fit",
  conflictStyle: "communication",
  disagreementNeeds: "communication",
  datingLesson: "coaching",
  repeatsType: "coaching",
  typeInCommon: "coaching",
  typeGoodForThem: "coaching",
  availabilityFeelings: "coaching",
  availabilityCoachingNotes: "coaching",
  sparkHistory: "coaching",
  openWithoutFireworks: "coaching",
  coreEmotionalNeeds: "emotional_fit",
  nonNegotiables: "values_character",
  nonNegotiableChallenge: "values_character",
  partnerQualities: "values_character",
  qualityDefinitions: "values_character",
  personalityAttracted: "attraction",
  personalityNotAttracted: "attraction",
  physicalAttracted: "attraction",
  attractionMeaning: "attraction",
  physicalNotAttracted: "attraction",
  physicalMustOrPrefer: "attraction",
  familyImportance: "family_future",
  wantsChildren: "family_future",
  raisingFamily: "family_future",
  judaismForChildren: "jewish_life",
  fiveYearLife: "family_future",
  homeFeel: "family_future",
  ordinaryDay: "lifestyle",
  lookingForwardMost: "family_future",
  bringToRelationship: "values_character",
  difficultAboutDatingThem: "coaching",
  growthEdge: "coaching",
  unseenSide: "values_character",
  bestFriendDescription: "values_character",
  mirrorReflection: "coaching",
  mirrorResonance: "coaching",
  mindsetShift: "coaching",
  doDifferentlyNext: "coaching",
  readiness: "values_character",
  partnerAgeRange: "practical",
  relocationFlexibility: "practical",
  hasChildren: "practical",
  openToPartnerChildren: "practical",
  smokingBoundaries: "practical",
  marriageTimeline: "practical",
  matchmakerEligibilityNotes: "practical",
};

const REQUIREMENT_FIELDS = new Set<AnswerField>([
  "nonNegotiables",
  "backgroundImportance",
  "partnerAgeRange",
  "openToPartnerChildren",
  "smokingBoundaries",
  "matchmakerEligibilityNotes",
]);

const PREFERENCE_FIELDS = new Set<AnswerField>([
  "datingBackgroundPreference",
  "partnerReligiosity",
  "partnerSuccessImportance",
  "partnerQualities",
  "personalityAttracted",
  "personalityNotAttracted",
  "physicalAttracted",
  "physicalNotAttracted",
]);

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "always", "and", "are", "because", "been", "being",
  "both", "but", "can", "does", "for", "from", "have", "having", "into", "just", "like",
  "more", "most", "much", "not", "really", "that", "the", "their", "them", "then", "there",
  "they", "this", "very", "want", "what", "when", "where", "which", "with", "would", "your",
]);

const CONCEPTS: Record<string, string[]> = {
  affectionate: ["affection", "affectionate", "physical touch", "physical affection"],
  adventurous: ["adventure", "adventurous", "travel", "traveling", "hiking", "explore"],
  ambitious: ["ambition", "ambitious", "driven", "drive", "achievement", "accomplished"],
  calm: ["calm", "grounded", "steady", "peaceful", "low key", "relaxed"],
  communication: ["communicate", "communication", "direct", "talk", "honest conversation"],
  community: ["community", "synagogue", "shul", "congregation"],
  consistency: ["consistent", "consistency", "reliable", "dependable", "stability", "stable"],
  curiosity: ["curious", "curiosity", "intellectual", "learning"],
  emotional_availability: ["emotionally available", "emotional presence", "present", "open"],
  family: ["family", "children", "kids", "parent", "home"],
  flexibility: ["flexible", "open minded", "open-minded", "adaptable"],
  fun: ["fun", "funny", "humor", "laughter", "playful", "goofy"],
  honesty: ["honest", "honesty", "truth", "transparent"],
  independence: ["independent", "independence", "space", "autonomy", "freedom"],
  kindness: ["kind", "kindness", "caring", "compassion", "thoughtful", "generous"],
  loyalty: ["loyal", "loyalty", "committed", "commitment"],
  reassurance: ["reassurance", "affirmation", "words", "checking in", "check in"],
  respect: ["respect", "respected", "considerate"],
  safety: ["safe", "safety", "secure", "security", "protected"],
  shabbat: ["shabbat", "shabbos", "sabbath"],
  support: ["support", "supportive", "team", "partnership"],
  tradition: ["tradition", "traditional", "custom", "customs", "heritage"],
};

function canonicalTerms(text: string): string[] {
  const lowered = normalize(text)
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");
  const concepts = Object.entries(CONCEPTS)
    .filter(([, variants]) => variants.some((variant) => lowered.includes(variant)))
    .map(([concept]) => concept);
  const tokens = lowered
    .split(/[\s,;/]+/)
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));
  return [...new Set([...concepts, ...tokens])].slice(0, 24);
}

function importanceFor(field: AnswerField, text: string): SignalImportance {
  const value = normalize(text);
  if (
    REQUIREMENT_FIELDS.has(field) &&
    /\b(must|require|dealbreaker|non-negotiable|will not|wont|won't|only|no smoking)\b/.test(
      value,
    )
  ) {
    return "requirement";
  }
  if (REQUIREMENT_FIELDS.has(field)) return "strong_preference";
  if (PREFERENCE_FIELDS.has(field)) return "preference";
  return "context";
}

function parseGender(value: string | null): "woman" | "man" | null {
  const text = normalize(value || "");
  if (text === "f" || text === "w" || text.includes("woman") || text.includes("female")) {
    return "woman";
  }
  if (text === "m" || text.includes("man") || text.includes("male")) return "man";
  return null;
}

function parseLookingFor(value: string | null): "women" | "men" | null {
  const text = normalize(value || "");
  if (text.includes("women") || text.includes("woman") || text === "f") return "women";
  if (text.includes("men") || text.includes("man") || text === "m") return "men";
  return null;
}

function parseAgeRange(value: string | null): [number | null, number | null] {
  const ages = (value || "").match(/\b([1-9][0-9]?)\b/g)?.map(Number) || [];
  const valid = ages.filter((age) => age >= 18 && age <= 99);
  if (valid.length >= 2) return [Math.min(valid[0], valid[1]), Math.max(valid[0], valid[1])];
  return [null, null];
}

function parseYesNoUnsure(value: string | null): "yes" | "no" | "unsure" | null {
  const text = normalize(value || "");
  if (!text) return null;
  if (/\b(not sure|unsure|maybe|depends)\b/.test(text)) return "unsure";
  if (/\b(no|dont|don't|never)\b/.test(text)) return "no";
  if (/\b(yes|want|open|definitely|have)\b/.test(text)) return "yes";
  return null;
}

function parseRelocation(value: string | null): "no" | "maybe" | "yes" | null {
  const result = parseYesNoUnsure(value);
  return result === "unsure" ? "maybe" : result;
}

function parseHasChildren(value: string | null): "yes" | "no" | "unknown" | null {
  if (!value) return null;
  const result = parseYesNoUnsure(value);
  return result === "unsure" || result === null ? "unknown" : result;
}

function parseSmoking(value: string | null): "none" | "no_smoking" | "context" | null {
  const text = normalize(value || "");
  if (!text) return null;
  if (/\b(no smok|non-smok|never smok|dealbreaker)\b/.test(text)) return "no_smoking";
  if (/\b(no preference|doesnt matter|doesn't matter|either)\b/.test(text)) return "none";
  return "context";
}

function scale(text: string | null, high: string[], low: string[]): number | null {
  const value = normalize(text || "");
  if (!value) return null;
  if (high.some((term) => value.includes(term))) return 0.9;
  if (low.some((term) => value.includes(term))) return 0.1;
  return 0.5;
}

function signal(field: AnswerField, value: string): ProfileSignal {
  return {
    key: field,
    domain: FIELD_DOMAINS[field],
    value,
    normalized: canonicalTerms(value),
    importance: importanceFor(field, value),
    confidence: 1,
    evidence: { field, quote: value.slice(0, 280) },
  };
}

function sourceHash(person: PersonWithProfile): string {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        age: person.age,
        gender: person.gender,
        lookingFor: person.lookingFor,
        profile: person.profile,
      }),
    )
    .digest("hex");
}

export function extractMatchProfile(person: PersonWithProfile): MatchProfile {
  const answers = person.profile;
  const signals: ProfileSignal[] = [];
  if (answers) {
    for (const field of Object.keys(FIELD_DOMAINS) as AnswerField[]) {
      const value = answers[field];
      if (typeof value === "string" && value.trim()) {
        signals.push(signal(field, value.trim()));
      }
    }
  }

  const [minimumPartnerAge, maximumPartnerAge] = parseAgeRange(
    answers?.partnerAgeRange || null,
  );
  const contradictions: string[] = [];
  const successImportance = normalize(answers?.partnerSuccessImportance || "");
  const nonNegotiables = normalize(answers?.nonNegotiables || "");
  if (
    /not very|mainly care.*stable/.test(successImportance) &&
    /status|wealth|rich|high earner|successful career/.test(nonNegotiables)
  ) {
    contradictions.push(
      "Career/status is described as unimportant in one answer but required in another.",
    );
  }
  if (
    normalize(answers?.backgroundOpenToOther || "").startsWith("yes") &&
    /only|must|dealbreaker/.test(normalize(answers?.backgroundImportance || ""))
  ) {
    contradictions.push(
      "Background is described both as a requirement and as open to flexibility.",
    );
  }

  const result: MatchProfile = {
    version: PROFILE_VERSION,
    extractorVersion: EXTRACTOR_VERSION,
    personId: person.id,
    sourceHash: sourceHash(person),
    generatedAt: new Date().toISOString(),
    practical: {
      gender: parseGender(person.gender),
      lookingFor: parseLookingFor(person.lookingFor),
      age: person.age,
      minimumPartnerAge,
      maximumPartnerAge,
      location: answers?.everydayLife || answers?.location || null,
      relocation: parseRelocation(answers?.everydayLife || answers?.relocationFlexibility || null),
      wantsChildren: parseYesNoUnsure(answers?.wantsChildren || null),
      hasChildren: parseHasChildren(answers?.hasChildren || null),
      openToPartnerChildren: parseYesNoUnsure(answers?.openToPartnerChildren || null),
      smokingBoundary: parseSmoking(answers?.smokingBoundaries || null),
      marriageTimeline: answers?.marriageTimeline || null,
    },
    traits: {
      socialEnergy: scale(
        answers?.socialStyle || null,
        ["very social", "adventur", "always traveling"],
        ["homebody", "quiet", "low key"],
      ),
      ambition: scale(
        answers?.ambition || null,
        ["very", "ambitious", "driven"],
        ["not particularly", "not ambitious"],
      ),
      conflictImmediacy: scale(
        answers?.conflictStyle || null,
        ["immediately", "right away"],
        ["time first", "space", "avoid"],
      ),
      emotionalAvailability: scale(
        [answers?.bringToRelationship, answers?.availabilityFeelings].filter(Boolean).join(" "),
        ["available", "present", "consistent", "open"],
        ["unavailable", "distant", "avoid"],
      ),
    },
    signals,
    contradictions,
    excludedFields: [
      {
        field: "photoUrl",
        reason: "Photos are for matchmaker review and never enter automatic desirability scoring.",
      },
      {
        field: "work",
        reason: "Work is context only; profession and status never become global desirability.",
      },
      {
        field: "studied",
        reason: "Education is context only; credentials never become global desirability.",
      },
    ],
  };
  return matchProfileSchema.parse(result);
}

const llmSignalsSchema = z.object({
  signals: z.array(profileSignalSchema).max(24),
});

/**
 * Optional, offline profile enrichment for ambiguous free text. It is never used
 * to create a hard constraint; callers must persist validated evidence and review it.
 */
export async function extractFreeTextSignalsWithOpenAI(
  person: PersonWithProfile,
): Promise<ProfileSignal[]> {
  if (!process.env.OPENAI_API_KEY || !person.profile) return [];
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract only directly supported matchmaking signals from the supplied answers. Return JSON {signals:[...]}. Each signal needs key, domain, value, normalized string array, importance (preference or context only), confidence 0..1, and evidence {field,quote}. Never infer a requirement, diagnosis, income, attractiveness, or protected characteristic. Evidence quotes must be exact substrings.",
        },
        { role: "user", content: JSON.stringify(person.profile) },
      ],
    });
    const parsed = llmSignalsSchema.parse(
      JSON.parse(completion.choices[0]?.message?.content || "{}"),
    );
    return parsed.signals
      .filter((item) => item.importance !== "requirement")
      .filter((item) => {
        const source = person.profile?.[item.evidence.field as keyof ProfileAnswers];
        return typeof source === "string" && source.includes(item.evidence.quote);
      });
  } catch {
    return [];
  }
}
