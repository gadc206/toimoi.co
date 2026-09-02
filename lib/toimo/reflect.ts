import OpenAI from "openai";
import type { Person, ProfileAnswers } from "@/lib/types";

function client(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function threeWordsFollowup(threeWords: string): Promise<string> {
  const fallback = `Interesting combination — "${threeWords}".
People probably see some of those sides pretty quickly.
What's the side of you that someone only discovers once you really trust them?`;

  const openai = client();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You are a warm Jewish matchmaking coach (TOIMOI). Write 2-4 short SMS lines. Pick something interesting from their three words. Note what people see quickly, then ask what side someone only discovers once they really trust them. No diagnosis. No questions besides that one.",
        },
        { role: "user", content: `Their three words: ${threeWords}` },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function reflectAnswer(topic: string, answer: string): Promise<string> {
  const fallback = `Thank you for sharing that — I hear you: "${answer.slice(0, 160)}${answer.length > 160 ? "…" : ""}"`;
  const openai = client();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            "You are a warm matchmaking coach. Reflect the user's answer in 1-2 short SMS sentences. Use only what they said. No diagnosis. No new question.",
        },
        { role: "user", content: `Topic: ${topic}\nAnswer: ${answer}` },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function mirrorPattern(
  person: Person,
  profile: ProfileAnswers | null,
  transcriptSnippet: string,
): Promise<string> {
  const fallback = `You shared a lot about what attracts you and what makes you feel happy in a relationship.
It may be worth thinking about whether the qualities that initially ATTRACT you are always the same qualities that make you feel LOVED.
They may be.
But they may not be.
Does that resonate with you?`;

  const openai = client();
  if (!openai) return fallback;

  const summary = {
    firstName: person.firstName,
    lookingFor: person.lookingFor,
    religiosity: profile?.religiosity,
    partnerReligiosity: profile?.partnerReligiosity,
    datingBackgroundPreference: profile?.datingBackgroundPreference,
    loveLanguageReceive: profile?.loveLanguageReceive,
    loveLanguageGive: profile?.loveLanguageGive,
    connectionDrivers: profile?.connectionDrivers,
    datingLesson: profile?.datingLesson,
    repeatsType: profile?.repeatsType,
    typeInCommon: profile?.typeInCommon,
    coreEmotionalNeeds: profile?.coreEmotionalNeeds,
    nonNegotiables: profile?.nonNegotiables,
    partnerQualities: profile?.partnerQualities,
    personalityAttracted: profile?.personalityAttracted,
    physicalAttracted: profile?.physicalAttracted,
    growthEdge: profile?.growthEdge,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `You are TOIMOI, a gentle Jewish matchmaking coach.
Identify ONE meaningful pattern from ONLY the provided answers.
Speak in short SMS-friendly paragraphs.
Do not invent facts. Do not diagnose.
End by asking if it resonates.
Keep under 900 characters.`,
        },
        {
          role: "user",
          content: `Structured answers:\n${JSON.stringify(summary, null, 2)}\n\nRecent transcript:\n${transcriptSnippet.slice(0, 3500)}`,
        },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function successMeaningReflection(meaning: string): Promise<string> {
  const fallback = `So listening to you, it sounds like what you're really pointing to is: ${meaning}.
That's different from simply saying, "I need someone successful."
Understanding WHY something matters to you helps us understand whether it's truly a need or simply the label we've given it.`;

  const openai = client();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 160,
      messages: [
        {
          role: "system",
          content:
            "Warm coaching SMS. Reflect what 'successful' means to them in 2-3 short sentences. Explain that understanding WHY helps separate need vs label. No new question.",
        },
        { role: "user", content: meaning },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
