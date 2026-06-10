import { describe, expect, it } from "vitest";

import { createDreamSchema } from "@/lib/dreams/schema";

describe("createDreamSchema", () => {
  it("accepts dream text with optional mood tags", () => {
    const parsed = createDreamSchema.parse({
      dreamText: "어두운 바다 위에 집 한 채가 떠 있었고, 나는 그 창문을 오래 들여다보고 있었어요.",
      moodTags: ["여운"]
    });

    expect(parsed.moodTags).toEqual(["여운"]);
  });

  it("rejects dream text that is too short", () => {
    expect(() =>
      createDreamSchema.parse({
        dreamText: "짧아요",
        moodTags: []
      })
    ).toThrow();
  });
});
