import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/mock-store");
});

describe("GET /api/report", () => {
  it("returns the report payload on success", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      getReport: vi.fn(() => ({ insight: "요약" }))
    }));

    const { GET } = await import("@/app/api/report/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ insight: "요약" });
  });

  it("returns a Korean storage error when report loading fails", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      getReport: vi.fn(() => {
        throw new Error("꿈 데이터를 읽지 못했어요. 저장 파일을 확인해 주세요.");
      })
    }));

    const { GET } = await import("@/app/api/report/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "꿈 데이터를 읽지 못했어요. 저장 파일을 확인해 주세요." });
  });
});
