import { describe, expect, it } from "vitest";

import { buildDreamReport } from "@/lib/dreams/report-builder";

describe("buildDreamReport", () => {
  it("counts recurring symbols and moods across entries", () => {
    const report = buildDreamReport([
      { moodTags: ["불안"], symbolTags: ["water", "school"], title: "닫히는 복도", createdAt: "2026.06.10" },
      { moodTags: ["안도"], symbolTags: ["water", "house"], title: "따뜻한 창문", createdAt: "2026.06.09" },
      { moodTags: ["불안"], symbolTags: ["school", "chase"], title: "늦은 시험", createdAt: "2026.06.08" }
    ]);

    expect(report.topSymbols[0]).toEqual({ name: "water", count: 2 });
    expect(report.topMoods[0]).toEqual({ name: "불안", count: 2 });
    expect(report.recentFocus.mood).toBe("불안");
    expect(report.recentFocus.symbolLabel).toBe("물");
    expect(report.comparison.summary).toContain("이전");
    expect(report.highlightMoments.length).toBeGreaterThan(0);
  });
});
