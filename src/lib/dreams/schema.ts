import { z } from "zod";

export const createDreamSchema = z.object({
  dreamText: z.string().min(20, "꿈 기록은 조금 더 자세히 적어주세요.").max(5000),
  moodTags: z.array(z.string().min(1)).max(5).default([]),
  voiceTranscript: z.string().max(5000).optional()
});

export type CreateDreamInput = z.infer<typeof createDreamSchema>;
