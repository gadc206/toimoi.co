/**
 * VANESSA: edit the pre-written WhatsApp questions in this file.
 */

export const OPENING_MESSAGE = `Hi!!
Welcome to TOIMOI ❤️
We are going to ask you 13 questions, plus a quick selfie.
Take your time and most importantly, be honest. There is absolutely no judgement here. We want to understand who YOU are and who could really be right for you.`;

export const EASY_PART = `First, the easy part 😊`;

export const SELFIE_PROMPT = `Send a selfie or a photo of yourself.`;

export const HALFWAY_MESSAGE = `You're more than half way there, 5 questions left`;

export const CLOSING_MESSAGE = `Thank you for sharing so openly ❤️
You're in the TOIMOI matchmaking database. A matchmaker will review your profile and you will be matched!`;

export const QUESTIONS = {
  full_name: "1. What's your full name?",
  date_of_birth: "2. What's your date of birth? (for example: March 12, 1996)",
  gender: "3. What's your gender?",
  email: "4. What's the best email for you?",
  partner_age_range: "5. What age range are you open to in a partner? (for example: 27-36)",
  everyday_life:
    "6. Where do you live, what do you do in your everyday life, and would you relocate for the right person?",
  religiosity: "7. How would you describe yourself religiously today?",
  partner_religiosity:
    "8. What are you looking for religiously in the person you marry?",
  family_background:
    "9. Are you Ashkenazi, Sephardi, or both?",
  self_description:
    "10. If you had to describe yourself to someone who has never met you, what would you want them to understand about you?",
  partner_qualities:
    "11. What are the 3 most important things you are looking for in the person you marry?",
  non_negotiables:
    "12. What is something you know you absolutely cannot compromise on?",
  physical_type: "13. What is your physical type?",
} as const;
