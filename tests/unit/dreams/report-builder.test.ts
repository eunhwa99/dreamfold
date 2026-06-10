import { describe, expect, it } from "vitest";

import { buildDreamReport } from "@/lib/dreams/report-builder";

describe("buildDreamReport", () => {
  it("counts recurring symbols and moods across entries", () => {
    const report = buildDreamReport([
      { moodTags: ["불안"], symbolTags: ["water", "school"] },
      { moodTags: ["불안"], symbolTags: ["water", "stairs"] }
    ]);

    expect(report.topSymbols[0]).toEqual({ name: "water", count: 2 });
    expect(report.topMoods[0]).toEqual({ name: "불안", count: 2 });
  });
});
