import type { OrchestrationThreadActivity } from "@t3tools/contracts";
import { describe, expect, it } from "@effect/vitest";

import { foldBackgroundProcesses } from "./backgroundProcesses.ts";

const activity = (
  kind: string,
  sequence: number,
  payload: Record<string, unknown>,
): OrchestrationThreadActivity => ({
  id: `event-${sequence}` as OrchestrationThreadActivity["id"],
  kind,
  tone: "tool",
  summary: "Tool",
  payload,
  turnId: null,
  sequence,
  createdAt: `2026-08-13T10:00:0${sequence}.000Z` as OrchestrationThreadActivity["createdAt"],
});

describe("foldBackgroundProcesses", () => {
  it("keeps incomplete command executions and removes completed ones", () => {
    const processes = foldBackgroundProcesses(
      [
        activity("tool.started", 1, {
          itemType: "command_execution",
          itemId: "process-1",
          detail: "vp run dev",
          commandExecution: { cwd: "/work", processId: "42", source: "agent" },
        }),
        activity("tool.started", 2, {
          itemType: "command_execution",
          itemId: "process-2",
          detail: "vp test run",
        }),
        activity("tool.completed", 3, {
          itemType: "command_execution",
          itemId: "process-2",
        }),
      ],
      { sessionLive: true },
    );

    expect(processes).toEqual([
      {
        id: "process-1",
        command: "vp run dev",
        cwd: "/work",
        processId: "42",
        source: "agent",
        startedAt: "2026-08-13T10:00:01.000Z",
        updatedAt: "2026-08-13T10:00:01.000Z",
      },
    ]);
  });

  it("ignores unidentifiable commands and clears stale rows with the session", () => {
    const activities = [
      activity("tool.started", 1, { itemType: "command_execution", detail: "sleep 60" }),
    ];
    expect(foldBackgroundProcesses(activities, { sessionLive: true })).toEqual([]);
    expect(
      foldBackgroundProcesses(
        [
          activity("tool.started", 2, {
            itemType: "command_execution",
            itemId: "process-1",
            detail: "sleep 60",
          }),
        ],
        { sessionLive: false },
      ),
    ).toEqual([]);
  });
});
