import { describe, expect, it } from "vitest";

import { getHomePageState } from "@/lib/home-state";

describe("getHomePageState", () => {
  it("returns an empty filtered state when the selected mood has no matching dreams", () => {
    const state = getHomePageState({
      mood: "설렘",
      dreams: [
        {
          id: "dream-1",
          title: "끝없이 이어지는 복도",
          dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
          moodTags: ["불안"],
          symbolTags: ["school"],
          createdAt: "2026.06.10"
        }
      ]
    });

    expect(state.type).toBe("empty-filter");
    expect(state.filteredDreams).toEqual([]);
  });
});
