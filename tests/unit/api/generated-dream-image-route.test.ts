import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock("@/lib/dreams/image-store");
});

describe("GET /generated-dreams/[filename]", () => {
  it("serves a stored generated image", async () => {
    vi.doMock("@/lib/dreams/image-store", () => ({
      readGeneratedDreamImage: vi.fn(() => Buffer.from("png-bytes"))
    }));

    const { GET } = await import("@/app/generated-dreams/[filename]/route");
    const response = await GET(new Request("http://localhost/generated-dreams/dream-1-123.png"), {
      params: Promise.resolve({ filename: "dream-1-123.png" })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    await expect(response.text()).resolves.toBe("png-bytes");
  });

  it("returns 404 when the generated image does not exist", async () => {
    vi.doMock("@/lib/dreams/image-store", () => ({
      readGeneratedDreamImage: vi.fn(() => null)
    }));

    const { GET } = await import("@/app/generated-dreams/[filename]/route");
    const response = await GET(new Request("http://localhost/generated-dreams/missing.png"), {
      params: Promise.resolve({ filename: "missing.png" })
    });

    expect(response.status).toBe(404);
  });

  it("returns a Korean 500 when reading the image fails", async () => {
    vi.doMock("@/lib/dreams/image-store", () => ({
      readGeneratedDreamImage: vi.fn(() => {
        throw new Error("저장된 꿈 이미지를 읽지 못했어요. 저장 경로를 확인해 주세요.");
      })
    }));

    const { GET } = await import("@/app/generated-dreams/[filename]/route");
    const response = await GET(new Request("http://localhost/generated-dreams/broken.png"), {
      params: Promise.resolve({ filename: "broken.png" })
    });

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("저장된 꿈 이미지를 읽지 못했어요. 저장 경로를 확인해 주세요.");
  });
});
