import { describe, expect, it } from "vitest";

import { isLegacyMockAnalysis } from "@/lib/dreams/legacy-analysis";

describe("isLegacyMockAnalysis", () => {
  it("flags the previous local mock scenePrompt format", () => {
    expect(
      isLegacyMockAnalysis({
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "Dreamy editorial illustration, moonlit haze, soft surreal watercolor, 끝없이 이어지는 학교 복도",
        symbols: []
      })
    ).toBe(true);
  });

  it("keeps marked OpenAI analyses as non-legacy", () => {
    expect(
      isLegacyMockAnalysis({
        source: "openai",
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "Dreamy editorial illustration, endless school hallway, closing doors, soft surreal watercolor",
        symbols: []
      })
    ).toBe(false);
  });
});
