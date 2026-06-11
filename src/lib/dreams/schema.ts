import { z } from "zod";

const finalDreamTextSchema = z.string().min(20, "꿈 기록은 조금 더 자세히 적어주세요.").max(5000);

export const createDreamSchema = z.object({
  dreamText: z.string().optional().default(""),
  moodTags: z.array(z.string().min(1)).max(5).default([]),
  voiceTranscript: z.string().optional()
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;

export function resolveCreateDreamInput(input: CreateDreamInput) {
  const normalizedDreamText = input.dreamText.trim();
  const normalizedVoiceTranscript = input.voiceTranscript?.trim();
  const dreamText =
    normalizedDreamText.length >= 20 ? normalizedDreamText : normalizedVoiceTranscript && normalizedVoiceTranscript.length > 0 ? normalizedVoiceTranscript : normalizedDreamText;

  return createDreamSchema.omit({ voiceTranscript: true }).parse({
    dreamText: finalDreamTextSchema.parse(dreamText),
    moodTags: input.moodTags
  });
}
