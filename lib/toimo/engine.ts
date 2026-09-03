import { prisma } from "@/lib/db";
import type {
  Person,
  PersonUpdateInput,
  ProfileUpdateInput,
} from "@/lib/types";
import {
  CLOSING_MESSAGE,
  EASY_PART,
  HALFWAY_MESSAGE,
  OPENING_MESSAGE,
  QUESTIONS,
  SELFIE_PROMPT,
} from "@/lib/toimo/copy";
import {
  inferLookingFor,
  normalize,
  parseDateOfBirth,
  type BranchFlags,
} from "@/lib/toimo/branches";
import { saveInboundPhoto } from "@/lib/sms/media";
import { toE164 } from "@/lib/whatsapp/phone";

function isValidEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

export type InboundMedia = {
  url: string;
  contentType: string;
};

export type InboundMeta = {
  viaVoice?: boolean;
  onTiming?: (timing: InboundTiming) => void;
};

export type InboundTiming = {
  personLookupMs: number;
  inboundSaveMs: number;
  answerAndStateMs: number;
};

export type EngineResult = {
  outbound: string[];
  person: Person;
};

type FlowStep =
  | "full_name"
  | "date_of_birth"
  | "gender"
  | "email"
  | "partner_age_range"
  | "photo"
  | "everyday_life"
  | "religiosity"
  | "partner_religiosity"
  | "family_background"
  | "self_description"
  | "partner_qualities"
  | "non_negotiables"
  | "physical_type";

async function ensureProfile(personId: string) {
  return prisma.profileAnswers.upsert({
    where: { personId },
    create: { personId },
    update: {},
  });
}

async function savePerson(
  personId: string,
  data: PersonUpdateInput,
  flags?: BranchFlags,
) {
  return prisma.person.update({
    where: { id: personId },
    data: {
      ...data,
      ...(flags ? { branchFlags: JSON.stringify(flags) } : {}),
    },
  }) as Promise<Person>;
}

async function saveProfile(personId: string, data: ProfileUpdateInput) {
  return prisma.profileAnswers.upsert({
    where: { personId },
    create: { personId, ...data },
    update: data,
  });
}

async function advance(
  person: Person,
  nextStep: string,
  outbound: string[],
  personData: PersonUpdateInput = {},
) {
  const updated = await savePerson(person.id, {
    ...personData,
    currentStep: nextStep,
    status: nextStep === "complete" ? "complete" : "in_progress",
    ...(nextStep === "complete" ? { completedAt: new Date() } : {}),
  });
  return { outbound, person: updated };
}

function unclear(promptHint: string): string {
  return `No rush. Take your time 😊 ${promptHint}`;
}

function question(step: keyof typeof QUESTIONS): string {
  return QUESTIONS[step];
}

async function resetPerson(personId: string) {
  await prisma.profileAnswers.deleteMany({ where: { personId } });
  await ensureProfile(personId);
  return savePerson(
    personId,
    {
      firstName: null,
      dateOfBirth: null,
      email: null,
      photoUrl: null,
      age: null,
      gender: null,
      lookingFor: null,
      status: "in_progress",
      currentStep: "full_name",
      completedAt: null,
      pausedAt: null,
    },
    {},
  );
}

export async function getOrCreatePerson(phone: string): Promise<Person> {
  const normalized = toE164(phone);
  const existing = await prisma.person.findUnique({
    where: { phone: normalized },
  });
  if (existing) return existing;

  const created = await prisma.person.create({
    data: {
      phone: normalized,
      status: "new",
      currentStep: "opening",
    },
  });
  await ensureProfile(created.id);
  return created;
}

export function openingBodies(): string[] {
  return [OPENING_MESSAGE, EASY_PART, question("full_name")];
}

