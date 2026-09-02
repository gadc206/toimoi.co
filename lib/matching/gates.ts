import { normalize } from "@/lib/toimo/branches";
import type {
  EvidenceRef,
  GateResult,
  GateStatus,
  PersonWithProfile,
} from "@/lib/types";
import type { MatchProfile } from "@/lib/matching/profile-schema";

function evidence(
  personId: string,
  field: string,
  value: string | number | null | undefined,
): EvidenceRef[] {
  if (value == null || value === "") return [];
  return [{ personId, field, quote: String(value).slice(0, 280), confidence: 1 }];
}

function gate(
  key: string,
  label: string,
  status: GateStatus,
  detail: string,
  refs: EvidenceRef[] = [],
): GateResult {
  return { key, label, status, detail, evidence: refs };
}

function ageGate(
  owner: PersonWithProfile,
  ownerProfile: MatchProfile,
  candidate: PersonWithProfile,
): GateResult {
  const min = ownerProfile.practical.minimumPartnerAge;
  const max = ownerProfile.practical.maximumPartnerAge;
  const label = `${owner.firstName || "Person"}'s age requirement`;
  if (min == null || max == null || candidate.age == null) {
    return gate(
      `age_${owner.id}`,
      label,
      "needs_review",
      "Partner age range or candidate age is missing.",
      [
        ...evidence(owner.id, "partnerAgeRange", owner.profile?.partnerAgeRange),
        ...evidence(candidate.id, "age", candidate.age),
      ],
    );
  }
  const pass = candidate.age >= min && candidate.age <= max;
  return gate(
    `age_${owner.id}`,
    label,
    pass ? "pass" : "blocked",
    pass
      ? `${candidate.age} is within the stated ${min}–${max} range.`
      : `${candidate.age} is outside the stated ${min}–${max} range.`,
    [
      ...evidence(owner.id, "partnerAgeRange", owner.profile?.partnerAgeRange),
      ...evidence(candidate.id, "age", candidate.age),
    ],
  );
}

function childrenGate(
  owner: PersonWithProfile,
  ownerProfile: MatchProfile,
  candidate: PersonWithProfile,
  candidateProfile: MatchProfile,
): GateResult {
  const refs = [
    ...evidence(owner.id, "openToPartnerChildren", owner.profile?.openToPartnerChildren),
    ...evidence(candidate.id, "hasChildren", candidate.profile?.hasChildren),
    ...evidence(owner.id, "wantsChildren", owner.profile?.wantsChildren),
    ...evidence(candidate.id, "wantsChildren", candidate.profile?.wantsChildren),
  ];
  if (
    ownerProfile.practical.openToPartnerChildren === "no" &&
    candidateProfile.practical.hasChildren === "yes"
  ) {
    return gate(
      `children_${owner.id}`,
      `${owner.firstName || "Person"}'s children requirement`,
      "blocked",
      "They do not want a partner with children, and the candidate has children.",
      refs,
    );
  }
  const wantsA = ownerProfile.practical.wantsChildren;
  const wantsB = candidateProfile.practical.wantsChildren;
  if ((wantsA === "yes" && wantsB === "no") || (wantsA === "no" && wantsB === "yes")) {
    return gate(
      `children_${owner.id}`,
      "Future children",
      "blocked",
      "Their stated plans for future children conflict.",
      refs,
    );
  }
  if (
    ownerProfile.practical.openToPartnerChildren == null ||
    candidateProfile.practical.hasChildren == null ||
    wantsA == null ||
    wantsB == null
  ) {
    return gate(
      `children_${owner.id}`,
      "Children and family",
      "needs_review",
      "Some current/future children information is missing.",
      refs,
    );
  }
  return gate(`children_${owner.id}`, "Children and family", "pass", "No confirmed conflict.", refs);
}

