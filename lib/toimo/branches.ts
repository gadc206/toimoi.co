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
    t.includes("sephardic") ||
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
