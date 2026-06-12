import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_TEXT_MODEL;
  delete process.env.OPENAI_IMAGE_MODEL;
  vi.unstubAllGlobals();
});

describe("openai dream client", () => {
  it("parses a structured interpretation payload into AnalysisResult", async () => {
    const { parseAnalysisPayload } = await import("@/lib/dreams/openai-client");

    const payload = {
      interpretation: "이 꿈은 물가의 장면을 통해 감정의 흐름을 비추고 있어요.",
      emotionalSummary: "잔잔하지만 깊은 감정의 파동이 느껴져요.",
      currentStateReflection: "정리되지 않은 마음이 조용히 떠오르는 시기일 수 있어요.",
      dominantScene: "달빛 아래 물가에 서 있던 장면",
      sceneSummary: "\"달빛 아래 물가에 서 있던 장면\"이 오늘 꿈의 중심에 남아 있어요.",
      scenePrompt: "Dreamy editorial illustration, moonlit lakeshore, soft surreal watercolor",
      symbols: [{ name: "water", label: "물", meaning: "감정의 흐름" }]
    };

    expect(parseAnalysisPayload(payload)).toEqual(payload);
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    const { generateDreamAnalysis } = await import("@/lib/dreams/openai-client");

    await expect(
      generateDreamAnalysis({
        dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
        moodTags: ["불안"]
      })
    ).rejects.toThrow("OpenAI API 키가 설정되지 않았어요.");
  });

  it("requests a live interpretation and parses JSON output text", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    interpretation: "해석",
                    emotionalSummary: "감정",
                    currentStateReflection: "상태",
                    dominantScene: "장면",
                    sceneSummary: "요약",
                    scenePrompt: "프롬프트",
                    symbols: [{ name: "gateway", label: "문", meaning: "감정" }]
                  })
                }
              ]
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamAnalysis } = await import("@/lib/dreams/openai-client");
    const result = await generateDreamAnalysis({
      dreamText: "달빛 아래 호수 가장자리를 걷다가 물 위로 별빛이 흘러내리는 꿈을 꿨어요.",
      moodTags: ["여운"]
    });

    expect(result.interpretation).toBe("해석");
    expect(result.symbols[0]?.name).toBe("door");
    expect(result.source).toBe("openai");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("maps structured-output refusals to a Korean safety message", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          output: [
            {
              type: "message",
              refusal: "I can’t help with that request."
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamAnalysis } = await import("@/lib/dreams/openai-client");

    await expect(
      generateDreamAnalysis({
        dreamText: "불길을 이용해 누군가를 다치게 하는 꿈을 구체적으로 계획하는 장면이었어요.",
        moodTags: ["불안"]
      })
    ).rejects.toThrow("안전 정책 때문에 해몽을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요.");
  });

  it("requests a dream image and returns base64 output", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: [{ b64_json: "aGVsbG8=" }]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamSceneImage } = await import("@/lib/dreams/openai-client");
    const result = await generateDreamSceneImage("moonlit watercolor dream scene");

    expect(result.imageBase64).toBe("aGVsbG8=");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/images/generations",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: "moonlit watercolor dream scene",
          size: "1024x1024",
          quality: "medium"
        })
      })
    );
    expect(timeoutSpy).toHaveBeenCalledWith(120000);
  });

  it("maps invalid credentials to a user-facing auth error", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: { code: "invalid_api_key" }
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamAnalysis } = await import("@/lib/dreams/openai-client");

    await expect(
      generateDreamAnalysis({
        dreamText: "달빛이 내려앉은 긴 복도를 지나 바다 냄새가 스며드는 문 앞에 섰어요.",
        moodTags: []
      })
    ).rejects.toThrow("OpenAI 인증에 실패했어요. API 키를 확인해 주세요.");
  });

  it("maps organization verification failures to a Korean guidance message", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            code: "organization_verification_required",
            message: "Organization verification required to use this model."
          }
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamSceneImage } = await import("@/lib/dreams/openai-client");

    await expect(generateDreamSceneImage("moonlit watercolor dream scene")).rejects.toThrow(
      "OpenAI 조직 인증이나 프로젝트 권한이 필요해요. 플랫폼 설정을 확인해 주세요."
    );
  });

  it("maps moderation_blocked API payloads to a Korean safety message before generic 403 handling", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            code: "moderation_blocked",
            message: "Blocked by policy."
          }
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamSceneImage } = await import("@/lib/dreams/openai-client");

    await expect(generateDreamSceneImage("violent prompt")).rejects.toThrow(
      "안전 정책 때문에 그림을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요."
    );
  });

  it("maps image_generation_user_error payloads to a prompt-fixable safety message", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: {
            type: "image_generation_user_error",
            message: "Prompt rejected."
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamSceneImage } = await import("@/lib/dreams/openai-client");

    await expect(generateDreamSceneImage("violent prompt")).rejects.toThrow(
      "안전 정책 때문에 그림을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요."
    );
  });

  it("maps request timeouts to a user-facing retry message", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const fetchMock = vi.fn(async () => {
      const error = new Error("timed out");
      error.name = "TimeoutError";
      throw error;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateDreamAnalysis } = await import("@/lib/dreams/openai-client");

    await expect(
      generateDreamAnalysis({
        dreamText: "달빛이 비치는 복도 끝에서 천천히 닫히는 문을 바라보고 있었어요.",
        moodTags: ["불안"]
      })
    ).rejects.toThrow("해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    expect(timeoutSpy).toHaveBeenCalledWith(30000);
  });
});
