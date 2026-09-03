export type Person = {
  id: string;
  phone: string;
  firstName: string | null;
  dateOfBirth: string | null;
  email: string | null;
  photoUrl: string | null;
  age: number | null;
  gender: string | null;
  lookingFor: string | null;
  status: string;
  currentStep: string;
  branchFlags: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  pausedAt: Date | null;
};

export type ProfileAnswers = {
  id: string;
  personId: string;
  location: string | null;
  everydayLife: string | null;
  grewUp: string | null;
  grewUpInfluence: string | null;
  familyBackground: string | null;
  momBackground: string | null;
  dadBackground: string | null;
  connectedSide: string | null;
  datingBackgroundPreference: string | null;
  backgroundImportance: string | null;
  backgroundWhy: string | null;
  backgroundOpenToOther: string | null;
  familyCloseness: string | null;
  siblings: string | null;
  bringIntoMarriage: string | null;
  doDifferently: string | null;
  religiosity: string | null;
  religiosityDirection: string | null;
  partnerReligiosity: string | null;
  futureHomeReligious: string | null;
  synagogueYesNo: string | null;
  synagogueName: string | null;
  communityImportance: string | null;
  studied: string | null;
  work: string | null;
  workEnjoyment: string | null;
  ambition: string | null;
  partnerSuccessImportance: string | null;
  successMeaning: string | null;
  threeWords: string | null;
  selfDescription: string | null;
  hiddenSide: string | null;
  misunderstoodAs: string | null;
  hobbies: string | null;
  socialStyle: string | null;
  perfectSunday: string | null;
  loveLanguageReceive: string | null;
  loveLanguageGive: string | null;
  connectionDrivers: string | null;
  connectionFollowup: string | null;
  conflictStyle: string | null;
  disagreementNeeds: string | null;
  datingLesson: string | null;
  repeatsType: string | null;
  typeInCommon: string | null;
  typeGoodForThem: string | null;
  availabilityFeelings: string | null;
  availabilityCoachingNotes: string | null;
  sparkHistory: string | null;
  openWithoutFireworks: string | null;
  coreEmotionalNeeds: string | null;
  nonNegotiables: string | null;
  nonNegotiableChallenge: string | null;
  partnerQualities: string | null;
  qualityDefinitions: string | null;
  personalityAttracted: string | null;
  personalityNotAttracted: string | null;
  physicalAttracted: string | null;
  attractionMeaning: string | null;
  physicalNotAttracted: string | null;
  physicalMustOrPrefer: string | null;
  familyImportance: string | null;
  wantsChildren: string | null;
  raisingFamily: string | null;
  judaismForChildren: string | null;
  fiveYearLife: string | null;
  homeFeel: string | null;
  ordinaryDay: string | null;
  lookingForwardMost: string | null;
  bringToRelationship: string | null;
  difficultAboutDatingThem: string | null;
  growthEdge: string | null;
  unseenSide: string | null;
  bestFriendDescription: string | null;
  mirrorReflection: string | null;
  mirrorResonance: string | null;
  mindsetShift: string | null;
  doDifferentlyNext: string | null;
  readiness: string | null;
  partnerAgeRange: string | null;
  relocationFlexibility: string | null;
  hasChildren: string | null;
  openToPartnerChildren: string | null;
  smokingBoundaries: string | null;
  marriageTimeline: string | null;
  matchmakerEligibilityNotes: string | null;
  profileJson: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: string;
  personId: string;
  direction: string;
  body: string;
  twilioSid: string | null;
  createdAt: Date;
};

export type PersonUpdateInput = Partial<
  Omit<Person, "id" | "createdAt" | "updatedAt">
>;

export type ProfileUpdateInput = Partial<
  Omit<ProfileAnswers, "id" | "personId" | "createdAt" | "updatedAt">
>;

export type PersonWithProfile = Person & { profile: ProfileAnswers | null };
export type PersonWithDetails = PersonWithProfile & { messages: Message[] };

export type MatchmakerName = "Vanessa" | "Noga";
export type MatchSource = "algorithm" | "manual";
export type MatchStatus =
  | "draft"
  | "approved"
  | "proposed"
  | "dating"
  | "paused"
  | "closed"
  | "engaged"
  | "married";
export type GateStatus = "pass" | "needs_review" | "blocked";
export type FitBand = "exceptional" | "strong" | "promising" | "possible" | "low";

export type Matchmaker = {
  id: string;
  name: MatchmakerName;
  createdAt: Date;
};

export type EvidenceRef = {
  personId: string;
  field: string;
  quote: string;
  confidence: number;
};

export type MatchReason = {
  domain: string;
  label: string;
  detail: string;
  evidence: EvidenceRef[];
};

export type GateResult = {
  key: string;
  label: string;
  status: GateStatus;
  detail: string;
  evidence: EvidenceRef[];
};

export type DomainScore = {
  key: string;
  label: string;
  weight: number;
  fitAtoB: number;
  fitBtoA: number;
  reciprocal: number;
  confidence: number;
};

export type MatchAssessmentData = {
  eligibility: GateStatus;
  fitBand: FitBand;
  score: number;
  confidence: number;
  domains: DomainScore[];
  gates: GateResult[];
  strengths: MatchReason[];
  complements: MatchReason[];
  cautions: MatchReason[];
  unknowns: MatchReason[];
  directionAtoB: MatchReason[];
  directionBtoA: MatchReason[];
  whyNotHigher: string[];
  algorithmVersion: string;
  profileVersion: string;
};

export type StoredMatchAssessment = MatchAssessmentData & {
  id: string;
  personAId: string;
  personBId: string;
  profileHashA: string;
  profileHashB: string;
  createdAt: Date;
};

export type MatchRecord = {
  id: string;
  personAId: string;
  personBId: string;
  source: MatchSource;
  createdByMatchmakerId: string;
  assessmentId: string | null;
  status: MatchStatus;
  notes: string | null;
  overrideNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MatchReview = {
  id: string;
  assessmentId: string;
  matchmakerId: string;
  decision: "approve" | "reject" | "hold";
  reasonCodes: string[];
  notes: string | null;
  createdAt: Date;
};

export type MatchOutcome = {
  id: string;
  matchId: string;
  stage: string;
  personAResponse: string | null;
  personBResponse: string | null;
  reasonCode: string | null;
  notes: string | null;
  occurredAt: Date;
  createdAt: Date;
};

export type MatchExposure = {
  id: string;
  assessmentId: string;
  personId: string;
  location: string;
  createdAt: Date;
};

export type MatchWithDetails = MatchRecord & {
  personA: PersonWithProfile;
  personB: PersonWithProfile;
  matchmaker: Matchmaker;
  assessment: StoredMatchAssessment | null;
  outcomes: MatchOutcome[];
};
