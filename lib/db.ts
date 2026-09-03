import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  Matchmaker,
  MatchOutcome,
  MatchRecord,
  MatchReview,
  MatchStatus,
  MatchWithDetails,
  PersonWithDetails,
  PersonWithProfile,
  StoredMatchAssessment,
} from "@/lib/types";

const globalForPrisma = globalThis as unknown as { prismaBase?: PrismaClient };
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client =
  globalForPrisma.prismaBase ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaBase = client;
}

function mapAssessment(row: {
  id: string;
  personAId: string;
  personBId: string;
  profileHashA: string;
  profileHashB: string;
  dataJson: string;
  createdAt: Date;
}): StoredMatchAssessment {
  const data = JSON.parse(row.dataJson) as Omit<
    StoredMatchAssessment,
    "id" | "personAId" | "personBId" | "profileHashA" | "profileHashB" | "createdAt"
  >;
  return {
    ...data,
    id: row.id,
    personAId: row.personAId,
    personBId: row.personBId,
    profileHashA: row.profileHashA,
    profileHashB: row.profileHashB,
    createdAt: row.createdAt,
  };
}

async function hydrateMatch(match: MatchRecord): Promise<MatchWithDetails> {
  const [personA, personB, assessment, matchmaker, outcomes] = await Promise.all([
    client.person.findUnique({
      where: { id: match.personAId },
      include: { profile: true },
    }),
    client.person.findUnique({
      where: { id: match.personBId },
      include: { profile: true },
    }),
    match.assessmentId
      ? client.matchAssessment.findUnique({ where: { id: match.assessmentId } })
      : Promise.resolve(null),
    client.matchmaker.findUnique({ where: { id: match.createdByMatchmakerId } }),
    client.matchOutcome.findMany({
      where: { matchId: match.id },
      orderBy: { occurredAt: "asc" },
    }),
  ]);

  return {
    ...match,
    personA: personA as PersonWithProfile,
    personB: personB as PersonWithProfile,
    assessment: assessment ? mapAssessment(assessment) : null,
    matchmaker: matchmaker as Matchmaker,
    outcomes: outcomes as MatchOutcome[],
  };
}

function safeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

