import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/mock-store");
});

describe("POST /api/dreams/[id]/analyze", () => {
  it("returns 404 when the dream id does not exist", async () => {
    vi.doMock("@/lib/mock-store", () => ({
      analyzeDream: vi.fn(() => null)
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
    expect(payload).toEqual({ error: "dream not found" });
  });
});