export async function handleInbound(
  phone: string,
  body: string,
  twilioSid?: string,
  mediaUrls: string[] = [],
  meta: InboundMeta = {},
): Promise<EngineResult> {
  const text = body.trim();
  const personLookupStarted = performance.now();
  let person = await getOrCreatePerson(phone);
  const personLookupMs = performance.now() - personLookupStarted;

  const inboundBody = text || (mediaUrls.length ? "[photo]" : "");
  const loggedBody = meta.viaVoice && text ? `[voice] ${text}` : inboundBody || "[empty]";

  const inboundSaveStarted = performance.now();
  await prisma.message.create({
    data: {
      personId: person.id,
      direction: "inbound",
      body: loggedBody,
      twilioSid,
    },
  });
  const inboundSaveMs = performance.now() - inboundSaveStarted;

  const command = normalize(text);
  const answerAndStateStarted = performance.now();

  try {
    if (["stop", "unsubscribe", "cancel", "end", "quit"].includes(command)) {
      person = await savePerson(person.id, {
        status: "opted_out",
        currentStep: "opted_out",
      });
      return {
        outbound: [
          "You've been opted out. Take care ❤️ Reply START if you ever want to begin again.",
        ],
        person,
      };
    }

    if (["pause"].includes(command)) {
      person = await savePerson(person.id, {
        status: "paused",
        pausedAt: new Date(),
      });
      return {
        outbound: ["Paused. Reply CONTINUE whenever you're ready to pick back up."],
        person,
      };
    }

    if (["continue", "resume"].includes(command)) {
      if (person.status === "opted_out") {
        return {
          outbound: ["You're currently opted out. Reply START to begin a new conversation."],
          person,
        };
      }
      person = await savePerson(person.id, { status: "in_progress", pausedAt: null });
      return {
        outbound: ["Welcome back 😊", ...promptForStep(person.currentStep)],
        person,
      };
    }

    if (["restart", "start over", "reset"].includes(command)) {
      person = await resetPerson(person.id);
      return { outbound: ["Fresh start ❤️", ...openingBodies()], person };
    }

    if (
      ["start", "begin"].includes(command) &&
      (person.status === "opted_out" || person.status === "new" || person.currentStep === "complete")
    ) {
      if (person.currentStep === "complete" || person.status === "opted_out") {
        person = await resetPerson(person.id);
      } else {
        person = await savePerson(person.id, {
          status: "in_progress",
          currentStep: "full_name",
        });
      }
      return { outbound: openingBodies(), person };
    }

    if (person.status === "opted_out") {
      return { outbound: ["You're opted out. Reply START if you'd like to begin again."], person };
    }

    if (person.status === "paused") {
      return { outbound: ["We're paused. Reply CONTINUE to resume, or STOP to opt out."], person };
    }

    if (person.currentStep === "complete") {
      return {
        outbound: [
          "You're all set. A matchmaker will review your profile. Reply RESTART if you want to update your answers.",
        ],
        person,
      };
    }

    const outboundCount = await prisma.message.count({
      where: { personId: person.id, direction: "outbound" },
    });
    if (outboundCount === 0 && (person.currentStep === "opening" || person.currentStep === "full_name")) {
      person = await savePerson(person.id, { status: "in_progress", currentStep: "full_name" });
      return { outbound: openingBodies(), person };
    }

    if (person.currentStep === "opening") {
      return advance(person, "full_name", [EASY_PART, question("full_name")]);
    }

    return await processStep(person, text, mediaUrls);
  } finally {
    meta.onTiming?.({
      personLookupMs,
      inboundSaveMs,
      answerAndStateMs: performance.now() - answerAndStateStarted,
    });
  }
}

function promptForStep(step: string): string[] {
  if (step === "opening") return openingBodies();
  if (step === "photo") return [SELFIE_PROMPT];
  if (step in QUESTIONS) return [question(step as keyof typeof QUESTIONS)];
  return ["Thanks for sharing. Whenever you're ready, keep going."];
}

