"use client";

import Link from "next/link";
import { useState } from "react";

import { AnalysisResultCard } from "@/components/record/analysis-result";
import type { AnalysisResult } from "@/lib/dreams/types";

const moodOptions = ["불안", "여운", "안도", "설렘", "그리움"];

export function DreamForm() {
  const [dreamText, setDreamText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedDreamId, setSavedDreamId] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedDreamId(null);

    try {
      const createResponse = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText,
          moodTags: selectedMood ? [selectedMood] : []
        })
      });

      if (!createResponse.ok) {
        const payload = (await createResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "create failed");
      }

      const { dreamId } = (await createResponse.json()) as { dreamId: string };
      setSavedDreamId(dreamId);

      const analyzeResponse = await fetch(`/api/dreams/${dreamId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText,
          moodTags: selectedMood ? [selectedMood] : []
        })
      });

      if (!analyzeResponse.ok) {
        throw new Error("해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }

      const analysisPayload = (await analyzeResponse.json()) as AnalysisResult;
      setResult(analysisPayload);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <form className="form-card" data-testid="dream-form" onSubmit={onSubmit}>
        <div>
          <label className="label" htmlFor="dream-text">오늘 가장 선명한 장면</label>
          <textarea
            id="dream-text"
            className="s2-textarea"
            placeholder="사라지기 전에, 기억나는 장면을 적어보세요."
            value={dreamText}
            onChange={(event) => setDreamText(event.target.value)}
          />
        </div>

        <div>
          <p className="tag-section-label">감정 태그</p>
          <div className="tag-row">
            {moodOptions.map((mood) => {
              const selected = selectedMood === mood;
              return (
                <button
                  key={mood}
                  className={`tag${selected ? " sel" : ""}`}
                  type="button"
                  onClick={() => setSelectedMood(selected ? null : mood)}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        <div className="inline-actions inline-actions--full">
          <button className="generate-btn" type="submit" disabled={loading}>
            {loading ? "저장 후 리딩을 준비하는 중..." : "저장하고 AI 리딩 보기"}
          </button>
        </div>
        {error ? (
          <div className="status" data-tone="error">
            {error}
          </div>
        ) : null}
        {savedDreamId ? (
          <div className="status" data-tone="success">
            보관함에 저장되었어요. <Link href={`/dreams/${savedDreamId}`}>상세 보기</Link>
          </div>
        ) : null}
      </form>

      {loading ? <div className="message">무의식의 장면을 읽고 있어요. 잠시만 기다려 주세요.</div> : null}
      {result ? <AnalysisResultCard result={result} /> : null}
    </div>
  );
}
