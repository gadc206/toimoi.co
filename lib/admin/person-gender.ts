export type PersonGenderFilter = "men" | "women";

/** Map free-text intake gender answers into admin filter buckets. */
export function personGenderCategory(
  gender: string | null | undefined,
): PersonGenderFilter | "unknown" {
  if (!gender?.trim()) return "unknown";

  const text = gender.trim().toLowerCase();

  if (
    text === "f" ||
    text === "w" ||
    text.includes("woman") ||
    text.includes("female") ||
    text.includes("girl")
  ) {
    return "women";
  }

  if (
    text === "m" ||
    text === "man" ||
    text.includes("guy") ||
    (text.includes("male") && !text.includes("female"))
  ) {
    return "men";
  }

  return "unknown";
}