async function processStep(
  person: Person,
  text: string,
  mediaUrls: string[] = [],
): Promise<EngineResult> {
  const step = person.currentStep as FlowStep | string;

  switch (step) {
    case "full_name": {
      const name = text.trim();
      if (name.length < 1) {
        return { outbound: [unclear(question("full_name"))], person };
      }
      return advance(person, "date_of_birth", [question("date_of_birth")], {
        firstName: name,
      });
    }
    case "date_of_birth": {
      const parsed = parseDateOfBirth(text);
      if (!parsed) {
        return {
          outbound: ["Could you send your date of birth? For example: March 12, 1996"],
          person,
        };
      }
      return advance(person, "gender", [question("gender")], {
        dateOfBirth: parsed.iso,
        age: parsed.age,
      });
    }
    case "gender": {
      const gender = text.trim();
      if (gender.length < 1) {
        return { outbound: [unclear(question("gender"))], person };
      }
      return advance(person, "email", [question("email")], {
        gender,
        lookingFor: inferLookingFor(gender),
      });
    }
    case "email": {
      if (!isValidEmail(text)) {
        return {
          outbound: ["Could you send a valid email address? (example: name@email.com)"],
          person,
        };
      }
      return advance(person, "partner_age_range", [question("partner_age_range")], {
        email: text.trim().toLowerCase(),
      });
    }
    case "partner_age_range": {
      const ages = text.match(/\b([1-9][0-9]?)\b/g)?.map(Number) || [];
      if (ages.filter((age) => age >= 18 && age <= 99).length < 2) {
        return {
          outbound: ["Please give a minimum and maximum age, for example: 27-36."],
          person,
        };
      }
      await saveProfile(person.id, { partnerAgeRange: text.trim() });
      return advance(person, "photo", [SELFIE_PROMPT]);
    }
    case "photo": {
      const attached = mediaUrls.find((url) => Boolean(url));
      const typed =
        normalize(text) === "photo" ||
        text.startsWith("/uploads/") ||
        text.startsWith("/api/uploads/") ||
        text.startsWith("/api/file")
          ? text || "PHOTO"
          : "";
      const media = attached || typed;
      if (!media) {
        return {
          outbound: [
            "I still need a selfie of you 📷\nPlease attach a picture and send it.",
          ],
          person,
        };
      }
      const photoUrl = await saveInboundPhoto(person.id, attached || media);
      return advance(person, "everyday_life", [question("everyday_life")], { photoUrl });
    }
    case "everyday_life": {
      await saveProfile(person.id, {
        everydayLife: text.trim(),
        location: text.trim(),
        relocationFlexibility: text.trim(),
      });
      return advance(person, "religiosity", [question("religiosity")]);
    }
    case "religiosity": {
      await saveProfile(person.id, { religiosity: text.trim() });
      return advance(person, "partner_religiosity", [question("partner_religiosity")]);
    }
    case "partner_religiosity": {
      await saveProfile(person.id, { partnerReligiosity: text.trim() });
      return advance(person, "family_background", [
        HALFWAY_MESSAGE,
        question("family_background"),
      ]);
    }
    case "family_background": {
      await saveProfile(person.id, { familyBackground: text.trim() });
      return advance(person, "self_description", [question("self_description")]);
    }
    case "self_description": {
      await saveProfile(person.id, { selfDescription: text.trim() });
      return advance(person, "partner_qualities", [question("partner_qualities")]);
    }
    case "partner_qualities": {
      await saveProfile(person.id, { partnerQualities: text.trim() });
      return advance(person, "non_negotiables", [question("non_negotiables")]);
    }
    case "non_negotiables": {
      await saveProfile(person.id, { nonNegotiables: text.trim() });
      return advance(person, "physical_type", [question("physical_type")]);
    }
    case "physical_type": {
      await saveProfile(person.id, { physicalAttracted: text.trim() });
      return advance(person, "complete", [CLOSING_MESSAGE]);
    }
    // Legacy steps removed from the flow — route to the next valid question or finish.
    case "dating_lesson":
    case "attraction":
      return advance(person, "physical_type", [question("physical_type")]);
    case "five_year":
    case "readiness":
      return advance(person, "complete", [CLOSING_MESSAGE]);
    default: {
      return advance(person, "full_name", [
        `Let's pick back up gently. ${question("full_name")}`,
      ]);
    }
  }
}
