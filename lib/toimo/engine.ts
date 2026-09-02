import { prisma } from "@/lib/db";
import type {
  Person,
  PersonUpdateInput,
  PersonWithProfile,
  ProfileUpdateInput,
} from "@/lib/types";
import {
  AVAILABILITY_COACHING,
  BACKGROUND_COACHING,
  FAMILY_REFLECTION,
  FINAL_MESSAGE_PARTS,
  FIVE_YEAR_REFLECTION,
  LOVE_LANGUAGE_COACHING,
  MIRROR_INTRO_HELP,
  OPENING_MESSAGE,
  PHYSICAL_COACHING,
  RELIGION_COACHING,
  SPARK_COACHING,
} from "@/lib/toimo/copy";
import {
  indicatesUnavailablePattern,
  isAffirmative,
  isBroadQuality,
  isTrueRequirement,
  locationsSeemDifferent,
  looksLikeResumeNeeds,
  losesInterestWhenAvailable,
  loveLanguagesDiffer,
  mentionsChemistry,
  mentionsSafe,
  needsImmediateSpark,
  normalize,
  parseAge,
  parseBranchFlags,
  partnerSuccessVeryImportant,
  prefersSpecificBackground,
  repeatsTypeYesMaybe,
  synagogueYes,
  wantsChildren,
  type BranchFlags,
} from "@/lib/toimo/branches";
import {
  mirrorPattern,
  reflectAnswer,
  successMeaningReflection,
  threeWordsFollowup,
} from "@/lib/toimo/reflect";
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
};

export type EngineResult = {
  outbound: string[];
  person: Person;
};

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
    include: { profile: true },
  }) as Promise<PersonWithProfile>;
}

async function saveProfile(personId: string, data: ProfileUpdateInput) {
  return prisma.profileAnswers.upsert({
    where: { personId },
    create: { personId, ...data },
    update: data,
  });
}

async function advance(
  person: PersonWithProfile,
  nextStep: string,
  outbound: string[],
  flags?: BranchFlags,
  personData: PersonUpdateInput = {},
) {
  const updated = await savePerson(
    person.id,
    {
      ...personData,
      currentStep: nextStep,
      status: nextStep === "complete" ? "complete" : "in_progress",
      ...(nextStep === "complete" ? { completedAt: new Date() } : {}),
    },
    flags,
  );
  return { outbound, person: updated };
}

function unclear(promptHint: string): string {
  return `No rush — take your time 😊 ${promptHint}`;
}

export async function getOrCreatePerson(phone: string): Promise<PersonWithProfile> {
  const normalized = toE164(phone);
  const existing = (await prisma.person.findUnique({
    where: { phone: normalized },
    include: { profile: true },
  })) as PersonWithProfile | null;
  if (existing) return existing;

  const created = await prisma.person.create({
    data: {
      phone: normalized,
      status: "new",
      currentStep: "opening",
    },
    include: { profile: true },
  });
  await ensureProfile(created.id);
  return (await prisma.person.findUniqueOrThrow({
    where: { id: created.id },
    include: { profile: true },
  })) as PersonWithProfile;
}

export function openingBodies(): string[] {
  return [OPENING_MESSAGE];
}

export async function handleInbound(
  phone: string,
  body: string,
  twilioSid?: string,
  mediaUrls: string[] = [],
  meta: InboundMeta = {},
): Promise<EngineResult> {
  const text = body.trim();
  let person = await getOrCreatePerson(phone);

  const inboundBody =
    text ||
    (mediaUrls.length ? "[photo]" : "");
  const loggedBody = meta.viaVoice && text ? `[voice] ${text}` : inboundBody || "[empty]";

  await prisma.message.create({
    data: {
      personId: person.id,
      direction: "inbound",
      body: loggedBody,
      twilioSid,
    },
  });

  const command = normalize(text);

  if (["stop", "unsubscribe", "cancel", "end", "quit"].includes(command)) {
    person = await savePerson(person.id, {
      status: "opted_out",
      currentStep: "opted_out",
    });
    return {
      outbound: ["You've been opted out. Take care ❤️ Reply START if you ever want to begin again."],
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
      return { outbound: ["You're currently opted out. Reply START to begin a new conversation."], person };
    }
    person = await savePerson(person.id, { status: "in_progress", pausedAt: null });
    const prompt = await promptForStep(person.currentStep, person);
    return {
      outbound: ["Welcome back 😊", ...prompt],
      person,
    };
  }

  if (["restart", "start over", "reset"].includes(command)) {
    await prisma.profileAnswers.deleteMany({ where: { personId: person.id } });
    await ensureProfile(person.id);
      person = await savePerson(
        person.id,
        {
          firstName: null,
          email: null,
          photoUrl: null,
          age: null,
          gender: null,
          lookingFor: null,
          status: "in_progress",
          currentStep: "opening",
          completedAt: null,
          pausedAt: null,
        },
        {},
      );
    return { outbound: ["Fresh start ❤️", OPENING_MESSAGE], person };
  }

  if (["start", "begin"].includes(command) && (person.status === "opted_out" || person.status === "new" || person.currentStep === "complete")) {
    if (person.currentStep === "complete" || person.status === "opted_out") {
      await prisma.profileAnswers.deleteMany({ where: { personId: person.id } });
      await ensureProfile(person.id);
      person = await savePerson(
        person.id,
        {
          firstName: null,
          email: null,
          photoUrl: null,
          age: null,
          gender: null,
          lookingFor: null,
          status: "in_progress",
          currentStep: "opening",
          completedAt: null,
        },
        {},
      );
    }
    return { outbound: [OPENING_MESSAGE], person };
  }

  if (person.status === "opted_out") {
    return { outbound: ["You're opted out. Reply START if you'd like to begin again."], person };
  }

  if (person.status === "paused") {
    return { outbound: ["We're paused. Reply CONTINUE to resume, or STOP to opt out."], person };
  }

  if (person.currentStep === "complete") {
    return {
      outbound: ["You're all set — a matchmaker will review your profile. Reply RESTART if you want to update your answers."],
      person,
    };
  }

  // First inbound with no prior outbound: greet, or start immediately if they already said ready/yes
  if (person.currentStep === "opening") {
    const outboundCount = await prisma.message.count({
      where: { personId: person.id, direction: "outbound" },
    });
    if (outboundCount === 0) {
      person = await savePerson(person.id, { status: "in_progress" });
      if (isAffirmative(text) || normalize(text) === "ready") {
        return advance(person, "first_name", [
          OPENING_MESSAGE,
          "Great — let's begin.\nWhat's your first name?",
        ]);
      }
      return { outbound: [OPENING_MESSAGE], person };
    }
  }

  return processStep(person, text, mediaUrls);
}

