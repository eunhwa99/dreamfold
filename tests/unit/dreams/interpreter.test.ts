import { describe, expect, it } from "vitest";

import { extractInterpretation } from "@/lib/dreams/interpreter";

describe("extractInterpretation", () => {
  it("returns structured interpretation fields", () => {
    const result = extractInterpretation("학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.", ["불안"]);

    expect(result.currentStateReflection).toBeTruthy();
    expect(result.scenePrompt).toContain("Dreamy editorial illustration");
    expect(result.symbols.length).toBeGreaterThan(0);
  });
});
