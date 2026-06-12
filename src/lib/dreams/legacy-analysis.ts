import type { AnalysisResult } from "@/lib/dreams/types";

export function isLegacyMockAnalysis(analysis: AnalysisResult) {
  return analysis.source !== "openai";
}
