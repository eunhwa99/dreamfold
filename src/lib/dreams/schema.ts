import { z } from "zod";

const finalDreamTextSchema = z.string().min(20, "꿈 기록은 조금 더 자세히 적어주세요.").max(5000);

export const createDreamSchema = z.object({
  dreamText: z.string().optional().default(""),
  moodTags: z.array(z.string().min(1)).max(5).default([]),
  voiceTranscript: z.string().max(5000, "음성 전사본이 너무 길어요. 조금 줄여서 다시 시도해 주세요.").optional()
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