async function promptForStep(step: string, person: PersonWithProfile): Promise<string[]> {
  const flags = parseBranchFlags(person.branchFlags);
  switch (step) {
    case "opening":
      return [OPENING_MESSAGE];
    case "first_name":
      return ["What's your first name?"];
    case "email":
      return ["What's the best email for you?"];
    case "photo":
      return [
        "Please send a clear photo of yourself 📷\n(Attach a picture here on WhatsApp.)",
      ];
    case "looking_for":
      return ["Who are you hoping to meet? (Women / Men)"];
    case "age":
      return ["Let's start easy 😊 How old are you?"];
    case "gender":
      return ["Perfect. And what's your gender?"];
    case "location":
      return ["Where do you live?"];
    case "grew_up":
      return ["And where did you grow up?"];
    case "grew_up_influence":
      return ["Do you feel like growing up there influenced who you are today?"];
    case "family_background":
      return ["What's your family background?\nAshkenazi / Sephardic / Both"];
    case "parents_background":
      return [
        "And your parents?\nMom — ?\nDad — ?\n\nFor example: Mom — Moroccan, Dad — Syrian — or any combination.",
      ];
    case "connected_side":
      return ["Which side do you personally feel more connected to, if either?"];
    case "dating_background_pref":
      return [
        "When it comes to dating, do you have a preference?\nSephardic / Ashkenazi / Either / doesn't matter / Open to both, but I usually prefer one",
      ];
    case "background_importance":
      return [
        "Is that something that's truly important to you, or is it more what you're used to and naturally comfortable with?",
      ];
    case "background_why":
      return [
        "What is it about that background that matters to you?\n(Traditions, family expectations, community, culture, religious customs, similar upbringing, language, family dynamics, attraction, familiarity — or something else)",
      ];
    case "background_coaching":
      return [BACKGROUND_COACHING];
    case "family_close":
      return ["Tell me a little about your family.\nAre you close?"];
    case "siblings":
      return ["Do you have siblings?"];
    case "bring_into_marriage":
      return [
        "What is something from the home you grew up in that you definitely want to bring into your own marriage and family?",
      ];
    case "do_differently":
      return ["Is there anything you would want to do differently?"];
    case "religiosity":
      return [
        "How would you describe yourself religiously today?\nOrthodox / Modern Orthodox / Traditional / Conservative / Reform / Not very religious / Somewhere in between / Other",
      ];
    case "religiosity_direction":
      return [
        "Are you happy with where you are religiously today, or would you like to grow or change in some way?\nHappy where I am / I'd like to grow more / I'd like to become less observant / I'm still figuring it out",
      ];
    case "partner_religiosity":
      return [
        "What about the person you marry?\nAbout the same as me / More religious than me / Less religious than me / I'm flexible",
      ];
    case "future_home_religious":
      return ["When you picture your future home, what matters most to you religiously?"];
    case "synagogue_yes":
      return ["Do you belong to or regularly go to a synagogue?"];
    case "synagogue_name":
      return ["Which one?"];
    case "community_importance":
      return [
        "How important is being part of a Jewish community to you?\nVery important / Somewhat important / Not really important",
      ];
    case "studied":
      return ["What did you study?"];
    case "work":
      return ["What do you do for work?"];
    case "work_enjoyment":
      return [
        "And do you actually enjoy what you do? 😊\nLove it / Mostly yes / It's just work 😂 / Not really",
      ];
    case "ambition":
      return ["Would you say you're ambitious?\nVery / Somewhat / Not particularly / It depends"];
    case "partner_success":
      return [
        "How important is your future partner's career or financial success to you?\nVery important / Important, but not everything / I mainly care that they're responsible and stable / Not very important",
      ];
    case "success_meaning":
      return [
        "When you say successful, what does that actually mean to you?\nFinancial security / Ambition and drive / Intelligence / A certain lifestyle / Status/accomplishment / A combination",
      ];
    case "three_words":
      return [
        `Okay 😊\nNow I know your age, your background, your religious life and what you do.\nBut none of that really tells me WHO YOU ARE.\nSo let's forget the résumé for a minute ❤️\nIf you could describe yourself in only THREE words, what would they be?`,
      ];
    case "hidden_side":
      return ["What's the side of you that someone only discovers once you really trust them?"];
    case "misunderstood":
      return ["What do you think people sometimes misunderstand about you when they first meet you?"];
    case "hobbies":
      return ["What do you genuinely love doing when you're not working?"];
    case "social_style":
      return [
        "Are you more of a…\nHomebody 🏠 / Very social 🥂 / Always traveling/adventuring ✈️ / A little of everything",
      ];
    case "perfect_sunday":
      return ["What does your perfect Sunday look like?"];
    case "love_receive":
      return [
        "What makes you feel most loved?\nQuality time / Physical affection / Words and reassurance / Thoughtful actions / Gifts / A combination",
      ];
    case "love_give":
      return ["And how do YOU usually show someone that you love them?"];
    case "connection":
      return ["When you really connect with someone, what usually creates that connection for you?"];
    case "connection_followup":
      if (flags.connectionSafe) return ["What makes you feel safe with someone?"];
      return ["What does chemistry mean to you?"];
    case "conflict_style":
      return [
        "When something bothers you in a relationship, do you usually…\nWant to talk about it immediately / Need some time first / Avoid conflict / It depends on the situation",
      ];
    case "disagreement_needs":
      return ["What is the best way for someone to communicate with you when there's a disagreement?"];
    case "dating_lesson":
      return [
        "Now I'm going to ask you something a little deeper ❤️\nYou don't need to give names or personal details.\nLooking back at your dating experiences or relationships, what is the biggest thing you've learned about YOURSELF?",
      ];
    case "repeats_type":
      return [
        "Do you notice yourself repeatedly choosing the same TYPE of person?\nYes 😂 / Maybe / Not really / I've never thought about it",
      ];
    case "type_in_common":
      return ["What do those people usually have in common?"];
    case "type_good_for_them":
      return ["And here's the harder question 😊\nHas that type actually been good for you?"];
    case "availability_feelings":
      return [
        "When someone IS emotionally available and clearly interested in you, how does that make you feel?",
      ];
    case "availability_coaching":
      return [AVAILABILITY_COACHING];
    case "spark_history":
      return ["When you've felt that huge immediate spark in the past, what happened afterward?"];
    case "spark_coaching":
      return [SPARK_COACHING];
    case "core_needs":
      return [
        "Forget your usual type for a minute.\nWhat are THREE things you NEED from someone to feel happy, secure, loved and understood in a relationship?",
      ];
    case "core_needs_redirect":
      return [
        "Those may absolutely be things you're attracted to 😊\nBut I'm asking something slightly different.\nWhat do you need to FEEL?\nFor example: Safe / Loved / Respected / Understood / Desired / Supported / Emotionally secure / Free to be yourself",
      ];
    case "non_negotiables":
      return ["Now give me THREE things you truly will not compromise on in the person you marry."];
    case "non_negotiable_challenge":
      return [
        "I'm going to challenge you a little 😊\nIf someone didn't have ONE of those things but was an incredible partner in every other way, would you genuinely walk away?",
      ];
    case "partner_qualities":
      return [
        "Now forget looks, career and everything on paper for a second.\nWhat are the THREE most important qualities you want your future partner to have?",
      ];
    case "quality_definitions":
      return ["When you say that, what does it actually LOOK like to you day to day?"];
    case "personality_attracted":
      return [
        "What type of personality are you naturally attracted to?\n(Outgoing, calm, funny, intellectual, strong, soft, adventurous, serious, affectionate — or your own words)",
      ];
    case "personality_not":
      return ["What kind of personality usually DOESN'T work well for you?"];
    case "physical_attracted":
      return [
        "Okay 😂\nYou have permission to be completely superficial for a minute.\nWhat are you physically attracted to?\nBe completely honest. There's no judgment here.",
      ];
    case "physical_not":
      return ["Anything physically that you know you're usually NOT attracted to?"];
    case "physical_must":
      return ["Would you say those are MUSTS, or mostly preferences?"];
    case "family_importance":
      return ["How important is family to you?\nExtremely / Very / Somewhat / Not a huge factor"];
    case "wants_children":
      return ["Do you want children?"];
    case "raising_family":
      return ["How do you imagine raising your family?"];
    case "judaism_children":
      return ["How would you like Judaism to be part of your children's lives?"];
    case "five_year":
      return ["When you picture yourself married 5 years from now, what does your life look like?"];
    case "home_feel":
      return ["What does your home feel like?"];
    case "ordinary_day":
      return ["What does an ordinary day together look like?"];
    case "looking_forward":
      return [
        "When you picture that life, what are you really looking forward to most — not the wedding, not being able to say you're married, but the actual LIFE you want to share with someone?",
      ];
    case "bring_to_relationship":
      return [
        "Okay…\nI've asked you a LOT about what you want in another person 😊\nNow we're turning the mirror around.\nWhat do YOU bring to a relationship?",
      ];
    case "difficult_dating_you":
      return ["And what do you think might sometimes be difficult about dating you?"];
    case "growth_edge":
      return [
        "What is ONE thing about yourself that you'd like to work on before or while building your next relationship?",
      ];
    case "unseen_side":
      return [
        "What is something about you that someone would NEVER know just from seeing your picture or reading your profile?",
      ];
    case "best_friend":
      return [
        "If your best friend were describing you privately to someone they really wanted to set you up with, what would they say about you?",
      ];
    case "mirror_ask":
      return ["Can I tell you something I'm noticing from our conversation?"];
    case "mirror_resonance":
      return ["Does that resonate with you?"];
    case "mindset_shift":
      return [
        "After everything we've talked about today, has anything changed — even slightly — about how you think about who you're looking for?",
      ];
    case "do_differently":
      return ["Is there anything you would want to do differently?"];
    case "do_differently_next":
      return ["What is ONE thing you'd like to do differently the next time you date someone?"];
    case "partner_age_range":
      return ["Before we wrap up, what age range would you genuinely consider in a partner?"];
    case "relocation_flexibility":
      return [
        "Are you open to relocating for the right relationship?\nYes / Maybe, depending where / No",
      ];
    case "has_children":
      return ["Do you currently have children?"];
    case "open_partner_children":
      return ["Would you be open to dating someone who already has children?\nYes / Maybe / No"];
    case "smoking_boundaries":
      return [
        "Any smoking or substance boundaries we should treat as a dealbreaker? You can say “none.”",
      ];
    case "marriage_timeline":
      return [
        "If the relationship is right, what timeline toward marriage feels honest for you?",
      ];
    default:
      return ["Thanks for sharing — whenever you're ready, keep going."];
  }
}

