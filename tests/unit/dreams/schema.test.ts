import { describe, expect, it } from "vitest";

import { createDreamSchema, resolveCreateDreamInput } from "@/lib/dreams/schema";

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
      resolveCreateDreamInput(
        createDreamSchema.parse({
          dreamText: "짧아요",
          moodTags: []
        })
      )
    ).toThrow();
  });

  it("accepts a short raw dreamText when voice transcript is long enough", () => {
    const parsed = createDreamSchema.parse({
        dreamText: "짧아요",
        voiceTranscript: "어두운 극장 천장 아래에서 별빛이 천천히 떨어지는 걸 보고 있었어요.",
        moodTags: ["여운"]
      });

    expect(parsed.dreamText).toBe("짧아요");
  });

  it("accepts transcript-only input at the raw schema level", () => {
    const parsed = createDreamSchema.parse({
      voiceTranscript: "어두운 복도 끝에서 별빛이 흔들리는 문을 바라보고 있었어요.",
      moodTags: []
    });

    expect(parsed.dreamText).toBe("");
  });

  it("accepts a long voice transcript as the final dream text source", () => {
    const resolved = resolveCreateDreamInput({
      dreamText: "짧아요",
      voiceTranscript: "어두운 극장 천장 아래에서 별빛이 천천히 떨어지는 걸 보고 있었어요.",
      moodTags: ["여운"]
    });

    expect(resolved).toEqual({
      dreamText: "어두운 극장 천장 아래에서 별빛이 천천히 떨어지는 걸 보고 있었어요.",
      moodTags: ["여운"]
    });
  });

  it("prefers a valid dreamText over a short transcript override", () => {
    const resolved = resolveCreateDreamInput({
      dreamText: "사용자가 직접 다듬은 최종 꿈 기록은 이 텍스트예요. 충분히 길고 유효해요.",
      voiceTranscript: "짧다",
      moodTags: ["안도"]
    });

    expect(resolved).toEqual({
      dreamText: "사용자가 직접 다듬은 최종 꿈 기록은 이 텍스트예요. 충분히 길고 유효해요.",
      moodTags: ["안도"]
    });
  });

  it("rejects an oversized transcript even when dreamText is already valid", () => {
    expect(() =>
      createDreamSchema.parse({
        dreamText: "사용자가 편집한 최종 꿈 기록은 충분히 길고 그대로 저장되어야 해요.",
        voiceTranscript: "x".repeat(6001),
        moodTags: ["여운"]
      })
    ).toThrow("음성 전사본이 너무 길어요. 조금 줄여서 다시 시도해 주세요.");
  });

  it("rejects when both the raw dream text and voice transcript are too short", () => {
    expect(() =>
      resolveCreateDreamInput(
        createDreamSchema.parse({
          dreamText: "짧아요",
          voiceTranscript: "짧다",
          moodTags: []
        })
      )
    ).toThrow();
  });
});
