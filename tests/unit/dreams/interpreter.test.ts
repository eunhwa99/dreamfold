import { describe, expect, it } from "vitest";

import { extractInterpretation } from "@/lib/dreams/interpreter";

describe("extractInterpretation", () => {
  it("returns localized interpretation fields for the reader-facing UI", () => {
    const result = extractInterpretation("학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.", ["불안"]);

    expect(result.currentStateReflection).toBeTruthy();
    expect(result.sceneSummary).toContain("학교 복도");
    expect(result.sceneSummary).not.toContain("Dreamy editorial illustration");
    expect(result.symbols.length).toBeGreaterThan(0);
    expect(result.symbols[0]?.label).toBeTruthy();
    expect(result.interpretation).not.toContain("school");
  });
});