function religionGate(owner: PersonWithProfile, candidate: PersonWithProfile): GateResult {
  const wanted = normalize(owner.profile?.partnerReligiosity || "");
  const own = normalize(owner.profile?.religiosity || "");
  const theirs = normalize(candidate.profile?.religiosity || "");
  const refs = [
    ...evidence(owner.id, "partnerReligiosity", owner.profile?.partnerReligiosity),
    ...evidence(owner.id, "religiosity", owner.profile?.religiosity),
    ...evidence(candidate.id, "religiosity", candidate.profile?.religiosity),
  ];
  if (!wanted || !own || !theirs) {
    return gate(
      `religion_${owner.id}`,
      `${owner.firstName || "Person"}'s religious-home fit`,
      "needs_review",
      "Religious direction information is incomplete.",
      refs,
    );
  }
  const requirement =
    /\b(must|only|require|non-negotiable|dealbreaker)\b/.test(wanted) ||
    normalize(owner.profile?.futureHomeReligious || "").includes("must");
  if (requirement && wanted.includes("same") && own !== theirs) {
    return gate(
      `religion_${owner.id}`,
      `${owner.firstName || "Person"}'s religious-home fit`,
      "blocked",
      "A stated same-level religious requirement conflicts.",
      refs,
    );
  }
  return gate(
    `religion_${owner.id}`,
    `${owner.firstName || "Person"}'s religious-home fit`,
    "pass",
    requirement ? "The confirmed requirement is compatible." : "No confirmed hard conflict.",
    refs,
  );
}

function cultureGate(owner: PersonWithProfile, candidate: PersonWithProfile): GateResult {
  const importance = normalize(owner.profile?.backgroundImportance || "");
  const wanted = normalize(owner.profile?.datingBackgroundPreference || "");
  const candidateBackground = normalize(candidate.profile?.familyBackground || "");
  const refs = [
    ...evidence(owner.id, "datingBackgroundPreference", owner.profile?.datingBackgroundPreference),
    ...evidence(owner.id, "backgroundImportance", owner.profile?.backgroundImportance),
    ...evidence(candidate.id, "familyBackground", candidate.profile?.familyBackground),
  ];
  const required = /\b(must|only|require|requirement|truly important|non-negotiable|dealbreaker)\b/.test(
    importance,
  );
  if (!required) {
    return gate(
      `culture_${owner.id}`,
      `${owner.firstName || "Person"}'s background preference`,
      "pass",
      "Background is not confirmed as a hard requirement.",
      refs,
    );
  }
  if (!wanted || !candidateBackground) {
    return gate(
      `culture_${owner.id}`,
      `${owner.firstName || "Person"}'s background requirement`,
      "needs_review",
      "A requirement exists, but the comparison data is incomplete.",
      refs,
    );
  }
  const requested = ["ashkenazi", "sephardic"].find((term) => wanted.includes(term));
  if (requested && !candidateBackground.includes(requested) && !candidateBackground.includes("both")) {
    return gate(
      `culture_${owner.id}`,
      `${owner.firstName || "Person"}'s background requirement`,
      "blocked",
      `The stated ${requested} requirement does not match the candidate's answer.`,
      refs,
    );
  }
  return gate(
    `culture_${owner.id}`,
    `${owner.firstName || "Person"}'s background requirement`,
    "pass",
    "The stated background requirement is compatible.",
    refs,
  );
}

function locationGate(
  a: PersonWithProfile,
  pa: MatchProfile,
  b: PersonWithProfile,
  pb: MatchProfile,
): GateResult {
  const refs = [
    ...evidence(a.id, "location", pa.practical.location),
    ...evidence(a.id, "relocationFlexibility", a.profile?.relocationFlexibility),
    ...evidence(b.id, "location", pb.practical.location),
    ...evidence(b.id, "relocationFlexibility", b.profile?.relocationFlexibility),
  ];
  if (!pa.practical.location || !pb.practical.location) {
    return gate("location", "Location and relocation", "needs_review", "Location is missing.", refs);
  }
  const locationA = normalize(pa.practical.location);
  const locationB = normalize(pb.practical.location);
  const same =
    locationA === locationB || locationA.includes(locationB) || locationB.includes(locationA);
  if (same) return gate("location", "Location and relocation", "pass", "Locations align.", refs);
  if (pa.practical.relocation === "no" && pb.practical.relocation === "no") {
    return gate(
      "location",
      "Location and relocation",
      "blocked",
      "They live in different places and both said they cannot relocate.",
      refs,
    );
  }
  if (pa.practical.relocation == null || pb.practical.relocation == null) {
    return gate(
      "location",
      "Location and relocation",
      "needs_review",
      "Locations differ and relocation flexibility is incomplete.",
      refs,
    );
  }
  return gate(
    "location",
    "Location and relocation",
    "pass",
    "Locations differ, but at least one person is open to relocating.",
    refs,
  );
}

