export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAffirmative(text: string): boolean {
  const t = normalize(text);
  return [
    "yes",
    "y",
    "yeah",
    "yep",
    "yup",
    "ready",
    "sure",
    "ok",
    "okay",
    "lets go",
    "let's go",
    "absolutely",
    "of course",
    "i'm ready",
    "im ready",
  ].some((x) => t === x || t.startsWith(x + " ") || t.endsWith(" " + x));
}

export function parseAge(text: string): number | null {
  const match = text.match(/\b([1-9][0-9]?)\b/);
  if (!match) return null;
  const age = Number(match[1]);
  if (age < 18 || age > 99) return null;
  return age;
}

const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sept: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function ageFromUtc(year: number, monthIndex: number, day: number): number {
  const today = new Date();
  let age = today.getUTCFullYear() - year;
  const month = today.getUTCMonth() - monthIndex;
  if (month < 0 || (month === 0 && today.getUTCDate() < day)) age -= 1;
  return age;
}

function validDob(year: number, monthIndex: number, day: number): { iso: string; age: number } | null {
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const utc = Date.UTC(year, monthIndex, day);
  const d = new Date(utc);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== monthIndex || d.getUTCDate() !== day) {
    return null;
  }
  const age = ageFromUtc(year, monthIndex, day);
  if (age < 18 || age > 99) return null;
  return {
    iso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    age,
  };
}

