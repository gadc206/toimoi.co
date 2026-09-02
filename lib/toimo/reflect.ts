import type { Person, ProfileAnswers } from "@/lib/types";

/**
 * Coaching copy used in the WhatsApp reply path.
 * These stay local so the next question can go out immediately.
 */
export async function threeWordsFollowup(threeWords: string): Promise<string> {
  return `Interesting combination — "${threeWords}".
People probably see some of those sides pretty quickly.
What's the side of you that someone only discovers once you really trust them?`;
}

export async function reflectAnswer(topic: string, answer: string): Promise<string> {
  return `Thank you for sharing that — I hear you: "${answer.slice(0, 160)}${answer.length > 160 ? "…" : ""}"`;
}

export async function mirrorPattern(
  _person: Person,
  _profile: ProfileAnswers | null,
  _transcriptSnippet: string,
): Promise<string> {
  return `You shared a lot about what attracts you and what makes you feel happy in a relationship.
It may be worth thinking about whether the qualities that initially ATTRACT you are always the same qualities that make you feel LOVED.
They may be.
But they may not be.
Does that resonate with you?`;
}

export async function successMeaningReflection(meaning: string): Promise<string> {
  return `So listening to you, it sounds like what you're really pointing to is: ${meaning}.
That's different from simply saying, "I need someone successful."
Understanding WHY something matters to you helps us understand whether it's truly a need or simply the label we've given it.`;
}
