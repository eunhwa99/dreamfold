import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/mock-store");
});

describe("POST /api/dreams", () => {
  it("accepts a valid voice transcript even when dreamText itself is short", async () => {
    const createDream = vi.fn(() => ({ id: "dream-1" }));
    vi.doMock("@/lib/mock-store", () => ({
      createDream
    }));

    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamText: "짧다",
        voiceTranscript: "나는 오래된 극장 천장에 매달린 별빛을 올려다보고 있었어요.",
        moodTags: ["여운"]
      })
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ dreamId: "dream-1" });
    expect(createDream).toHaveBeenCalledWith({
      dreamText: "나는 오래된 극장 천장에 매달린 별빛을 올려다보고 있었어요.",
      moodTags: ["여운"]
    });
  });

  it("accepts a valid voice transcript when dreamText is omitted", async () => {
    const createDream = vi.fn(() => ({ id: "dream-2" }));
    vi.doMock("@/lib/mock-store", () => ({
      createDream
    }));

    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voiceTranscript: "달빛이 스며드는 유리 온실 안에서 천천히 걷고 있었어요.",
        moodTags: []
      })
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ dreamId: "dream-2" });
    expect(createDream).toHaveBeenCalledWith({
      dreamText: "달빛이 스며드는 유리 온실 안에서 천천히 걷고 있었어요.",
      moodTags: []
    });
  });

  it("prefers a valid dreamText even when voiceTranscript is short", async () => {
    const createDream = vi.fn(() => ({ id: "dream-3" }));
    vi.doMock("@/lib/mock-store", () => ({
      createDream
    }));

    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamText: "이건 충분히 긴 본문입니다. 하지만 실제 저장 후보는 음성 전사본이에요.",
        voiceTranscript: "짧다",
        moodTags: ["불안"]
      })
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({ dreamId: "dream-3" });
    expect(createDream).toHaveBeenCalledWith({
      dreamText: "이건 충분히 긴 본문입니다. 하지만 실제 저장 후보는 음성 전사본이에요.",
      moodTags: ["불안"]
    });
  });

  it("returns a storage error message when persistence fails", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      createDream: vi.fn(() => {
        throw new Error("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
      })
    }));

    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamText: "충분히 길지만 저장소가 실패하는 꿈 기록입니다.",
        moodTags: []
      })
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요." });
  });

  it("returns 400 when the request body is malformed JSON", async () => {
    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad json"
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "꿈 기록은 조금 더 자세히 적어주세요." });
  });

  it("returns the transcript overflow message when voiceTranscript is too long", async () => {
    const { POST } = await import("@/app/api/dreams/route");
    const request = new Request("http://localhost/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dreamText: "이건 충분히 긴 본문이라서 기본 길이 검사를 통과해야 해요.",
        voiceTranscript: "x".repeat(6001),
        moodTags: []
      })
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "음성 전사본이 너무 길어요. 조금 줄여서 다시 시도해 주세요." });
  });
});