async function processStep(
  person: PersonWithProfile,
  text: string,
  mediaUrls: string[] = [],
): Promise<EngineResult> {
  const flags = parseBranchFlags(person.branchFlags);
  const step = person.currentStep;

  switch (step) {
    case "opening": {
      if (!isAffirmative(text) && normalize(text) !== "ready") {
        return {
          outbound: ["No pressure — just reply YES or READY when you'd like to begin 😊"],
          person,
        };
      }
      return advance(person, "first_name", ["What's your first name?"]);
    }
    case "first_name": {
      const name = text.trim().split(/\s+/)[0];
      if (name.length < 1) {
        return { outbound: [unclear("What's your first name?")], person };
      }
      return advance(
        person,
        "email",
        [`Nice to meet you, ${name}. What's the best email for you?`],
        flags,
        { firstName: name },
      );
    }
    case "email": {
      if (!isValidEmail(text)) {
        return {
          outbound: ["Could you send a valid email address? (example: name@email.com)"],
          person,
        };
      }
      return advance(
        person,
        "photo",
        [
          "Got it ❤️\nPlease send a clear photo of yourself 📷\n(Attach a picture here on WhatsApp.)",
        ],
        flags,
        { email: text.trim().toLowerCase() },
      );
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
            "I still need a photo of you 📷\nPlease attach a picture and send it.",
          ],
          person,
        };
      }
      const photoUrl = await saveInboundPhoto(person.id, attached || media);
      return advance(
        person,
        "looking_for",
        ["Thank you! Who are you hoping to meet? (Women / Men)"],
        flags,
        { photoUrl },
      );
    }
    case "looking_for": {
      return advance(person, "age", ["Let's start easy 😊 How old are you?"], flags, {
        lookingFor: text.trim(),
      });
    }
    case "age": {
      const age = parseAge(text);
      if (age == null) {
        return { outbound: ["Could you share your age as a number? (18+)"], person };
      }
      return advance(person, "gender", ["Perfect. And what's your gender?"], flags, { age });
    }
    case "gender": {
      return advance(person, "location", ["Where do you live?"], flags, { gender: text.trim() });
    }
    case "location": {
      await saveProfile(person.id, { location: text.trim() });
      return advance(person, "grew_up", ["And where did you grow up?"]);
    }
    case "grew_up": {
      await saveProfile(person.id, { grewUp: text.trim() });
      const profile = await ensureProfile(person.id);
      if (profile.location && locationsSeemDifferent(profile.location, text)) {
        return advance(person, "grew_up_influence", [
          "Do you feel like growing up there influenced who you are today?",
        ]);
      }
      return advance(person, "family_background", [
        "What's your family background?\nAshkenazi / Sephardic / Both",
      ]);
    }
    case "grew_up_influence": {
      await saveProfile(person.id, { grewUpInfluence: text.trim() });
      return advance(person, "family_background", [
        "What's your family background?\nAshkenazi / Sephardic / Both",
      ]);
    }
    case "family_background": {
      await saveProfile(person.id, { familyBackground: text.trim() });
      return advance(person, "parents_background", [
        "And your parents?\nMom — ?\nDad — ?\n\nFor example: Mom — Moroccan, Dad — Syrian.",
      ]);
    }
    case "parents_background": {
      const momMatch = text.match(/mom\s*[-—:]\s*([^,\n]+)/i);
      const dadMatch = text.match(/dad\s*[-—:]\s*([^,\n]+)/i);
      await saveProfile(person.id, {
        momBackground: momMatch?.[1]?.trim() || text.trim(),
        dadBackground: dadMatch?.[1]?.trim() || null,
      });
      return advance(person, "connected_side", [
        "Which side do you personally feel more connected to, if either?",
      ]);
    }
    case "connected_side": {
      await saveProfile(person.id, { connectedSide: text.trim() });
      return advance(person, "dating_background_pref", [
        "When it comes to dating, do you have a preference?\nSephardic / Ashkenazi / Either / doesn't matter / Open to both, but I usually prefer one",
      ]);
    }
    case "dating_background_pref": {
      const prefers = prefersSpecificBackground(text);
      flags.prefersBackground = prefers;
      await saveProfile(person.id, { datingBackgroundPreference: text.trim() });
      if (prefers) {
        return advance(
          person,
          "background_importance",
          [
            "Is that something that's truly important to you, or is it more what you're used to and naturally comfortable with?",
          ],
          flags,
        );
      }
      return advance(person, "family_close", ["Tell me a little about your family.\nAre you close?"], flags);
    }
    case "background_importance": {
      flags.backgroundIsRequirement = isTrueRequirement(text);
      await saveProfile(person.id, { backgroundImportance: text.trim() });
      return advance(
        person,
        "background_why",
        [
          "What is it about that background that matters to you?\n(Traditions, family, culture, customs, familiarity — or something else)",
        ],
        flags,
      );
    }
    case "background_why": {
      await saveProfile(person.id, { backgroundWhy: text.trim() });
      return advance(person, "background_coaching", [BACKGROUND_COACHING], flags);
    }
    case "background_coaching": {
      await saveProfile(person.id, { backgroundOpenToOther: text.trim() });
      return advance(
        person,
        "family_close",
        [
          "Thank you — that helps us understand preference vs requirement.\nTell me a little about your family.\nAre you close?",
        ],
        flags,
      );
    }
    case "family_close": {
      await saveProfile(person.id, { familyCloseness: text.trim() });
      return advance(person, "siblings", ["Do you have siblings?"]);
    }
    case "siblings": {
      await saveProfile(person.id, { siblings: text.trim() });
      return advance(person, "bring_into_marriage", [
        "What is something from the home you grew up in that you definitely want to bring into your own marriage and family?",
      ]);
    }
    case "bring_into_marriage": {
      await saveProfile(person.id, { bringIntoMarriage: text.trim() });
      return advance(person, "do_differently", ["Is there anything you would want to do differently?"]);
    }
    case "do_differently": {
      await saveProfile(person.id, { doDifferently: text.trim() });
      return advance(person, "religiosity", [
        FAMILY_REFLECTION,
        "How would you describe yourself religiously today?\nOrthodox / Modern Orthodox / Traditional / Conservative / Reform / Not very religious / Somewhere in between / Other",
      ]);
    }
    case "religiosity": {
      await saveProfile(person.id, { religiosity: text.trim() });
      return advance(person, "religiosity_direction", [
        "Are you happy with where you are religiously today, or would you like to grow or change in some way?\nHappy where I am / I'd like to grow more / I'd like to become less observant / I'm still figuring it out",
      ]);
    }
    case "religiosity_direction": {
      await saveProfile(person.id, { religiosityDirection: text.trim() });
      return advance(person, "partner_religiosity", [
        "What about the person you marry?\nAbout the same as me / More religious than me / Less religious than me / I'm flexible",
      ]);
    }
    case "partner_religiosity": {
      await saveProfile(person.id, { partnerReligiosity: text.trim() });
      return advance(person, "future_home_religious", [
        "When you picture your future home, what matters most to you religiously?\n(Shabbat, kashrut, synagogue, community, Jewish education, how children will be raised, relationship with Hashem — whatever matters most)",
      ]);
    }
    case "future_home_religious": {
      await saveProfile(person.id, { futureHomeReligious: text.trim() });
      return advance(person, "synagogue_yes", [
        RELIGION_COACHING,
        "Do you belong to or regularly go to a synagogue?",
      ]);
    }
    case "synagogue_yes": {
      const yes = synagogueYes(text);
      flags.synagogueYes = yes;
      await saveProfile(person.id, { synagogueYesNo: text.trim() });
      if (yes) {
        return advance(person, "synagogue_name", ["Which one?"], flags);
      }
      return advance(
        person,
        "community_importance",
        [
          "How important is being part of a Jewish community to you?\nVery important / Somewhat important / Not really important",
        ],
        flags,
      );
    }
    case "synagogue_name": {
      await saveProfile(person.id, { synagogueName: text.trim() });
      return advance(person, "community_importance", [
        "How important is being part of a Jewish community to you?\nVery important / Somewhat important / Not really important",
      ]);
    }
    case "community_importance": {
      await saveProfile(person.id, { communityImportance: text.trim() });
      return advance(person, "studied", ["What did you study?"]);
    }
    case "studied": {
      await saveProfile(person.id, { studied: text.trim() });
      return advance(person, "work", ["What do you do for work?"]);
    }
    case "work": {
      await saveProfile(person.id, { work: text.trim() });
      return advance(person, "work_enjoyment", [
        "And do you actually enjoy what you do? 😊\nLove it / Mostly yes / It's just work 😂 / Not really",
      ]);
    }
    case "work_enjoyment": {
      await saveProfile(person.id, { workEnjoyment: text.trim() });
      return advance(person, "ambition", [
        "Would you say you're ambitious?\nVery / Somewhat / Not particularly / It depends",
      ]);
    }
    case "ambition": {
      await saveProfile(person.id, { ambition: text.trim() });
      return advance(person, "partner_success", [
        "How important is your future partner's career or financial success to you?\nVery important / Important, but not everything / I mainly care that they're responsible and stable / Not very important",
      ]);
    }
    case "partner_success": {
      const very = partnerSuccessVeryImportant(text);
      flags.successVeryImportant = very;
      await saveProfile(person.id, { partnerSuccessImportance: text.trim() });
      if (very) {
        return advance(
          person,
          "success_meaning",
          [
            "When you say successful, what does that actually mean to you?\nFinancial security / Ambition and drive / Intelligence / A certain lifestyle / Status/accomplishment / A combination",
          ],
          flags,
        );
      }
      return advance(person, "three_words", await promptForStep("three_words", person), flags);
    }
    case "success_meaning": {
      await saveProfile(person.id, { successMeaning: text.trim() });
      const reflection = await successMeaningReflection(text.trim());
      return advance(person, "three_words", [reflection, ...(await promptForStep("three_words", person))]);
    }
    case "three_words": {
      await saveProfile(person.id, { threeWords: text.trim() });
      const follow = await threeWordsFollowup(text.trim());
      return advance(person, "hidden_side", [follow]);
    }
    case "hidden_side": {
      await saveProfile(person.id, { hiddenSide: text.trim() });
      return advance(person, "misunderstood", [
        "What do you think people sometimes misunderstand about you when they first meet you?",
      ]);
    }
    case "misunderstood": {
      await saveProfile(person.id, { misunderstoodAs: text.trim() });
      return advance(person, "hobbies", ["What do you genuinely love doing when you're not working?"]);
    }
    case "hobbies": {
      await saveProfile(person.id, { hobbies: text.trim() });
      return advance(person, "social_style", [
        "Are you more of a…\nHomebody 🏠 / Very social 🥂 / Always traveling/adventuring ✈️ / A little of everything",
      ]);
    }
    case "social_style": {
      await saveProfile(person.id, { socialStyle: text.trim() });
      return advance(person, "perfect_sunday", ["What does your perfect Sunday look like?"]);
    }
    case "perfect_sunday": {
      await saveProfile(person.id, { perfectSunday: text.trim() });
      return advance(person, "love_receive", [
        "What makes you feel most loved?\nQuality time / Physical affection / Words and reassurance / Thoughtful actions / Gifts / A combination",
      ]);
    }
    case "love_receive": {
      await saveProfile(person.id, { loveLanguageReceive: text.trim() });
      return advance(person, "love_give", ["And how do YOU usually show someone that you love them?"]);
    }
    case "love_give": {
      const profile = await ensureProfile(person.id);
      flags.loveLangDiffer = loveLanguagesDiffer(profile.loveLanguageReceive || "", text);
      await saveProfile(person.id, { loveLanguageGive: text.trim() });
      const msgs = flags.loveLangDiffer
        ? [LOVE_LANGUAGE_COACHING, "When you really connect with someone, what usually creates that connection for you?"]
        : ["When you really connect with someone, what usually creates that connection for you?"];
      return advance(person, "connection", msgs, flags);
    }
    case "connection": {
      flags.connectionSafe = mentionsSafe(text);
      flags.connectionChemistry = mentionsChemistry(text);
      if (needsImmediateSpark(flags, text)) flags.needsSpark = true;
      await saveProfile(person.id, { connectionDrivers: text.trim() });
      if (flags.connectionSafe || flags.connectionChemistry) {
        return advance(
          person,
          "connection_followup",
          flags.connectionSafe
            ? ["What makes you feel safe with someone?"]
            : ["What does chemistry mean to you?"],
          flags,
        );
      }
      return advance(person, "conflict_style", [
        "When something bothers you in a relationship, do you usually…\nWant to talk about it immediately / Need some time first / Avoid conflict / It depends on the situation",
      ], flags);
    }
    case "connection_followup": {
      await saveProfile(person.id, { connectionFollowup: text.trim() });
      return advance(person, "conflict_style", [
        "When something bothers you in a relationship, do you usually…\nWant to talk about it immediately / Need some time first / Avoid conflict / It depends on the situation",
      ]);
    }
    case "conflict_style": {
      await saveProfile(person.id, { conflictStyle: text.trim() });
      return advance(person, "disagreement_needs", [
        "What is the best way for someone to communicate with you when there's a disagreement?",
      ]);
    }
    case "disagreement_needs": {
      await saveProfile(person.id, { disagreementNeeds: text.trim() });
      return advance(person, "dating_lesson", [
        "Now I'm going to ask you something a little deeper ❤️\nYou don't need to give names or personal details.\nLooking back at your dating experiences or relationships, what is the biggest thing you've learned about YOURSELF?",
      ]);
    }
    case "dating_lesson": {
      await saveProfile(person.id, { datingLesson: text.trim() });
      if (indicatesUnavailablePattern(text)) flags.unavailablePattern = true;
      if (needsImmediateSpark(flags, text)) flags.needsSpark = true;
      const reflection = await reflectAnswer("what you learned about yourself", text.trim());
      return advance(
        person,
        "repeats_type",
        [
          reflection,
          "Do you notice yourself repeatedly choosing the same TYPE of person?\nYes 😂 / Maybe / Not really / I've never thought about it",
        ],
        flags,
      );
    }
    case "repeats_type": {
      const yesMaybe = repeatsTypeYesMaybe(text);
      flags.repeatsType = yesMaybe;
      await saveProfile(person.id, { repeatsType: text.trim() });
      if (yesMaybe) {
        return advance(person, "type_in_common", ["What do those people usually have in common?"], flags);
      }
      // skip to needs, but check conditional sections
      return maybeAvailabilityOrSparkOrNeeds(person, flags);
    }
    case "type_in_common": {
      await saveProfile(person.id, { typeInCommon: text.trim() });
      if (indicatesUnavailablePattern(text)) flags.unavailablePattern = true;
      if (needsImmediateSpark(flags, text)) flags.needsSpark = true;
      return advance(
        person,
        "type_good_for_them",
        ["And here's the harder question 😊\nHas that type actually been good for you?"],
        flags,
      );
    }
    case "type_good_for_them": {
      await saveProfile(person.id, { typeGoodForThem: text.trim() });
      if (indicatesUnavailablePattern(text)) flags.unavailablePattern = true;
      return maybeAvailabilityOrSparkOrNeeds(person, flags);
    }
    case "availability_feelings": {
      await saveProfile(person.id, { availabilityFeelings: text.trim() });
      if (losesInterestWhenAvailable(text)) {
        flags.losesInterestAvailable = true;
        return advance(person, "availability_coaching", [AVAILABILITY_COACHING], flags);
      }
      return maybeSparkOrNeeds(person, flags);
    }
    case "availability_coaching": {
      await saveProfile(person.id, { availabilityCoachingNotes: text.trim() });
      return maybeSparkOrNeeds(person, flags);
    }
    case "spark_history": {
      await saveProfile(person.id, { sparkHistory: text.trim() });
      return advance(person, "spark_coaching", [SPARK_COACHING]);
    }
    case "spark_coaching": {
      await saveProfile(person.id, { openWithoutFireworks: text.trim() });
      return advance(person, "core_needs", [
        "Forget your usual type for a minute.\nWhat are THREE things you NEED from someone to feel happy, secure, loved and understood in a relationship?",
      ]);
    }
    case "core_needs": {
      if (looksLikeResumeNeeds(text) && !flags.needsRedirected) {
        flags.needsRedirected = true;
        return advance(person, "core_needs_redirect", [
          "Those may absolutely be things you're attracted to 😊\nBut I'm asking something slightly different.\nWhat do you need to FEEL?\nFor example: Safe / Loved / Respected / Understood / Desired / Supported / Emotionally secure / Free to be yourself",
        ], flags);
      }
      await saveProfile(person.id, { coreEmotionalNeeds: text.trim() });
      return advance(person, "non_negotiables", [
        "Now give me THREE things you truly will not compromise on in the person you marry.",
      ], flags);
    }
    case "core_needs_redirect": {
      await saveProfile(person.id, { coreEmotionalNeeds: text.trim() });
      return advance(person, "non_negotiables", [
        "Now give me THREE things you truly will not compromise on in the person you marry.",
      ]);
    }
    case "non_negotiables": {
      await saveProfile(person.id, { nonNegotiables: text.trim() });
      return advance(person, "non_negotiable_challenge", [
        "I'm going to challenge you a little 😊\nIf someone didn't have ONE of those things but was an incredible partner in every other way, would you genuinely walk away?",
      ]);
    }
    case "non_negotiable_challenge": {
      await saveProfile(person.id, { nonNegotiableChallenge: text.trim() });
      return advance(person, "partner_qualities", [
        "Now forget looks, career and everything on paper for a second.\nWhat are the THREE most important qualities you want your future partner to have?",
      ]);
    }
    case "partner_qualities": {
      flags.broadQuality = isBroadQuality(text);
      await saveProfile(person.id, { partnerQualities: text.trim() });
      if (flags.broadQuality) {
        return advance(
          person,
          "quality_definitions",
          ["When you say that, what does that quality actually LOOK like to you?"],
          flags,
        );
      }
      return advance(person, "personality_attracted", [
        "What type of personality are you naturally attracted to?\n(Outgoing, calm, funny, intellectual, strong, soft, adventurous, serious, affectionate — or your own words)",
      ], flags);
    }
    case "quality_definitions": {
      await saveProfile(person.id, { qualityDefinitions: text.trim() });
      return advance(person, "personality_attracted", [
        "What type of personality are you naturally attracted to?\n(Outgoing, calm, funny, intellectual, strong, soft, adventurous, serious, affectionate — or your own words)",
      ]);
    }
    case "personality_attracted": {
      await saveProfile(person.id, { personalityAttracted: text.trim() });
      return advance(person, "personality_not", [
        "What kind of personality usually DOESN'T work well for you?",
      ]);
    }
    case "personality_not": {
      await saveProfile(person.id, { personalityNotAttracted: text.trim() });
      return advance(person, "physical_attracted", [
        "Okay 😂\nYou have permission to be completely superficial for a minute.\nWhat are you physically attracted to?\nBe completely honest. There's no judgment here.",
      ]);
    }
    case "physical_attracted": {
      await saveProfile(person.id, { physicalAttracted: text.trim() });
      return advance(person, "physical_not", [
        "Anything physically that you know you're usually NOT attracted to?",
      ]);
    }
    case "physical_not": {
      await saveProfile(person.id, { physicalNotAttracted: text.trim() });
      return advance(person, "physical_must", ["Would you say those are MUSTS, or mostly preferences?"]);
    }
    case "physical_must": {
      await saveProfile(person.id, { physicalMustOrPrefer: text.trim() });
      return advance(person, "family_importance", [
        PHYSICAL_COACHING,
        "How important is family to you?\nExtremely / Very / Somewhat / Not a huge factor",
      ]);
    }
    case "family_importance": {
      await saveProfile(person.id, { familyImportance: text.trim() });
      return advance(person, "wants_children", ["Do you want children?"]);
    }
    case "wants_children": {
      const yes = wantsChildren(text);
      flags.wantsChildren = yes;
      await saveProfile(person.id, { wantsChildren: text.trim() });
      if (yes) {
        return advance(person, "raising_family", ["How do you imagine raising your family?"], flags);
      }
      return advance(person, "five_year", [
        "When you picture yourself married 5 years from now, what does your life look like?",
      ], flags);
    }
    case "raising_family": {
      await saveProfile(person.id, { raisingFamily: text.trim() });
      return advance(person, "judaism_children", [
        "How would you like Judaism to be part of your children's lives?",
      ]);
    }
    case "judaism_children": {
      await saveProfile(person.id, { judaismForChildren: text.trim() });
      return advance(person, "five_year", [
        "When you picture yourself married 5 years from now, what does your life look like?",
      ]);
    }
    case "five_year": {
      await saveProfile(person.id, { fiveYearLife: text.trim() });
      return advance(person, "home_feel", ["What does your home feel like?"]);
    }
    case "home_feel": {
      await saveProfile(person.id, { homeFeel: text.trim() });
      return advance(person, "ordinary_day", ["What does an ordinary day together look like?"]);
    }
    case "ordinary_day": {
      await saveProfile(person.id, { ordinaryDay: text.trim() });
      return advance(person, "looking_forward", [
        "When you picture that life, what are you really looking forward to most — not the wedding, not being able to say you're married, but the actual LIFE you want to share with someone?",
      ]);
    }
    case "looking_forward": {
      await saveProfile(person.id, { lookingForwardMost: text.trim() });
      return advance(person, "bring_to_relationship", [
        FIVE_YEAR_REFLECTION,
        "Okay…\nI've asked you a LOT about what you want in another person 😊\nNow we're turning the mirror around.\nWhat do YOU bring to a relationship?",
      ]);
    }
    case "bring_to_relationship": {
      await saveProfile(person.id, { bringToRelationship: text.trim() });
      return advance(person, "difficult_dating_you", [
        "And what do you think might sometimes be difficult about dating you?",
      ]);
    }
    case "difficult_dating_you": {
      const help = text.trim().length < 8 ? MIRROR_INTRO_HELP : null;
      await saveProfile(person.id, { difficultAboutDatingThem: text.trim() });
      return advance(person, "growth_edge", [
        ...(help ? [help] : []),
        "What is ONE thing about yourself that you'd like to work on before or while building your next relationship?",
      ]);
    }
    case "growth_edge": {
      await saveProfile(person.id, { growthEdge: text.trim() });
      return advance(person, "unseen_side", [
        "What is something about you that someone would NEVER know just from seeing your picture or reading your profile?",
      ]);
    }
    case "unseen_side": {
      await saveProfile(person.id, { unseenSide: text.trim() });
      return advance(person, "best_friend", [
        "If your best friend were describing you privately to someone they really wanted to set you up with, what would they say about you?",
      ]);
    }
    case "best_friend": {
      await saveProfile(person.id, { bestFriendDescription: text.trim() });
      return advance(person, "mirror_ask", [
        "Can I tell you something I'm noticing from our conversation?",
      ]);
    }
    case "mirror_ask": {
      if (!isAffirmative(text) && !normalize(text).includes("yes") && normalize(text) !== "ok" && normalize(text) !== "okay" && normalize(text) !== "sure") {
        return advance(person, "mindset_shift", [
          "Totally fine ❤️\nAfter everything we've talked about today, has anything changed — even slightly — about how you think about who you're looking for?",
        ]);
      }
      const fresh = (await prisma.person.findUniqueOrThrow({
        where: { id: person.id },
        include: { profile: true, messages: { orderBy: { createdAt: "asc" }, take: 80 } },
      })) as import("@/lib/types").PersonWithDetails;
      const transcript = fresh.messages
        .map((m) => `${m.direction === "inbound" ? "Them" : "TOIMOI"}: ${m.body}`)
        .join("\n");
      const reflection = await mirrorPattern(fresh, fresh.profile, transcript);
      await saveProfile(person.id, { mirrorReflection: reflection });
      return advance(person, "mirror_resonance", [reflection]);
    }
    case "mirror_resonance": {
      await saveProfile(person.id, { mirrorResonance: text.trim() });
      return advance(person, "mindset_shift", [
        "After everything we've talked about today, has anything changed — even slightly — about how you think about who you're looking for?",
      ]);
    }
    case "mindset_shift": {
      await saveProfile(person.id, { mindsetShift: text.trim() });
      return advance(person, "do_differently_next", [
        "What is ONE thing you'd like to do differently the next time you date someone?",
      ]);
    }
    case "do_differently_next": {
      await saveProfile(person.id, { doDifferentlyNext: text.trim() });
      return advance(person, "partner_age_range", [
        "Before we wrap up, what age range would you genuinely consider in a partner?",
      ], flags);
    }
    case "partner_age_range": {
      const ages = text.match(/\b([1-9][0-9]?)\b/g)?.map(Number) || [];
      if (ages.filter((age) => age >= 18 && age <= 99).length < 2) {
        return {
          outbound: ["Please give a minimum and maximum age, for example: 27–36."],
          person,
        };
      }
      await saveProfile(person.id, { partnerAgeRange: text.trim() });
      return advance(person, "relocation_flexibility", [
        "Are you open to relocating for the right relationship?\nYes / Maybe, depending where / No",
      ]);
    }
    case "relocation_flexibility": {
      await saveProfile(person.id, { relocationFlexibility: text.trim() });
      return advance(person, "has_children", ["Do you currently have children?"]);
    }
    case "has_children": {
      await saveProfile(person.id, { hasChildren: text.trim() });
      return advance(person, "open_partner_children", [
        "Would you be open to dating someone who already has children?\nYes / Maybe / No",
      ]);
    }
    case "open_partner_children": {
      await saveProfile(person.id, { openToPartnerChildren: text.trim() });
      return advance(person, "smoking_boundaries", [
        "Any smoking or substance boundaries we should treat as a dealbreaker? You can say “none.”",
      ]);
    }
    case "smoking_boundaries": {
      await saveProfile(person.id, { smokingBoundaries: text.trim() });
      return advance(person, "marriage_timeline", [
        "If the relationship is right, what timeline toward marriage feels honest for you?",
      ]);
    }
    case "marriage_timeline": {
      await saveProfile(person.id, { marriageTimeline: text.trim() });
      return advance(person, "complete", FINAL_MESSAGE_PARTS, flags, {
        status: "complete",
        completedAt: new Date(),
      });
    }
    case "final": {
      return advance(person, "complete", FINAL_MESSAGE_PARTS, flags, {
        status: "complete",
        completedAt: new Date(),
      });
    }
    default: {
      // recovery
      return advance(person, "first_name", [
        "Let's pick back up gently. What's your first name?",
      ]);
    }
  }
}

async function maybeAvailabilityOrSparkOrNeeds(
  person: PersonWithProfile,
  flags: BranchFlags,
): Promise<EngineResult> {
  // Only enter availability coaching when their answers suggest unavailable/chase patterns
  if (flags.unavailablePattern) {
    return advance(
      person,
      "availability_feelings",
      ["When someone IS emotionally available and clearly interested in you, how does that make you feel?"],
      flags,
    );
  }
  return maybeSparkOrNeeds(person, flags);
}

async function maybeSparkOrNeeds(
  person: PersonWithProfile,
  flags: BranchFlags,
): Promise<EngineResult> {
  if (flags.needsSpark) {
    return advance(
      person,
      "spark_history",
      ["When you've felt that huge immediate spark in the past, what happened afterward?"],
      flags,
    );
  }
  return advance(person, "core_needs", [
    "Forget your usual type for a minute.\nWhat are THREE things you NEED from someone to feel happy, secure, loved and understood in a relationship?",
  ], flags);
}
