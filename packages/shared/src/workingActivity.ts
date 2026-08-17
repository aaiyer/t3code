export function formatLastActivityAge(
  activityAt: string | null | undefined,
  nowMs: number,
): string | null {
  if (activityAt == null) return null;
  const activityMs = Date.parse(activityAt);
  if (!Number.isFinite(activityMs)) return null;

  const seconds = Math.max(0, Math.floor((nowMs - activityMs) / 1_000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}
