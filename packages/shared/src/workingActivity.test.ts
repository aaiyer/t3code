import { describe, expect, it } from "vite-plus/test";

import { formatLastActivityAge } from "./workingActivity.ts";

const NOW = Date.parse("2026-08-17T03:00:00.000Z");

describe("formatLastActivityAge", () => {
  it("formats a compact age from seconds through days", () => {
    expect(formatLastActivityAge("2026-08-17T02:59:58.000Z", NOW)).toBe("just now");
    expect(formatLastActivityAge("2026-08-17T02:59:48.000Z", NOW)).toBe("12s ago");
    expect(formatLastActivityAge("2026-08-17T02:58:00.000Z", NOW)).toBe("2m ago");
    expect(formatLastActivityAge("2026-08-17T01:00:00.000Z", NOW)).toBe("2h ago");
    expect(formatLastActivityAge("2026-08-15T03:00:00.000Z", NOW)).toBe("2d ago");
  });

  it("rejects missing and malformed timestamps", () => {
    expect(formatLastActivityAge(null, NOW)).toBeNull();
    expect(formatLastActivityAge("not-a-date", NOW)).toBeNull();
  });
});
