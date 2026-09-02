import fs from "fs";
import path from "path";
import crypto from "crypto";
import initSqlJs, { Database, SqlValue } from "sql.js";
import type {
  Message,
  Matchmaker,
  MatchOutcome,
  MatchRecord,
  MatchReview,
  MatchStatus,
  MatchWithDetails,
  Person,
  PersonUpdateInput,
  PersonWithDetails,
  PersonWithProfile,
  ProfileAnswers,
  ProfileUpdateInput,
  StoredMatchAssessment,
} from "@/lib/types";

const DB_PATH = path.join(
  process.cwd(),
  "data",
  process.env.TOIMO_DB_FILENAME || "toimo.sqlite",
);

function cuid(): string {
  return crypto.randomBytes(12).toString("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

function asDate(value: SqlValue | undefined): Date {
  if (!value) return new Date(0);
  return new Date(String(value));
}

function asNullableDate(value: SqlValue | undefined): Date | null {
  if (value == null || value === "") return null;
  return new Date(String(value));
}

function rowToObject(columns: string[], values: SqlValue[]): Record<string, SqlValue> {
  const obj: Record<string, SqlValue> = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  return obj;
}

function mapPerson(row: Record<string, SqlValue>): Person {
  return {
    id: String(row.id),
    phone: String(row.phone),
    firstName: row.firstName == null ? null : String(row.firstName),
    email: row.email == null ? null : String(row.email),
    photoUrl: row.photoUrl == null ? null : String(row.photoUrl),
    age: row.age == null ? null : Number(row.age),
    gender: row.gender == null ? null : String(row.gender),
    lookingFor: row.lookingFor == null ? null : String(row.lookingFor),
    status: String(row.status),
    currentStep: String(row.currentStep),
    branchFlags: String(row.branchFlags ?? "{}"),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
    completedAt: asNullableDate(row.completedAt),
    pausedAt: asNullableDate(row.pausedAt),
  };
}

const PROFILE_FIELDS = [
  "location",
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
  "partnerAgeRange",
  "relocationFlexibility",
  "hasChildren",
  "openToPartnerChildren",
  "smokingBoundaries",
  "marriageTimeline",
  "matchmakerEligibilityNotes",
  "profileJson",
] as const;

function mapProfile(row: Record<string, SqlValue>): ProfileAnswers {
  const base: ProfileAnswers = {
    id: String(row.id),
    personId: String(row.personId),
    location: null,
    grewUp: null,
    grewUpInfluence: null,
    familyBackground: null,
    momBackground: null,
    dadBackground: null,
    connectedSide: null,
    datingBackgroundPreference: null,
    backgroundImportance: null,
    backgroundWhy: null,
    backgroundOpenToOther: null,
    familyCloseness: null,
    siblings: null,
    bringIntoMarriage: null,
    doDifferently: null,
    religiosity: null,
    religiosityDirection: null,
    partnerReligiosity: null,
    futureHomeReligious: null,
    synagogueYesNo: null,
    synagogueName: null,
    communityImportance: null,
    studied: null,
    work: null,
    workEnjoyment: null,
    ambition: null,
    partnerSuccessImportance: null,
    successMeaning: null,
    threeWords: null,
    hiddenSide: null,
    misunderstoodAs: null,
    hobbies: null,
    socialStyle: null,
    perfectSunday: null,
    loveLanguageReceive: null,
    loveLanguageGive: null,
    connectionDrivers: null,
    connectionFollowup: null,
    conflictStyle: null,
    disagreementNeeds: null,
    datingLesson: null,
    repeatsType: null,
    typeInCommon: null,
    typeGoodForThem: null,
    availabilityFeelings: null,
    availabilityCoachingNotes: null,
    sparkHistory: null,
    openWithoutFireworks: null,
    coreEmotionalNeeds: null,
    nonNegotiables: null,
    nonNegotiableChallenge: null,
    partnerQualities: null,
    qualityDefinitions: null,
    personalityAttracted: null,
    personalityNotAttracted: null,
    physicalAttracted: null,
    physicalNotAttracted: null,
    physicalMustOrPrefer: null,
    familyImportance: null,
    wantsChildren: null,
    raisingFamily: null,
    judaismForChildren: null,
    fiveYearLife: null,
    homeFeel: null,
    ordinaryDay: null,
    lookingForwardMost: null,
    bringToRelationship: null,
    difficultAboutDatingThem: null,
    growthEdge: null,
    unseenSide: null,
    bestFriendDescription: null,
    mirrorReflection: null,
    mirrorResonance: null,
    mindsetShift: null,
    doDifferentlyNext: null,
    partnerAgeRange: null,
    relocationFlexibility: null,
    hasChildren: null,
    openToPartnerChildren: null,
    smokingBoundaries: null,
    marriageTimeline: null,
    matchmakerEligibilityNotes: null,
    profileJson: null,
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };

  for (const field of PROFILE_FIELDS) {
    base[field] = row[field] == null ? null : String(row[field]);
  }
  return base;
}

function mapMessage(row: Record<string, SqlValue>): Message {
  return {
    id: String(row.id),
    personId: String(row.personId),
    direction: String(row.direction),
    body: String(row.body),
    twilioSid: row.twilioSid == null ? null : String(row.twilioSid),
    createdAt: asDate(row.createdAt),
  };
}

function parseJson<T>(value: SqlValue | undefined, fallback: T): T {
  try {
    return JSON.parse(String(value || "")) as T;
  } catch {
    return fallback;
  }
}

function mapMatchmaker(row: Record<string, SqlValue>): Matchmaker {
  return {
    id: String(row.id),
    name: String(row.name) as Matchmaker["name"],
    createdAt: asDate(row.createdAt),
  };
}

function mapAssessment(row: Record<string, SqlValue>): StoredMatchAssessment {
  const data = parseJson<Omit<StoredMatchAssessment, "id" | "personAId" | "personBId" | "profileHashA" | "profileHashB" | "createdAt">>(
    row.dataJson,
    {} as Omit<
      StoredMatchAssessment,
      "id" | "personAId" | "personBId" | "profileHashA" | "profileHashB" | "createdAt"
    >,
  );
  return {
    ...data,
    id: String(row.id),
    personAId: String(row.personAId),
    personBId: String(row.personBId),
    profileHashA: String(row.profileHashA),
    profileHashB: String(row.profileHashB),
    createdAt: asDate(row.createdAt),
  };
}

function mapMatch(row: Record<string, SqlValue>): MatchRecord {
  return {
    id: String(row.id),
    personAId: String(row.personAId),
    personBId: String(row.personBId),
    source: String(row.source) as MatchRecord["source"],
    createdByMatchmakerId: String(row.createdByMatchmakerId),
    assessmentId: row.assessmentId == null ? null : String(row.assessmentId),
    status: String(row.status) as MatchStatus,
    notes: row.notes == null ? null : String(row.notes),
    overrideNote: row.overrideNote == null ? null : String(row.overrideNote),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function mapReview(row: Record<string, SqlValue>): MatchReview {
  return {
    id: String(row.id),
    assessmentId: String(row.assessmentId),
    matchmakerId: String(row.matchmakerId),
    decision: String(row.decision) as MatchReview["decision"],
    reasonCodes: parseJson<string[]>(row.reasonCodes, []),
    notes: row.notes == null ? null : String(row.notes),
    createdAt: asDate(row.createdAt),
  };
}

function mapOutcome(row: Record<string, SqlValue>): MatchOutcome {
  return {
    id: String(row.id),
    matchId: String(row.matchId),
    stage: String(row.stage),
    personAResponse: row.personAResponse == null ? null : String(row.personAResponse),
    personBResponse: row.personBResponse == null ? null : String(row.personBResponse),
    reasonCode: row.reasonCode == null ? null : String(row.reasonCode),
    notes: row.notes == null ? null : String(row.notes),
    occurredAt: asDate(row.occurredAt),
    createdAt: asDate(row.createdAt),
  };
}

class Db {
  private db: Database | null = null;
  private ready: Promise<void> | null = null;

  private async ensure(): Promise<Database> {
    if (this.db) return this.db;
    if (!this.ready) this.ready = this.init();
    await this.ready;
    return this.db!;
  }

  private async init() {
    const SQL = await initSqlJs({
      locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }
    this.migrate(this.db);
    this.persist();
  }

  private ensureColumn(db: Database, table: string, column: string, typeSql: string) {
    const cols = db.exec(`PRAGMA table_info(${table})`);
    const names = new Set((cols[0]?.values || []).map((v) => String(v[1])));
    if (!names.has(column)) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeSql}`);
    }
  }

  private migrate(db: Database) {
    db.run(`
      CREATE TABLE IF NOT EXISTS Person (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE NOT NULL,
        firstName TEXT,
        email TEXT,
        photoUrl TEXT,
        age INTEGER,
        gender TEXT,
        lookingFor TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        currentStep TEXT NOT NULL DEFAULT 'opening',
        branchFlags TEXT NOT NULL DEFAULT '{}',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        completedAt TEXT,
        pausedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS ProfileAnswers (
        id TEXT PRIMARY KEY,
        personId TEXT UNIQUE NOT NULL,
        ${PROFILE_FIELDS.map((f) => `${f} TEXT`).join(",\n        ")},
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(personId) REFERENCES Person(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Message (
        id TEXT PRIMARY KEY,
        personId TEXT NOT NULL,
        direction TEXT NOT NULL,
        body TEXT NOT NULL,
        twilioSid TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(personId) REFERENCES Person(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_message_person_created
        ON Message(personId, createdAt);

      CREATE TABLE IF NOT EXISTS Matchmaker (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS DerivedMatchProfile (
        id TEXT PRIMARY KEY,
        personId TEXT NOT NULL,
        profileJson TEXT NOT NULL,
        sourceHash TEXT NOT NULL,
        extractorVersion TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        UNIQUE(personId, sourceHash, extractorVersion)
      );

      CREATE TABLE IF NOT EXISTS MatchAssessment (
        id TEXT PRIMARY KEY,
        personAId TEXT NOT NULL,
        personBId TEXT NOT NULL,
        profileHashA TEXT NOT NULL,
        profileHashB TEXT NOT NULL,
        algorithmVersion TEXT NOT NULL,
        profileVersion TEXT NOT NULL,
        dataJson TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_assessment_pair_created
        ON MatchAssessment(personAId, personBId, createdAt);

      CREATE TABLE IF NOT EXISTS Match (
        id TEXT PRIMARY KEY,
        personAId TEXT NOT NULL,
        personBId TEXT NOT NULL,
        source TEXT NOT NULL,
        createdByMatchmakerId TEXT NOT NULL,
        assessmentId TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        overrideNote TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_match_status_updated ON Match(status, updatedAt);
      CREATE INDEX IF NOT EXISTS idx_match_pair ON Match(personAId, personBId);

      CREATE TABLE IF NOT EXISTS MatchReview (
        id TEXT PRIMARY KEY,
        assessmentId TEXT NOT NULL,
        matchmakerId TEXT NOT NULL,
        decision TEXT NOT NULL,
        reasonCodes TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS MatchOutcome (
        id TEXT PRIMARY KEY,
        matchId TEXT NOT NULL,
        stage TEXT NOT NULL,
        personAResponse TEXT,
        personBResponse TEXT,
        reasonCode TEXT,
        notes TEXT,
        occurredAt TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_outcome_match_occurred
        ON MatchOutcome(matchId, occurredAt);

      CREATE TABLE IF NOT EXISTS MatchExposure (
        id TEXT PRIMARY KEY,
        assessmentId TEXT NOT NULL,
        personId TEXT NOT NULL,
        location TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_exposure_person_created
        ON MatchExposure(personId, createdAt);

      CREATE TABLE IF NOT EXISTS ShadowEvaluation (
        id TEXT PRIMARY KEY,
        personId TEXT NOT NULL,
        algorithmVersion TEXT NOT NULL,
        newRankingJson TEXT NOT NULL,
        legacyRankingJson TEXT NOT NULL,
        pairwiseAgreement REAL NOT NULL,
        falseExclusions INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_shadow_person_created
        ON ShadowEvaluation(personId, createdAt);
    `);

    // Existing DBs created before email/photo
    this.ensureColumn(db, "Person", "email", "TEXT");
    this.ensureColumn(db, "Person", "photoUrl", "TEXT");
    for (const field of PROFILE_FIELDS) {
      this.ensureColumn(db, "ProfileAnswers", field, "TEXT");
    }
    const seededAt = nowIso();
    db.run(
      `INSERT OR IGNORE INTO Matchmaker (id, name, createdAt) VALUES
        ('matchmaker_vanessa', 'Vanessa', ?),
        ('matchmaker_noga', 'Noga', ?)`,
      [seededAt, seededAt],
    );
  }

  private persist() {
    if (!this.db) return;
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  private all(sql: string, params: SqlValue[] = []): Record<string, SqlValue>[] {
    const stmt = this.db!.prepare(sql);
    stmt.bind(params);
    const rows: Record<string, SqlValue>[] = [];
    while (stmt.step()) {
      const values = stmt.get();
      rows.push(rowToObject(stmt.getColumnNames(), values));
    }
    stmt.free();
    return rows;
  }

  private get(sql: string, params: SqlValue[] = []): Record<string, SqlValue> | null {
    const rows = this.all(sql, params);
    return rows[0] || null;
  }

  private run(sql: string, params: SqlValue[] = []) {
    this.db!.run(sql, params);
    this.persist();
  }

  person = {
    findUnique: async (args: {
      where: { id?: string; phone?: string };
      include?: {
        profile?: boolean;
        messages?: boolean | { orderBy?: { createdAt: "asc" | "desc" }; take?: number };
      };
    }): Promise<PersonWithDetails | PersonWithProfile | Person | null> => {
      await this.ensure();
      const row = args.where.id
        ? this.get(`SELECT * FROM Person WHERE id = ?`, [args.where.id])
        : this.get(`SELECT * FROM Person WHERE phone = ?`, [args.where.phone!]);
      if (!row) return null;
      const person = mapPerson(row);
      if (!args.include) return person;

      let profile: ProfileAnswers | null = null;
      if (args.include.profile) {
        const p = this.get(`SELECT * FROM ProfileAnswers WHERE personId = ?`, [person.id]);
        profile = p ? mapProfile(p) : null;
      }

      let messages: Message[] | undefined;
      if (args.include.messages) {
        const order =
          typeof args.include.messages === "object" &&
          args.include.messages.orderBy?.createdAt === "desc"
            ? "DESC"
            : "ASC";
        const take =
          typeof args.include.messages === "object" ? args.include.messages.take : undefined;
        const sql = take
          ? `SELECT * FROM Message WHERE personId = ? ORDER BY createdAt ${order} LIMIT ?`
          : `SELECT * FROM Message WHERE personId = ? ORDER BY createdAt ${order}`;
        const params: SqlValue[] = take ? [person.id, take] : [person.id];
        messages = this.all(sql, params).map(mapMessage);
      }

      if (messages) return { ...person, profile, messages };
      return { ...person, profile };
    },

    findUniqueOrThrow: async (args: {
      where: { id: string };
      include?: {
        profile?: boolean;
        messages?: boolean | { orderBy?: { createdAt: "asc" | "desc" }; take?: number };
      };
    }) => {
      const person = await this.person.findUnique(args);
      if (!person) throw new Error(`Person ${args.where.id} not found`);
      return person;
    },

    findMany: async (args?: {
      where?: { status?: string; id?: { not: string } };
      include?: { profile?: boolean };
      orderBy?: { updatedAt: "desc" | "asc" };
    }): Promise<PersonWithProfile[]> => {
      await this.ensure();
      const where: string[] = [];
      const params: SqlValue[] = [];
      if (args?.where?.status) {
        where.push("status = ?");
        params.push(args.where.status);
      }
      if (args?.where?.id?.not) {
        where.push("id != ?");
        params.push(args.where.id.not);
      }
      const order = args?.orderBy?.updatedAt === "asc" ? "ASC" : "DESC";
      const sql = `SELECT * FROM Person ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY updatedAt ${order}`;
      const people = this.all(sql, params).map(mapPerson);
      if (!args?.include?.profile) {
        return people.map((p) => ({ ...p, profile: null }));
      }
      return people.map((p) => {
        const row = this.get(`SELECT * FROM ProfileAnswers WHERE personId = ?`, [p.id]);
        return { ...p, profile: row ? mapProfile(row) : null };
      });
    },

    create: async (args: {
      data: {
        phone: string;
        status?: string;
        currentStep?: string;
      };
      include?: { profile?: boolean };
    }): Promise<PersonWithProfile> => {
      await this.ensure();
      const id = cuid();
      const ts = nowIso();
      this.run(
        `INSERT INTO Person (id, phone, status, currentStep, branchFlags, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, '{}', ?, ?)`,
        [
          id,
          args.data.phone,
          args.data.status || "new",
          args.data.currentStep || "opening",
          ts,
          ts,
        ],
      );
      const person = (await this.person.findUnique({
        where: { id },
        include: { profile: true },
      })) as PersonWithProfile;
      return person;
    },

    update: async (args: {
      where: { id: string };
      data: PersonUpdateInput;
      include?: { profile?: boolean };
    }): Promise<PersonWithProfile | Person> => {
      await this.ensure();
      const data = { ...args.data };
      const fields = Object.keys(data) as (keyof PersonUpdateInput)[];
      if (!fields.length) {
        return (await this.person.findUnique({
          where: { id: args.where.id },
          include: args.include,
        })) as Person;
      }

      const sets: string[] = [];
      const params: SqlValue[] = [];
      for (const key of fields) {
        const value = data[key];
        sets.push(`${key} = ?`);
        if (value instanceof Date) params.push(value.toISOString());
        else if (value === null) params.push(null);
        else if (value === undefined) continue;
        else params.push(value as SqlValue);
      }
      sets.push("updatedAt = ?");
      params.push(nowIso());
      params.push(args.where.id);
      this.run(`UPDATE Person SET ${sets.join(", ")} WHERE id = ?`, params);
      return (await this.person.findUnique({
        where: { id: args.where.id },
        include: args.include || { profile: true },
      })) as PersonWithProfile;
    },
  };

  profileAnswers = {
    upsert: async (args: {
      where: { personId: string };
      create: { personId: string };
      update: Record<string, never>;
    }): Promise<ProfileAnswers> => {
      await this.ensure();
      const existing = this.get(`SELECT * FROM ProfileAnswers WHERE personId = ?`, [
        args.where.personId,
      ]);
      if (existing) return mapProfile(existing);
      const id = cuid();
      const ts = nowIso();
      this.run(
        `INSERT INTO ProfileAnswers (id, personId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
        [id, args.create.personId, ts, ts],
      );
      return mapProfile(this.get(`SELECT * FROM ProfileAnswers WHERE id = ?`, [id])!);
    },

    update: async (args: {
      where: { personId: string };
      data: ProfileUpdateInput;
    }): Promise<ProfileAnswers> => {
      await this.ensure();
      const data = { ...args.data };
      const fields = Object.keys(data) as (keyof ProfileUpdateInput)[];
      const sets: string[] = [];
      const params: SqlValue[] = [];
      for (const key of fields) {
        const value = data[key];
        if (value === undefined) continue;
        sets.push(`${key} = ?`);
        params.push(value as SqlValue);
      }
      sets.push("updatedAt = ?");
      params.push(nowIso());
      params.push(args.where.personId);
      if (sets.length > 1) {
        this.run(`UPDATE ProfileAnswers SET ${sets.join(", ")} WHERE personId = ?`, params);
      }
      const row = this.get(`SELECT * FROM ProfileAnswers WHERE personId = ?`, [args.where.personId]);
      if (!row) throw new Error("Profile not found");
      return mapProfile(row);
    },

    deleteMany: async (args: { where: { personId: string } }) => {
      await this.ensure();
      this.run(`DELETE FROM ProfileAnswers WHERE personId = ?`, [args.where.personId]);
    },
  };

  message = {
    create: async (args: {
      data: {
        personId: string;
        direction: string;
        body: string;
        twilioSid?: string;
      };
    }): Promise<Message> => {
      await this.ensure();
      const id = cuid();
      const ts = nowIso();
      this.run(
        `INSERT INTO Message (id, personId, direction, body, twilioSid, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.data.personId,
          args.data.direction,
          args.data.body,
          args.data.twilioSid || null,
          ts,
        ],
      );
      return mapMessage(this.get(`SELECT * FROM Message WHERE id = ?`, [id])!);
    },

    count: async (args: {
      where: { personId: string; direction?: string };
    }): Promise<number> => {
      await this.ensure();
      const row = args.where.direction
        ? this.get(
            `SELECT COUNT(*) as c FROM Message WHERE personId = ? AND direction = ?`,
            [args.where.personId, args.where.direction],
          )
        : this.get(`SELECT COUNT(*) as c FROM Message WHERE personId = ?`, [
            args.where.personId,
          ]);
      return Number(row?.c || 0);
    },
  };

  derivedMatchProfile = {
    upsert: async (args: {
      personId: string;
      profileJson: string;
      sourceHash: string;
      extractorVersion: string;
    }): Promise<{ id: string }> => {
      await this.ensure();
      const existing = this.get(
        `SELECT id FROM DerivedMatchProfile
         WHERE personId = ? AND sourceHash = ? AND extractorVersion = ?`,
        [args.personId, args.sourceHash, args.extractorVersion],
      );
      if (existing) return { id: String(existing.id) };
      const id = cuid();
      this.run(
        `INSERT INTO DerivedMatchProfile
          (id, personId, profileJson, sourceHash, extractorVersion, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.personId,
          args.profileJson,
          args.sourceHash,
          args.extractorVersion,
          nowIso(),
        ],
      );
      return { id };
    },
  };

  matchmaker = {
    findMany: async (): Promise<Matchmaker[]> => {
      await this.ensure();
      return this.all(`SELECT * FROM Matchmaker ORDER BY name`).map(mapMatchmaker);
    },
    findUnique: async (args: {
      where: { id?: string; name?: string };
    }): Promise<Matchmaker | null> => {
      await this.ensure();
      const row = args.where.id
        ? this.get(`SELECT * FROM Matchmaker WHERE id = ?`, [args.where.id])
        : this.get(`SELECT * FROM Matchmaker WHERE name = ?`, [args.where.name!]);
      return row ? mapMatchmaker(row) : null;
    },
  };

  matchAssessment = {
    create: async (args: {
      personAId: string;
      personBId: string;
      profileHashA: string;
      profileHashB: string;
      algorithmVersion: string;
      profileVersion: string;
      dataJson: string;
    }): Promise<StoredMatchAssessment> => {
      await this.ensure();
      const id = cuid();
      this.run(
        `INSERT INTO MatchAssessment
          (id, personAId, personBId, profileHashA, profileHashB, algorithmVersion,
           profileVersion, dataJson, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.personAId,
          args.personBId,
          args.profileHashA,
          args.profileHashB,
          args.algorithmVersion,
          args.profileVersion,
          args.dataJson,
          nowIso(),
        ],
      );
      return mapAssessment(this.get(`SELECT * FROM MatchAssessment WHERE id = ?`, [id])!);
    },
    findUnique: async (args: {
      where: { id: string };
    }): Promise<StoredMatchAssessment | null> => {
      await this.ensure();
      const row = this.get(`SELECT * FROM MatchAssessment WHERE id = ?`, [args.where.id]);
      return row ? mapAssessment(row) : null;
    },
    findLatest: async (args: {
      personAId: string;
      personBId: string;
      profileHashA?: string;
      profileHashB?: string;
      algorithmVersion?: string;
    }): Promise<StoredMatchAssessment | null> => {
      await this.ensure();
      const clauses = [
        `((personAId = ? AND personBId = ?) OR (personAId = ? AND personBId = ?))`,
      ];
      const params: SqlValue[] = [
        args.personAId,
        args.personBId,
        args.personBId,
        args.personAId,
      ];
      if (args.profileHashA && args.profileHashB) {
        clauses.push(
          `((profileHashA = ? AND profileHashB = ?) OR (profileHashA = ? AND profileHashB = ?))`,
        );
        params.push(
          args.profileHashA,
          args.profileHashB,
          args.profileHashB,
          args.profileHashA,
        );
      }
      if (args.algorithmVersion) {
        clauses.push(`algorithmVersion = ?`);
        params.push(args.algorithmVersion);
      }
      const row = this.get(
        `SELECT * FROM MatchAssessment WHERE ${clauses.join(
          " AND ",
        )} ORDER BY createdAt DESC LIMIT 1`,
        params,
      );
      return row ? mapAssessment(row) : null;
    },
    findManyForPair: async (args: {
      personAId: string;
      personBId: string;
    }): Promise<StoredMatchAssessment[]> => {
      await this.ensure();
      return this.all(
        `SELECT * FROM MatchAssessment
         WHERE (personAId = ? AND personBId = ?) OR (personAId = ? AND personBId = ?)
         ORDER BY createdAt DESC`,
        [args.personAId, args.personBId, args.personBId, args.personAId],
      ).map(mapAssessment);
    },
  };

  match = {
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
    }): Promise<MatchRecord> => {
      await this.ensure();
      const id = cuid();
      const ts = nowIso();
      this.run(
        `INSERT INTO Match
          (id, personAId, personBId, source, createdByMatchmakerId, assessmentId,
           status, notes, overrideNote, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.data.personAId,
          args.data.personBId,
          args.data.source,
          args.data.createdByMatchmakerId,
          args.data.assessmentId || null,
          args.data.status || "draft",
          args.data.notes || null,
          args.data.overrideNote || null,
          ts,
          ts,
        ],
      );
      return mapMatch(this.get(`SELECT * FROM Match WHERE id = ?`, [id])!);
    },
    update: async (args: {
      where: { id: string };
      data: Partial<Pick<MatchRecord, "status" | "notes" | "overrideNote" | "assessmentId">>;
    }): Promise<MatchRecord> => {
      await this.ensure();
      const sets: string[] = [];
      const params: SqlValue[] = [];
      for (const [key, value] of Object.entries(args.data)) {
        if (value === undefined) continue;
        sets.push(`${key} = ?`);
        params.push(value);
      }
      sets.push(`updatedAt = ?`);
      params.push(nowIso(), args.where.id);
      this.run(`UPDATE Match SET ${sets.join(", ")} WHERE id = ?`, params);
      const row = this.get(`SELECT * FROM Match WHERE id = ?`, [args.where.id]);
      if (!row) throw new Error("Match not found");
      return mapMatch(row);
    },
    findUnique: async (args: {
      where: { id: string };
      include?: { details?: boolean };
    }): Promise<MatchRecord | MatchWithDetails | null> => {
      await this.ensure();
      const row = this.get(`SELECT * FROM Match WHERE id = ?`, [args.where.id]);
      if (!row) return null;
      const match = mapMatch(row);
      if (!args.include?.details) return match;
      return this.hydrateMatch(match);
    },
    findMany: async (args?: {
      where?: {
        status?: string;
        matchmakerId?: string;
        personId?: string;
      };
      include?: { details?: boolean };
    }): Promise<(MatchRecord | MatchWithDetails)[]> => {
      await this.ensure();
      const clauses: string[] = [];
      const params: SqlValue[] = [];
      if (args?.where?.status) {
        clauses.push(`status = ?`);
        params.push(args.where.status);
      }
      if (args?.where?.matchmakerId) {
        clauses.push(`createdByMatchmakerId = ?`);
        params.push(args.where.matchmakerId);
      }
      if (args?.where?.personId) {
        clauses.push(`(personAId = ? OR personBId = ?)`);
        params.push(args.where.personId, args.where.personId);
      }
      const rows = this.all(
        `SELECT * FROM Match ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
         ORDER BY updatedAt DESC`,
        params,
      ).map(mapMatch);
      if (!args?.include?.details) return rows;
      return Promise.all(rows.map((match) => this.hydrateMatch(match)));
    },
  };

  matchReview = {
    create: async (args: {
      data: {
        assessmentId: string;
        matchmakerId: string;
        decision: MatchReview["decision"];
        reasonCodes?: string[];
        notes?: string | null;
      };
    }): Promise<MatchReview> => {
      await this.ensure();
      const id = cuid();
      this.run(
        `INSERT INTO MatchReview
          (id, assessmentId, matchmakerId, decision, reasonCodes, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.data.assessmentId,
          args.data.matchmakerId,
          args.data.decision,
          JSON.stringify(args.data.reasonCodes || []),
          args.data.notes || null,
          nowIso(),
        ],
      );
      return mapReview(this.get(`SELECT * FROM MatchReview WHERE id = ?`, [id])!);
    },
  };

  matchOutcome = {
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
    }): Promise<MatchOutcome> => {
      await this.ensure();
      const id = cuid();
      this.run(
        `INSERT INTO MatchOutcome
          (id, matchId, stage, personAResponse, personBResponse, reasonCode, notes,
           occurredAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          args.data.matchId,
          args.data.stage,
          args.data.personAResponse || null,
          args.data.personBResponse || null,
          args.data.reasonCode || null,
          args.data.notes || null,
          (args.data.occurredAt || new Date()).toISOString(),
          nowIso(),
        ],
      );
      return mapOutcome(this.get(`SELECT * FROM MatchOutcome WHERE id = ?`, [id])!);
    },
  };

  matchExposure = {
    create: async (args: {
      data: { assessmentId: string; personId: string; location: string };
    }): Promise<void> => {
      await this.ensure();
      this.run(
        `INSERT INTO MatchExposure (id, assessmentId, personId, location, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [cuid(), args.data.assessmentId, args.data.personId, args.data.location, nowIso()],
      );
    },
  };

  matchingAnalytics = {
    recordShadowEvaluation: async (args: {
      personId: string;
      algorithmVersion: string;
      newRanking: string[];
      legacyRanking: string[];
      pairwiseAgreement: number;
      falseExclusions: number;
    }): Promise<void> => {
      await this.ensure();
      this.run(
        `INSERT INTO ShadowEvaluation
          (id, personId, algorithmVersion, newRankingJson, legacyRankingJson,
           pairwiseAgreement, falseExclusions, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cuid(),
          args.personId,
          args.algorithmVersion,
          JSON.stringify(args.newRanking),
          JSON.stringify(args.legacyRanking),
          args.pairwiseAgreement,
          args.falseExclusions,
          nowIso(),
        ],
      );
    },
    summary: async (): Promise<{
      assessments: number;
      exposures: number;
      reviews: number;
      bilateralOutcomes: number;
      secondDates: number;
      shadowRuns: number;
      pairwiseAgreement: number | null;
      falseExclusions: number;
      concentration: { personId: string; exposures: number }[];
    }> => {
      await this.ensure();
      const count = (table: string) =>
        Number(this.get(`SELECT COUNT(*) AS total FROM ${table}`)?.total || 0);
      const bilateralOutcomes = Number(
        this.get(
          `SELECT COUNT(*) AS total FROM MatchOutcome
           WHERE personAResponse IS NOT NULL AND personBResponse IS NOT NULL`,
        )?.total || 0,
      );
      const secondDates = Number(
        this.get(`SELECT COUNT(*) AS total FROM MatchOutcome WHERE stage = 'second_date'`)
          ?.total || 0,
      );
      const concentration = this.all(
        `SELECT personId, COUNT(*) AS exposures FROM MatchExposure
         GROUP BY personId ORDER BY exposures DESC LIMIT 10`,
      ).map((row) => ({
        personId: String(row.personId),
        exposures: Number(row.exposures),
      }));
      const shadow = this.get(
        `SELECT COUNT(*) AS runs, AVG(pairwiseAgreement) AS agreement,
                SUM(falseExclusions) AS falseExclusions
         FROM ShadowEvaluation`,
      );
      return {
        assessments: count("MatchAssessment"),
        exposures: count("MatchExposure"),
        reviews: count("MatchReview"),
        bilateralOutcomes,
        secondDates,
        shadowRuns: Number(shadow?.runs || 0),
        pairwiseAgreement:
          shadow?.agreement == null ? null : Number(Number(shadow.agreement).toFixed(3)),
        falseExclusions: Number(shadow?.falseExclusions || 0),
        concentration,
      };
    },
  };

  private async hydrateMatch(match: MatchRecord): Promise<MatchWithDetails> {
    const personA = (await this.person.findUnique({
      where: { id: match.personAId },
      include: { profile: true },
    })) as PersonWithProfile | null;
    const personB = (await this.person.findUnique({
      where: { id: match.personBId },
      include: { profile: true },
    })) as PersonWithProfile | null;
    const matchmaker = await this.matchmaker.findUnique({
      where: { id: match.createdByMatchmakerId },
    });
    if (!personA || !personB || !matchmaker) {
      throw new Error(`Match ${match.id} has missing related records`);
    }
    const assessment = match.assessmentId
      ? await this.matchAssessment.findUnique({ where: { id: match.assessmentId } })
      : null;
    const outcomes = this.all(
      `SELECT * FROM MatchOutcome WHERE matchId = ? ORDER BY occurredAt ASC`,
      [match.id],
    ).map(mapOutcome);
    return { ...match, personA, personB, matchmaker, assessment, outcomes };
  }
}

const DB_RUNTIME_VERSION = "matching-v2";
const globalForDb = globalThis as unknown as {
  __toimoDb?: Db;
  __toimoDbVersion?: string;
};

export const prisma =
  globalForDb.__toimoDb && globalForDb.__toimoDbVersion === DB_RUNTIME_VERSION
    ? globalForDb.__toimoDb
    : new Db();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__toimoDb = prisma;
  globalForDb.__toimoDbVersion = DB_RUNTIME_VERSION;
}
