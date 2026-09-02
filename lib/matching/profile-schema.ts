import { z } from "zod";

export const PROFILE_VERSION = "match-profile-v1";
export const EXTRACTOR_VERSION = "deterministic-v1";

export const compatibilityDomainSchema = z.enum([
  "jewish_life",
  "family_future",
  "values_character",
  "emotional_fit",
  "communication",
  "lifestyle",
  "ambition",
  "culture",
  "attraction",
  "practical",
  "coaching",
]);

export type CompatibilityDomain = z.infer<typeof compatibilityDomainSchema>;

export const importanceSchema = z.enum([
  "requirement",
  "strong_preference",
  "preference",
  "context",
]);

export type SignalImportance = z.infer<typeof importanceSchema>;

export const profileSignalSchema = z.object({
  key: z.string(),
  domain: compatibilityDomainSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  normalized: z.array(z.string()),
  importance: importanceSchema,
  confidence: z.number().min(0).max(1),
  evidence: z.object({
    field: z.string(),
    quote: z.string(),
  }),
});

export type ProfileSignal = z.infer<typeof profileSignalSchema>;

export const matchProfileSchema = z.object({
  version: z.literal(PROFILE_VERSION),
  extractorVersion: z.literal(EXTRACTOR_VERSION),
  personId: z.string(),
  sourceHash: z.string(),
  generatedAt: z.string(),
  practical: z.object({
    gender: z.enum(["woman", "man"]).nullable(),
    lookingFor: z.enum(["women", "men"]).nullable(),
    age: z.number().int().min(18).max(99).nullable(),
    minimumPartnerAge: z.number().int().min(18).max(99).nullable(),
    maximumPartnerAge: z.number().int().min(18).max(99).nullable(),
    location: z.string().nullable(),
    relocation: z.enum(["no", "maybe", "yes"]).nullable(),
    wantsChildren: z.enum(["yes", "no", "unsure"]).nullable(),
    hasChildren: z.enum(["yes", "no", "unknown"]).nullable(),
    openToPartnerChildren: z.enum(["yes", "no", "unsure"]).nullable(),
    smokingBoundary: z.enum(["none", "no_smoking", "context"]).nullable(),
    marriageTimeline: z.string().nullable(),
  }),
  traits: z.object({
    socialEnergy: z.number().min(0).max(1).nullable(),
    ambition: z.number().min(0).max(1).nullable(),
    conflictImmediacy: z.number().min(0).max(1).nullable(),
    emotionalAvailability: z.number().min(0).max(1).nullable(),
  }),
  signals: z.array(profileSignalSchema),
  contradictions: z.array(z.string()),
  excludedFields: z.array(
    z.object({
      field: z.string(),
      reason: z.string(),
    }),
  ),
});

export type MatchProfile = z.infer<typeof matchProfileSchema>;
