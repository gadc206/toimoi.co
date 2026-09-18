export function nudgeMessage(firstName: string | null) {
  return `Hi${firstName ? ` ${firstName}` : ""} 😊 Just gently checking in — whenever you're ready, reply CONTINUE and we can pick up our conversation.`;
}

export function nudgedWithinWeek(lastNudgedAt: Date | null) {
  if (!lastNudgedAt) return false;
  return Date.now() - lastNudgedAt.getTime() < 7 * 24 * 60 * 60 * 1000;
}
