import {
  ThreadGoal,
  type OrchestrationThreadActivity,
  type ThreadGoal as ThreadGoalValue,
} from "@t3tools/contracts";
import * as Schema from "effect/Schema";

const isThreadGoal = Schema.is(ThreadGoal);

/** Derive the latest provider-confirmed goal from durable thread activities. */
export function deriveThreadGoal(
  activities: ReadonlyArray<OrchestrationThreadActivity>,
): ThreadGoalValue | null {
  for (let index = activities.length - 1; index >= 0; index -= 1) {
    const activity = activities[index];
    if (activity?.kind === "goal.cleared") {
      return null;
    }
    if (activity?.kind === "goal.updated") {
      const goal =
        typeof activity.payload === "object" &&
        activity.payload !== null &&
        "goal" in activity.payload
          ? activity.payload.goal
          : undefined;
      if (isThreadGoal(goal)) {
        return goal;
      }
    }
  }
  return null;
}

/** Prefer persisted goal state, falling back only for older server snapshots. */
export function resolveThreadGoal(
  goal: ThreadGoalValue | null | undefined,
  activities: ReadonlyArray<OrchestrationThreadActivity>,
): ThreadGoalValue | null {
  return goal === undefined ? deriveThreadGoal(activities) : goal;
}
