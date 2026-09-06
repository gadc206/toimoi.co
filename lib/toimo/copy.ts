/**
 * VANESSA: edit the pre-written WhatsApp questions in this file.
 */

export const OPENING_MESSAGE = `Hi!!
Welcome to TOIMOI ❤️
We are going to ask you 13 questions, plus a selfie at the end.
Take your time and most importantly, be honest. There is absolutely no judgement here. We want to understand who YOU are and who could really be right for you.`;

export const EASY_PART = `First, the easy part 😊`;

export const SELFIE_PROMPT = `Send a selfie or a photo of yourself.`;

export const RESUME_PROMPT = `If you'd like, you can send your resume — it's optional.
Reply SKIP if you'd rather not.`;

export const ENCOURAGEMENT_GREAT = `You're doing great`;

export const ENCOURAGEMENT_HALFWAY = `Halfway there!`;

export const ENCOURAGEMENT_LAST = `Last one`;

export const QUESTIONS = {
  full_name: "What's your full name?",
  date_of_birth: "What's your date of birth? (for example: March 12, 1996)",
  gender: "What's your gender?",
  email: "What's the best email for you?",
  partner_age_range: "What age range are you open to in a partner? (for example: 27-36)",
  everyday_life:
    "Where do you live, what do you do in your everyday life, and would you relocate for the right person?",
  religiosity: "How would you describe yourself religiously today?",
  partner_religiosity:
    "What are you looking for religiously in the person you marry?",
  family_background:
    "Are you Ashkenazi, Sephardi, or both?",
  self_description:
    "If you had to describe yourself to someone who has never met you, what would you want them to understand about you?",
  partner_qualities:
    "What are the 3 most important things you are looking for in the person you marry?",
  non_negotiables:
    "When it comes to your future partner, what's one thing you know you can't compromise on?",
  physical_type:
    "What is your physical type?\nNo need for a checklist — just tell us what comes naturally to mind.",
} as const;

export const QUESTION_ORDER = [
  "full_name",
  "date_of_birth",
  "gender",
  "email",
  "partner_age_range",
  "everyday_life",
  "religiosity",
  "partner_religiosity",
  "family_background",
  "self_description",
  "partner_qualities",
  "non_negotiables",
  "physical_type",
] as const;

export function questionWithProgress(
  step: keyof typeof QUESTIONS,
  encouragement?: string,
): string {
  const index = QUESTION_ORDER.indexOf(step);
  const progress =
    index >= 0 ? `Question ${index + 1}/${QUESTION_ORDER.length}` : "";
  return [encouragement, progress, QUESTIONS[step]].filter(Boolean).join("\n");
}

export function closingMessage(shareUrl: string): string {
  return `Thank you for sharing so openly ❤️
You're in the TOIMOI network. A matchmaker will review your profile and you will be matched!

If you refer this to 5 people, you go up on our list.
Share this link with friends:
${shareUrl}`;
}
