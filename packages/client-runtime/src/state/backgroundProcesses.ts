import type { OrchestrationThreadActivity } from "@t3tools/contracts";

export interface RuntimeBackgroundProcess {
  readonly id: string;
  readonly command: string;
  readonly cwd: string | null;
  readonly processId: string | null;
  readonly source: string | null;
  readonly startedAt: string;
  readonly updatedAt: string;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function processMetadata(payload: Record<string, unknown>): Record<string, unknown> | null {
  return record(payload.commandExecution);
}

/**
 * Folds canonical command-execution lifecycle activities into the processes
 * that are still owned by the provider session. Completed items remove their
 * matching start; an inactive session cannot own a live process.
 */
export function foldBackgroundProcesses(
  activities: ReadonlyArray<OrchestrationThreadActivity>,
  options: { readonly sessionLive: boolean },
): ReadonlyArray<RuntimeBackgroundProcess> {
  if (!options.sessionLive) return [];

  const processes = new Map<string, RuntimeBackgroundProcess>();
  const ordered = [...activities].sort((left, right) => {
    const sequenceDelta = (left.sequence ?? 0) - (right.sequence ?? 0);
    return sequenceDelta !== 0 ? sequenceDelta : left.createdAt.localeCompare(right.createdAt);
  });

  for (const activity of ordered) {
    if (
      activity.kind !== "tool.started" &&
      activity.kind !== "tool.updated" &&
      activity.kind !== "tool.completed"
    ) {
      continue;
    }
    const payload = record(activity.payload);
    if (!payload || payload.itemType !== "command_execution") continue;
    const itemId = text(payload.itemId);
    if (!itemId) continue;

    if (activity.kind === "tool.completed") {
      processes.delete(itemId);
      continue;
    }

    const existing = processes.get(itemId);
    const metadata = processMetadata(payload);
    const command =
      text(metadata?.command) ?? text(payload.detail) ?? existing?.command ?? "Command";
    processes.set(itemId, {
      id: itemId,
      command,
      cwd: text(metadata?.cwd) ?? existing?.cwd ?? null,
      processId: text(metadata?.processId) ?? existing?.processId ?? null,
      source: text(metadata?.source) ?? existing?.source ?? null,
      startedAt: existing?.startedAt ?? activity.createdAt,
      updatedAt: activity.createdAt,
    });
  }

  return [...processes.values()].sort((left, right) =>
    left.startedAt.localeCompare(right.startedAt),
  );
}
