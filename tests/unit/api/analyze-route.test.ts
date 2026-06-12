import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/mock-store");
});

describe("POST /api/dreams/[id]/analyze", () => {
  it("returns the saved analysis when live analysis succeeds", async () => {
    const analysis = {
      interpretation: "해석",
      emotionalSummary: "감정",
      currentStateReflection: "상태",
      dominantScene: "장면",
      sceneSummary: "요약",
      scenePrompt: "프롬프트",
      symbols: [],
      imagePath: "/generated-dreams/existing.png",
      imagePrompt: "existing prompt",
      imageGeneratedAt: "2026-06-12T00:00:00.000Z"
    };

    const runDreamAnalysis = vi.fn(async () => analysis);
    vi.doMock("@/lib/mock-store", () => ({
      runDreamAnalysis
    }));

    const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodTags: ["안도"] })
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(analysis);
    expect(runDreamAnalysis).toHaveBeenCalledWith("dream-1", ["안도"]);
  });

  it("returns 404 when the dream id does not exist", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      runDreamAnalysis: vi.fn(async () => null)
    }));

    const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
    const request = new Request("http://localhost/api/dreams/missing/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
        moodTags: ["불안"]
      })
    });

    const response = await POST(request as never, {
      params: Promise.resolve({ id: "missing" })
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "꿈 기록을 찾지 못했어요." });
  });

  it("returns a user-facing error message when analysis fails", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      runDreamAnalysis: vi.fn(async () => {
        throw new Error("OpenAI API 키가 설정되지 않았어요.");
      })
    }));

    const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/analyze", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "OpenAI API 키가 설정되지 않았어요." });
  });

  it("returns 400 for a prompt-fixable safety refusal", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      runDreamAnalysis: vi.fn(async () => {
        throw new Error("안전 정책 때문에 해몽을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요.");
      })
    }));

    const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/analyze", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "안전 정책 때문에 해몽을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요." });
  });

  it("returns 400 when the retry body contains invalid moodTags", async () => {
    const runDreamAnalysis = vi.fn(async () => ({
      interpretation: "해석",
      emotionalSummary: "감정",
      currentStateReflection: "상태",
      dominantScene: "장면",
      sceneSummary: "요약",
      scenePrompt: "프롬프트",
      symbols: []
    }));
    vi.doMock("@/lib/mock-store", () => ({
      runDreamAnalysis
    }));

    const { POST } = await import("@/app/api/dreams/[id]/analyze/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodTags: [1, 2] })
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "감정 태그를 다시 확인해 주세요." });
    expect(runDreamAnalysis).not.toHaveBeenCalled();
  });
});
