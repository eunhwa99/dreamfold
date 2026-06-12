import { describe, expect, it } from "vitest";

import { readUserFacingError } from "@/lib/dreams/client-response";

describe("readUserFacingError", () => {
  it("returns the Korean payload message when available", async () => {
    const response = new Response(JSON.stringify({ error: "해몽을 불러오지 못했어요." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });

    await expect(readUserFacingError(response, "기본 메시지")).resolves.toBe("해몽을 불러오지 못했어요.");
  });

  it("falls back when the response body is not JSON", async () => {
    const response = new Response("<html>server error</html>", {
      status: 500,
      headers: { "Content-Type": "text/html" }
    });

    await expect(readUserFacingError(response, "기본 메시지")).resolves.toBe("기본 메시지");
  });
});
