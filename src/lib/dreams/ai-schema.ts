import { z } from "zod";

export const symbolMeaningSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  meaning: z.string().min(1)
});

export const analysisResponseSchema = z.object({
  interpretation: z.string().min(1),
  emotionalSummary: z.string().min(1),
  currentStateReflection: z.string().min(1),
  dominantScene: z.string().min(1),
  sceneSummary: z.string().min(1),
  scenePrompt: z.string().min(1),
  symbols: z.array(symbolMeaningSchema)
});

export type AnalysisResponsePayload = z.infer<typeof analysisResponseSchema>;

export const analysisResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    interpretation: { type: "string" },
    emotionalSummary: { type: "string" },
    currentStateReflection: { type: "string" },
    dominantScene: { type: "string" },
    sceneSummary: { type: "string" },
    scenePrompt: { type: "string" },
    symbols: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          label: { type: "string" },
          meaning: { type: "string" }
        },
        required: ["name", "label", "meaning"]
      }
    }
  },
  required: [
    "interpretation",
    "emotionalSummary",
    "currentStateReflection",
    "dominantScene",
    "sceneSummary",
    "scenePrompt",
    "symbols"
  ]
} as const;