function mapMatch(row: {
  id: string;
  personAId: string;
  personBId: string;
  source: string;
  createdByMatchmakerId: string;
  assessmentId: string | null;
  status: string;
  notes: string | null;
  overrideNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MatchRecord {
  return {
    ...row,
    source: row.source as MatchRecord["source"],
    status: row.status as MatchStatus,
  };
}

export const prisma = {
  person: client.person,
  profileAnswers: client.profileAnswers,
  message: client.message,
  matchmaker: client.matchmaker,
  derivedMatchProfile: {
    upsert: async (args: {
      personId: string;
      profileJson: string;
      sourceHash: string;
      extractorVersion: string;
    }) => {
      return client.derivedMatchProfile.upsert({
        where: {
          personId_sourceHash_extractorVersion: {
            personId: args.personId,
            sourceHash: args.sourceHash,
            extractorVersion: args.extractorVersion,
          },
        },
        create: {
          personId: args.personId,
          profileJson: args.profileJson,
          sourceHash: args.sourceHash,
          extractorVersion: args.extractorVersion,
        },
        update: {
          profileJson: args.profileJson,
        },
      });
    },
  },
  matchAssessment: {
    create: async (args: {
      personAId: string;
      personBId: string;
      profileHashA: string;
      profileHashB: string;
      algorithmVersion: string;
      profileVersion: string;
      dataJson: string;
    }): Promise<StoredMatchAssessment> => {
      const row = await client.matchAssessment.create({ data: args });
      return mapAssessment(row);
    },
    findUnique: async (args: { where: { id: string } }) => {
      const row = await client.matchAssessment.findUnique(args);
      if (!row) return null;
      return mapAssessment(row);
    },
    findLatest: async (args: {
      personAId: string;
      personBId: string;
      profileHashA?: string;
      profileHashB?: string;
      algorithmVersion?: string;
    }): Promise<StoredMatchAssessment | null> => {
      const row = await client.matchAssessment.findFirst({
        where: {
          AND: [
            {
              OR: [
                { personAId: args.personAId, personBId: args.personBId },
                { personAId: args.personBId, personBId: args.personAId },
              ],
            },
            args.profileHashA && args.profileHashB
              ? {
                  OR: [
                    {
                      profileHashA: args.profileHashA,
                      profileHashB: args.profileHashB,
                    },
                    {
                      profileHashA: args.profileHashB,
                      profileHashB: args.profileHashA,
                    },
                  ],
                }
              : {},
            args.algorithmVersion
              ? { algorithmVersion: args.algorithmVersion }
              : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      if (!row) return null;
      return mapAssessment(row);
    },
    findManyForPair: async (args: {
      personAId: string;
      personBId: string;
    }): Promise<StoredMatchAssessment[]> => {
      const rows = await client.matchAssessment.findMany({
        where: {
          OR: [
            { personAId: args.personAId, personBId: args.personBId },
            { personAId: args.personBId, personBId: args.personAId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapAssessment);
    },
  },
  match: {
    create: async (args: {
      data: {
        personAId: string;
        personBId: string;
        source: MatchRecord["source"];
        createdByMatchmakerId: string;
        assessmentId?: string | null;
        status?: MatchStatus;
        notes?: string | null;
        overrideNote?: string | null;
      };
    }) => {
      const row = await client.match.create({
        data: {
          personAId: args.data.personAId,
          personBId: args.data.personBId,
          source: args.data.source,
          createdByMatchmakerId: args.data.createdByMatchmakerId,
          assessmentId: args.data.assessmentId ?? null,
          status: args.data.status ?? "draft",
          notes: args.data.notes ?? null,
          overrideNote: args.data.overrideNote ?? null,
        },
      });
      return mapMatch(row);
    },
    update: async (args: {
      where: { id: string };
      data: Partial<Pick<MatchRecord, "status" | "notes" | "overrideNote" | "assessmentId">>;
    }) => {
      const row = await client.match.update({
        where: args.where,
        data: args.data,
      });
      return mapMatch(row);
    },
    findUnique: async (args: {
      where: { id: string };
      include?: { details?: boolean };
    }): Promise<MatchRecord | MatchWithDetails | null> => {
      const row = await client.match.findUnique({ where: args.where });
      if (!row) return null;
      const match = mapMatch(row);
      if (!args.include?.details) return match;
      return hydrateMatch(match);
    },
    findMany: async (args?: {
      where?: {
        status?: string;
        matchmakerId?: string;
        personId?: string;
      };
      include?: { details?: boolean };
    }): Promise<(MatchRecord | MatchWithDetails)[]> => {
      const where: Prisma.MatchWhereInput = {};
      if (args?.where?.status) where.status = args.where.status;
      if (args?.where?.matchmakerId) where.createdByMatchmakerId = args.where.matchmakerId;
      if (args?.where?.personId) {
        where.OR = [
          { personAId: args.where.personId },
          { personBId: args.where.personId },
        ];
      }
      const rows = await client.match.findMany({
        where,
        orderBy: { updatedAt: "desc" },
      });
      const matches = rows.map(mapMatch);
      if (!args?.include?.details) return matches;
      return Promise.all(matches.map((m) => hydrateMatch(m)));
    },
  },
  matchReview: {
    create: async (args: {
      data: {
        assessmentId: string;
        matchmakerId: string;
        decision: MatchReview["decision"];
        reasonCodes?: string[];
        notes?: string | null;
      };
    }) => {
      const row = await client.matchReview.create({
        data: {
          assessmentId: args.data.assessmentId,
          matchmakerId: args.data.matchmakerId,
          decision: args.data.decision,
          reasonCodes: JSON.stringify(args.data.reasonCodes || []),
          notes: args.data.notes ?? null,
        },
      });
      return {
        ...row,
        decision: row.decision as MatchReview["decision"],
        reasonCodes: safeJsonArray(row.reasonCodes),
      };
    },
  },
  matchOutcome: {
    create: async (args: {
      data: {
        matchId: string;
        stage: string;
        personAResponse?: string | null;
        personBResponse?: string | null;
        reasonCode?: string | null;
        notes?: string | null;
        occurredAt?: Date;
      };
    }) => {
      return client.matchOutcome.create({
        data: {
          matchId: args.data.matchId,
          stage: args.data.stage,
          personAResponse: args.data.personAResponse ?? null,
          personBResponse: args.data.personBResponse ?? null,
          reasonCode: args.data.reasonCode ?? null,
          notes: args.data.notes ?? null,
          occurredAt: args.data.occurredAt ?? new Date(),
        },
      });
    },
  },
  matchExposure: {
    create: async (args: {
      data: { assessmentId: string; personId: string; location: string };
    }) => {
      await client.matchExposure.create({ data: args.data });
    },
  },
  matchingAnalytics: {
    recordShadowEvaluation: async (args: {
      personId: string;
      algorithmVersion: string;
      newRanking: string[];
      legacyRanking: string[];
      pairwiseAgreement: number;
      falseExclusions: number;
    }) => {
      await client.shadowEvaluation.create({
        data: {
          personId: args.personId,
          algorithmVersion: args.algorithmVersion,
          newRankingJson: JSON.stringify(args.newRanking),
          legacyRankingJson: JSON.stringify(args.legacyRanking),
          pairwiseAgreement: args.pairwiseAgreement,
          falseExclusions: args.falseExclusions,
        },
      });
    },
    summary: async () => {
      const [
        assessments,
        exposures,
        reviews,
        bilateralOutcomes,
        secondDates,
        shadowRuns,
        shadowAgg,
        concentration,
      ] = await Promise.all([
        client.matchAssessment.count(),
        client.matchExposure.count(),
        client.matchReview.count(),
        client.matchOutcome.count({
          where: {
            personAResponse: { not: null },
            personBResponse: { not: null },
          },
        }),
        client.matchOutcome.count({ where: { stage: "second_date" } }),
        client.shadowEvaluation.count(),
        client.shadowEvaluation.aggregate({
          _avg: { pairwiseAgreement: true },
          _sum: { falseExclusions: true },
        }),
        client.matchExposure.groupBy({
          by: ["personId"],
          _count: { personId: true },
          orderBy: { _count: { personId: "desc" } },
          take: 10,
        }),
      ]);

      return {
        assessments,
        exposures,
        reviews,
        bilateralOutcomes,
        secondDates,
        shadowRuns,
        pairwiseAgreement: shadowAgg._avg.pairwiseAgreement,
        falseExclusions: shadowAgg._sum.falseExclusions || 0,
        concentration: concentration.map((row) => ({
          personId: row.personId,
          exposures: row._count.personId,
        })),
      };
    },
  },
  async ensureMatchmakers() {
    for (const name of ["Vanessa", "Noga"] as const) {
      await client.matchmaker.upsert({
        where: { name },
        create: { name },
        update: {},
      });
    }
  },
};

// Keep types usable for callers casting PersonWithDetails etc.
export type { PersonWithDetails, PersonWithProfile };