function smokingGate(a: PersonWithProfile, pa: MatchProfile, b: PersonWithProfile, pb: MatchProfile) {
  const textA = normalize(a.profile?.smokingBoundaries || "");
  const textB = normalize(b.profile?.smokingBoundaries || "");
  const refs = [
    ...evidence(a.id, "smokingBoundaries", a.profile?.smokingBoundaries),
    ...evidence(b.id, "smokingBoundaries", b.profile?.smokingBoundaries),
  ];
  if (!textA || !textB) {
    return gate(
      "smoking",
      "Smoking/substance boundaries",
      "needs_review",
      "Smoking/substance information is incomplete.",
      refs,
    );
  }
  const aSmokes = /\b(i smoke|smoker|occasionally smoke)\b/.test(textA);
  const bSmokes = /\b(i smoke|smoker|occasionally smoke)\b/.test(textB);
  if (
    (pa.practical.smokingBoundary === "no_smoking" && bSmokes) ||
    (pb.practical.smokingBoundary === "no_smoking" && aSmokes)
  ) {
    return gate(
      "smoking",
      "Smoking/substance boundaries",
      "blocked",
      "A confirmed no-smoking requirement conflicts.",
      refs,
    );
  }
  return gate("smoking", "Smoking/substance boundaries", "pass", "No confirmed conflict.", refs);
}

export function evaluateGates(
  a: PersonWithProfile,
  pa: MatchProfile,
  b: PersonWithProfile,
  pb: MatchProfile,
): { status: GateStatus; gates: GateResult[] } {
  const gates: GateResult[] = [];
  gates.push(
    gate(
      "active_complete",
      "Active completed profiles",
      a.status === "complete" && b.status === "complete" ? "pass" : "blocked",
      a.status === "complete" && b.status === "complete"
        ? "Both profiles are complete and active."
        : "Both people must have completed active profiles.",
    ),
  );

  const genderPass =
    (pa.practical.gender === "woman" && pb.practical.gender === "man") ||
    (pa.practical.gender === "man" && pb.practical.gender === "woman");
  gates.push(
    gate(
      "gender",
      "Woman–man pair",
      genderPass ? "pass" : "blocked",
      genderPass ? "The pair meets the woman–man eligibility rule." : "The required pairing is not confirmed.",
      [
        ...evidence(a.id, "gender", a.gender),
        ...evidence(b.id, "gender", b.gender),
      ],
    ),
  );

  const seekingPass =
    (pa.practical.gender === "woman" &&
      pa.practical.lookingFor === "men" &&
      pb.practical.gender === "man" &&
      pb.practical.lookingFor === "women") ||
    (pa.practical.gender === "man" &&
      pa.practical.lookingFor === "women" &&
      pb.practical.gender === "woman" &&
      pb.practical.lookingFor === "men");
  const seekingMissing = !pa.practical.lookingFor || !pb.practical.lookingFor;
  gates.push(
    gate(
      "looking_for",
      "Mutual looking-for",
      seekingMissing ? "needs_review" : seekingPass ? "pass" : "blocked",
      seekingMissing
        ? "At least one looking-for answer is missing."
        : seekingPass
          ? "Both people explicitly seek the other's gender."
          : "The looking-for answers do not mutually align.",
      [
        ...evidence(a.id, "lookingFor", a.lookingFor),
        ...evidence(b.id, "lookingFor", b.lookingFor),
      ],
    ),
  );

  gates.push(ageGate(a, pa, b), ageGate(b, pb, a));
  gates.push(childrenGate(a, pa, b, pb), childrenGate(b, pb, a, pa));
  gates.push(religionGate(a, b), religionGate(b, a));
  gates.push(cultureGate(a, b), cultureGate(b, a));
  gates.push(locationGate(a, pa, b, pb), smokingGate(a, pa, b, pb));

  for (const person of [a, b]) {
    const notes = normalize(person.profile?.matchmakerEligibilityNotes || "");
    if (notes && !/^(none|no|n\/a|na)$/.test(notes)) {
      gates.push(
        gate(
          `eligibility_notes_${person.id}`,
          "Matchmaker eligibility notes",
          "needs_review",
          "Private eligibility notes require matchmaker confirmation.",
          evidence(person.id, "matchmakerEligibilityNotes", person.profile?.matchmakerEligibilityNotes),
        ),
      );
    }
  }

  const status: GateStatus = gates.some((item) => item.status === "blocked")
    ? "blocked"
    : gates.some((item) => item.status === "needs_review")
      ? "needs_review"
      : "pass";
  return { status, gates };
}
