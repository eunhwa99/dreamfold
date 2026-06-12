"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { readUserFacingError } from "@/lib/dreams/client-response";

export function GenerateImageAction({ dreamId, hasImage }: { dreamId: string; hasImage: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dreams/${dreamId}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(await readUserFacingError(response, "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요."));
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <div className="image-action-row">
        <button className="generate-btn generate-btn--secondary" type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? "꿈 장면을 그리고 있어요..." : hasImage ? "그림 다시 만들기" : "그림 만들기"}
        </button>
      </div>
      {error ? (
        <div className="status" data-tone="error">
          {error}
        </div>
      ) : null}
    </div>
  );
}
