import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/mock-store");
});

describe("POST /api/dreams/[id]/image", () => {
  it("returns 409 when image generation is requested before analysis exists", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => ({ status: "missing-analysis" as const }))
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toEqual({ error: "먼저 해몽을 생성해 주세요." });
  });

  it("returns 404 when the dream id does not exist", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => ({ status: "missing-dream" as const }))
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/missing/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "missing" })
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "꿈 기록을 찾지 못했어요." });
  });

  it("returns image metadata when generation succeeds", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => ({
        status: "ok" as const,
        analysis: {
          interpretation: "해석",
          emotionalSummary: "감정",
          currentStateReflection: "상태",
          dominantScene: "장면",
          sceneSummary: "요약",
          scenePrompt: "프롬프트",
          symbols: [],
          imagePath: "/generated-dreams/dream-1.png",
          imagePrompt: "watercolor moonlit scene",
          imageGeneratedAt: "2026-06-12T00:00:00.000Z"
        }
      }))
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.imagePath).toBe("/generated-dreams/dream-1.png");
  });

  it("returns 409 when a legacy mock analysis must be refreshed first", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => ({ status: "legacy-analysis" as const }))
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toEqual({ error: "예전 해몽이라 먼저 AI 해몽을 새로 불러와야 해요." });
  });

  it("returns a user-facing error when image generation fails", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => {
        throw new Error("이미지 생성에 실패했어요.");
      })
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "이미지 생성에 실패했어요." });
  });

  it("returns 400 for a prompt-fixable image safety refusal", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      generateDreamImage: vi.fn(async () => {
        throw new Error("안전 정책 때문에 그림을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요.");
      })
    }));

    const { POST } = await import("@/app/api/dreams/[id]/image/route");
    const response = await POST(new Request("http://localhost/api/dreams/dream-1/image", {
      method: "POST"
    }) as never, {
      params: Promise.resolve({ id: "dream-1" })
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "안전 정책 때문에 그림을 생성할 수 없었어요. 표현을 조금 바꿔 다시 시도해 주세요." });
  });
});
