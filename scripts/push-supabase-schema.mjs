/**
 * Push TOIMOI matchmaking tables to Supabase Postgres.
 * Used because Prisma engines don't run on Windows ARM64 locally.
 */
import fs from "fs";
import path from "path";
import pg from "pg";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DIRECT_URL / DATABASE_URL");
  process.exit(1);
}

const profileColumns = [
  "location",
  "everydayLife",
  "grewUp",
  "grewUpInfluence",
  "familyBackground",
  "momBackground",
  "dadBackground",
  "connectedSide",
  "datingBackgroundPreference",
  "backgroundImportance",
  "backgroundWhy",
  "backgroundOpenToOther",
  "familyCloseness",
  "siblings",
  "bringIntoMarriage",
  "doDifferently",
  "religiosity",
  "religiosityDirection",
  "partnerReligiosity",
  "futureHomeReligious",
  "synagogueYesNo",
  "synagogueName",
  "communityImportance",
  "studied",
  "work",
  "workEnjoyment",
  "ambition",
  "partnerSuccessImportance",
  "successMeaning",
  "threeWords",
  "selfDescription",
  "hiddenSide",
  "misunderstoodAs",
  "hobbies",
  "socialStyle",
  "perfectSunday",
  "loveLanguageReceive",
  "loveLanguageGive",
  "connectionDrivers",
  "connectionFollowup",
  "conflictStyle",
  "disagreementNeeds",
  "datingLesson",
  "repeatsType",
  "typeInCommon",
  "typeGoodForThem",
  "availabilityFeelings",
  "availabilityCoachingNotes",
  "sparkHistory",
  "openWithoutFireworks",
  "coreEmotionalNeeds",
  "nonNegotiables",
  "nonNegotiableChallenge",
  "partnerQualities",
  "qualityDefinitions",
  "personalityAttracted",
  "personalityNotAttracted",
  "physicalAttracted",
  "attractionMeaning",
  "physicalNotAttracted",
  "physicalMustOrPrefer",
  "familyImportance",
  "wantsChildren",
  "raisingFamily",
  "judaismForChildren",
  "fiveYearLife",
  "homeFeel",
  "ordinaryDay",
  "lookingForwardMost",
  "bringToRelationship",
  "difficultAboutDatingThem",
  "growthEdge",
  "unseenSide",
  "bestFriendDescription",
  "mirrorReflection",
  "mirrorResonance",
  "mindsetShift",
  "doDifferentlyNext",
  "readiness",
  "partnerAgeRange",
  "relocationFlexibility",
  "hasChildren",
  "openToPartnerChildren",
  "smokingBoundaries",
  "marriageTimeline",
  "matchmakerEligibilityNotes",
  "profileJson",
]
  .map((c) => `"${c}" TEXT`)
  .join(",\n  ");

const sql = `
CREATE TABLE IF NOT EXISTS "Person" (
  "id" TEXT PRIMARY KEY,
  "phone" TEXT NOT NULL UNIQUE,
  "firstName" TEXT,
  "dateOfBirth" TEXT,
  "email" TEXT,
  "photoUrl" TEXT,
  "age" INTEGER,
  "gender" TEXT,
  "lookingFor" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "currentStep" TEXT NOT NULL DEFAULT 'opening',
  "branchFlags" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "pausedAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "ProfileAnswers" (
  "id" TEXT PRIMARY KEY,
  "personId" TEXT NOT NULL UNIQUE REFERENCES "Person"("id") ON DELETE CASCADE,
  ${profileColumns},
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT PRIMARY KEY,
  "personId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "direction" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "twilioSid" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Message_personId_createdAt_idx" ON "Message"("personId", "createdAt");

CREATE TABLE IF NOT EXISTS "Matchmaker" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DerivedMatchProfile" (
  "id" TEXT PRIMARY KEY,
  "personId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "profileJson" TEXT NOT NULL,
  "sourceHash" TEXT NOT NULL,
  "extractorVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("personId", "sourceHash", "extractorVersion")
);

CREATE TABLE IF NOT EXISTS "MatchAssessment" (
  "id" TEXT PRIMARY KEY,
  "personAId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "personBId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "profileHashA" TEXT NOT NULL,
  "profileHashB" TEXT NOT NULL,
  "algorithmVersion" TEXT NOT NULL,
  "profileVersion" TEXT NOT NULL,
  "dataJson" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MatchAssessment_personAId_personBId_createdAt_idx"
  ON "MatchAssessment"("personAId", "personBId", "createdAt");

CREATE TABLE IF NOT EXISTS "Match" (
  "id" TEXT PRIMARY KEY,
  "personAId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "personBId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "source" TEXT NOT NULL,
  "createdByMatchmakerId" TEXT NOT NULL REFERENCES "Matchmaker"("id"),
  "assessmentId" TEXT REFERENCES "MatchAssessment"("id"),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "notes" TEXT,
  "overrideNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Match_status_updatedAt_idx" ON "Match"("status", "updatedAt");
CREATE INDEX IF NOT EXISTS "Match_personAId_personBId_idx" ON "Match"("personAId", "personBId");

CREATE TABLE IF NOT EXISTS "MatchReview" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT NOT NULL REFERENCES "MatchAssessment"("id") ON DELETE CASCADE,
  "matchmakerId" TEXT NOT NULL REFERENCES "Matchmaker"("id"),
  "decision" TEXT NOT NULL,
  "reasonCodes" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MatchOutcome" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL REFERENCES "Match"("id") ON DELETE CASCADE,
  "stage" TEXT NOT NULL,
  "personAResponse" TEXT,
  "personBResponse" TEXT,
  "reasonCode" TEXT,
  "notes" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MatchOutcome_matchId_occurredAt_idx" ON "MatchOutcome"("matchId", "occurredAt");

CREATE TABLE IF NOT EXISTS "MatchExposure" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT NOT NULL REFERENCES "MatchAssessment"("id") ON DELETE CASCADE,
  "personId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "location" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MatchExposure_personId_createdAt_idx" ON "MatchExposure"("personId", "createdAt");

CREATE TABLE IF NOT EXISTS "ShadowEvaluation" (
  "id" TEXT PRIMARY KEY,
  "personId" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE,
  "algorithmVersion" TEXT NOT NULL,
  "newRankingJson" TEXT NOT NULL,
  "legacyRankingJson" TEXT NOT NULL,
  "pairwiseAgreement" DOUBLE PRECISION NOT NULL,
  "falseExclusions" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ShadowEvaluation_personId_createdAt_idx"
  ON "ShadowEvaluation"("personId", "createdAt");

INSERT INTO "Matchmaker" ("id", "name", "createdAt")
VALUES
  ('seed_vanessa', 'Vanessa', CURRENT_TIMESTAMP),
  ('seed_noga', 'Noga', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT;
ALTER TABLE "ProfileAnswers" ADD COLUMN IF NOT EXISTS "everydayLife" TEXT;
ALTER TABLE "ProfileAnswers" ADD COLUMN IF NOT EXISTS "selfDescription" TEXT;
ALTER TABLE "ProfileAnswers" ADD COLUMN IF NOT EXISTS "attractionMeaning" TEXT;
ALTER TABLE "ProfileAnswers" ADD COLUMN IF NOT EXISTS "readiness" TEXT;
`;

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );
  console.log(
    "OK tables:",
    tables.rows.map((r) => r.tablename).join(", "),
  );
} finally {
  await client.end();
}