export function parseDateOfBirth(text: string): { iso: string; age: number } | null {
  const raw = text.trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return validDob(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  const namedFirst = raw.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (namedFirst) {
    const monthIndex = MONTHS[namedFirst[1].toLowerCase()];
    if (monthIndex != null) return validDob(Number(namedFirst[3]), monthIndex, Number(namedFirst[2]));
  }

  const namedSecond = raw.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
  if (namedSecond) {
    const monthIndex = MONTHS[namedSecond[2].toLowerCase()];
    if (monthIndex != null) return validDob(Number(namedSecond[3]), monthIndex, Number(namedSecond[1]));
  }

  const numeric = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (numeric) {
    let year = Number(numeric[3]);
    if (year < 100) year += year >= 30 ? 1900 : 2000;
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    if (first > 12) return validDob(year, second - 1, first);
    if (second > 12) return validDob(year, first - 1, second);
    return validDob(year, first - 1, second);
  }

  return null;
}

export function inferLookingFor(gender: string): string | null {
  const text = normalize(gender);
  if (
    text === "f" ||
    text === "w" ||
    text.includes("woman") ||
    text.includes("female") ||
    text.includes("girl")
  ) {
    return "Men";
  }
  if (text === "m" || text.includes("male") || text === "man" || text.includes("guy")) {
    return "Women";
  }
  if (text.includes("man") && !text.includes("woman")) return "Women";
  return null;
}

export function locationsSeemDifferent(live: string, grewUp: string): boolean {
  const a = normalize(live);
  const b = normalize(grewUp);
  if (!a || !b) return false;
  if (a === b) return false;
  if (a.includes(b) || b.includes(a)) return false;
  // crude city/country token overlap check
  const tokensA = new Set(a.split(/[,\s/]+/).filter((t) => t.length > 2));
  const tokensB = b.split(/[,\s/]+/).filter((t) => t.length > 2);
  const overlap = tokensB.some((t) => tokensA.has(t));
  return !overlap;
}

export function prefersSpecificBackground(text: string): boolean {
  const t = normalize(text);
  if (
    t.includes("either") ||
    t.includes("doesn't matter") ||
    t.includes("doesnt matter") ||
    t.includes("no preference") ||
    t.includes("open to both") ||
    t === "both"
  ) {
    return false;
  }
  return (
    t.includes("sephardi") ||
    t.includes("ashkenazi") ||
    t.includes("prefer") ||
    t.includes("usually")
  );
}

export function isTrueRequirement(text: string): boolean {
  const t = normalize(text);
  return (
    t.includes("truly important") ||
    t.includes("true requirement") ||
    t.includes("must") ||
    t.includes("non-negotiable") ||
    t.includes("dealbreaker") ||
    t.includes("won't") ||
    t.includes("will not") ||
    (t.includes("important") && !t.includes("used to") && !t.includes("comfortable"))
  );
}

export function synagogueYes(text: string): boolean {
  const t = normalize(text);
  if (["no", "n", "not really", "nope", "nah"].includes(t)) return false;
  if (t.startsWith("no ") || t.startsWith("not ")) return false;
  return (
    isAffirmative(text) ||
    t.includes("yes") ||
    t.includes("sometimes") ||
    t.includes("regularly") ||
    t.includes("belong")
  );
}

export function partnerSuccessVeryImportant(text: string): boolean {
  const t = normalize(text);
  return (
    t.startsWith("very") ||
    t === "1" ||
    t.includes("extremely") ||
    t.includes("very important")
  );
}

export function mentionsSafe(text: string): boolean {
  return /\bsafe\b|\bsafety\b|\bsecure\b/i.test(text);
}

export function mentionsChemistry(text: string): boolean {
  return /\bchemistr/i.test(text) || /\bspark\b/i.test(text);
}

export function repeatsTypeYesMaybe(text: string): boolean {
  const t = normalize(text);
  return (
    t.startsWith("yes") ||
    t.includes("maybe") ||
    t.includes("😂") ||
    t === "y"
  );
}

export function indicatesUnavailablePattern(text: string): boolean {
  const t = normalize(text);
  return (
    t.includes("unavailable") ||
    t.includes("hot and cold") ||
    t.includes("mixed signals") ||
    t.includes("doesn't text") ||
    t.includes("doesnt text") ||
    t.includes("lose interest") ||
    t.includes("chase") ||
    t.includes("hard to get") ||
    t.includes("ghost") ||
    t.includes("commitment issues") ||
    t.includes("emotionally distant")
  );
}

export function losesInterestWhenAvailable(text: string): boolean {
  const t = normalize(text);
  return (
    t.includes("lose interest") ||
    t.includes("bored") ||
    t.includes("less attracted") ||
    t.includes("turn off") ||
    t.includes("uncomfortable") ||
    t.includes("too much") ||
    t.includes("smother") ||
    t.includes("run")
  );
}

export function needsImmediateSpark(flags: Record<string, unknown>, text: string): boolean {
  if (flags.needsSpark) return true;
  const t = normalize(text);
  return (
    t.includes("immediate spark") ||
    t.includes("instant spark") ||
    t.includes("fireworks") ||
    t.includes("instant chemistry") ||
    (t.includes("spark") && (t.includes("need") || t.includes("must") || t.includes("have to")))
  );
}

export function looksLikeResumeNeeds(text: string): boolean {
  const t = normalize(text);
  const resumeWords = [
    "tall",
    "handsome",
    "beautiful",
    "rich",
    "successful",
    "doctor",
    "lawyer",
    "money",
    "job",
    "career",
    "looks",
    "attractive",
    "fit",
    "degree",
  ];
  const feelingWords = [
    "safe",
    "loved",
    "respected",
    "understood",
    "desired",
    "supported",
    "secure",
    "free",
    "heard",
    "valued",
    "trusted",
  ];
  const resumeHits = resumeWords.filter((w) => t.includes(w)).length;
  const feelingHits = feelingWords.filter((w) => t.includes(w)).length;
  return resumeHits >= 2 && feelingHits === 0;
}

export function wantsChildren(text: string): boolean {
  const t = normalize(text);
  if (
    t.startsWith("no") ||
    t.includes("not sure") ||
    t.includes("maybe") ||
    t.includes("don't want") ||
    t.includes("dont want") ||
    t.includes("no kids")
  ) {
    return false;
  }
  return t.includes("yes") || t.includes("want") || t.includes("definitely") || t.includes("hope");
}

export function isBroadQuality(text: string): boolean {
  const t = normalize(text);
  const broad = ["kind", "nice", "good", "funny", "smart", "sweet", "loving", "caring"];
  return broad.some((w) => t.split(/[,/]| and /).some((part) => part.trim() === w || part.trim().includes(w)));
}

export function loveLanguagesDiffer(receive: string, give: string): boolean {
  const a = normalize(receive);
  const b = normalize(give);
  if (!a || !b) return false;
  if (a.includes("combination") || b.includes("combination")) return false;
  return a !== b && !a.includes(b) && !b.includes(a);
}

export type BranchFlags = {
  prefersBackground?: boolean;
  backgroundIsRequirement?: boolean;
  synagogueYes?: boolean;
  successVeryImportant?: boolean;
  connectionSafe?: boolean;
  connectionChemistry?: boolean;
  repeatsType?: boolean;
  unavailablePattern?: boolean;
  losesInterestAvailable?: boolean;
  needsSpark?: boolean;
  needsRedirected?: boolean;
  broadQuality?: boolean;
  wantsChildren?: boolean;
  loveLangDiffer?: boolean;
  [key: string]: unknown;
};

export function parseBranchFlags(raw: string | null | undefined): BranchFlags {
  try {
    return JSON.parse(raw || "{}") as BranchFlags;
  } catch {
    return {};
  }
}
