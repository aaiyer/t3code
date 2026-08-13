import type { EnvironmentId } from "@t3tools/contracts";

import { useEnvironmentQuery } from "../state/query";
import { serverEnvironment } from "../state/server";

export function useSystemVitals(environmentId: EnvironmentId | null) {
  return useEnvironmentQuery(
    environmentId === null ? null : serverEnvironment.systemVitals({ environmentId, input: {} }),
  );
}
