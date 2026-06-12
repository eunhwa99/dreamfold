"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { readUserFacingError } from "@/lib/dreams/client-response";

type Props = {
  dreamId: string;
  message?: string;
  buttonLabel?: string;
};

export function AnalyzeRetry({
  dreamId,
  message = "아직 해몽이 생성되지 않았어요.",
  buttonLabel = "해몽 다시 시도하기"
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dreams/${dreamId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(await readUserFacingError(response, "해몽을 다시 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "해몽을 다시 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <p>{message}</p>
      <div className="inline-actions">
        <button className="generate-btn generate-btn--secondary" type="button" onClick={handleRetry} disabled={loading}>
          {loading ? "해몽을 다시 불러오는 중..." : buttonLabel}
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
