"use client";

import Link from "next/link";
import { useState } from "react";

import { AnalysisResultCard } from "@/components/record/analysis-result";
import { readUserFacingError } from "@/lib/dreams/client-response";
import type { AnalysisResult } from "@/lib/dreams/types";

const moodOptions = ["불안", "여운", "안도", "설렘", "그리움"];

export function DreamForm() {
  const [dreamText, setDreamText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedDreamId, setSavedDreamId] = useState<string | null>(null);
  const [savedWithoutAnalysis, setSavedWithoutAnalysis] = useState(false);
  const [retryDraftKey, setRetryDraftKey] = useState<string | null>(null);

  function buildDraftKey() {
    return dreamText.trim();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (imageLoading) {
      return;
    }

    const draftKey = buildDraftKey();
    setLoading(true);
    setError(null);
    setImageError(null);
    setResult(null);

    let createdDreamId: string | null = null;
    let targetDreamId: string | null = null;

    try {
      let dreamId = savedWithoutAnalysis && savedDreamId && retryDraftKey === draftKey ? savedDreamId : null;

      if (!dreamId) {
        setSavedDreamId(null);
        setSavedWithoutAnalysis(false);

        const createResponse = await fetch("/api/dreams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dreamText,
            moodTags: selectedMood ? [selectedMood] : []
          })
        });

        if (!createResponse.ok) {
          throw new Error(await readUserFacingError(createResponse, "꿈 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
        }

        const createdPayload = (await createResponse.json()) as { dreamId: string };
        dreamId = createdPayload.dreamId;
        createdDreamId = dreamId;
        setSavedDreamId(dreamId);
      }

      targetDreamId = dreamId;

      const analyzeResponse = await fetch(`/api/dreams/${dreamId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText,
          moodTags: selectedMood ? [selectedMood] : []
        })
      });

      if (!analyzeResponse.ok) {
        throw new Error(await readUserFacingError(analyzeResponse, "해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      }

      const analysisPayload = (await analyzeResponse.json()) as AnalysisResult;
      setSavedWithoutAnalysis(false);
      setRetryDraftKey(null);
      setResult(analysisPayload);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
      setSavedWithoutAnalysis(Boolean(targetDreamId));
      setRetryDraftKey(targetDreamId ? draftKey : null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateImage() {
    if (!savedDreamId || !result) {
      return;
    }

    setImageLoading(true);
    setImageError(null);

    try {
      const response = await fetch(`/api/dreams/${savedDreamId}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(await readUserFacingError(response, "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요."));
      }

      const analysisPayload = (await response.json()) as AnalysisResult;
      setResult(analysisPayload);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.message
          ? caughtError.message
          : "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.";
      setImageError(message);
    } finally {
      setImageLoading(false);
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
          <button className="generate-btn" type="submit" disabled={loading || imageLoading}>
            {loading ? "저장 후 리딩을 준비하는 중..." : "저장하고 AI 리딩 보기"}
          </button>
        </div>
        {error ? (
          <div className="status" data-tone="error">
            {error}
          </div>
        ) : null}
        {savedDreamId && savedWithoutAnalysis ? (
          <div className="status" data-tone="success">
            꿈 기록은 저장되었어요. <Link href={`/dreams/${savedDreamId}`}>상세 페이지에서 해몽을 다시 시도할 수 있어요.</Link>
          </div>
        ) : null}
        {savedDreamId && !savedWithoutAnalysis ? (
          <div className="status" data-tone="success">
            보관함에 저장되었어요. <Link href={`/dreams/${savedDreamId}`}>상세 보기</Link>
          </div>
        ) : null}
      </form>

      {loading ? <div className="message">무의식의 장면을 읽고 있어요. 잠시만 기다려 주세요.</div> : null}
      {result ? (
        <AnalysisResultCard
          result={result}
          imageLoading={imageLoading}
          imageError={imageError}
          onGenerateImage={handleGenerateImage}
        />
      ) : null}
    </div>
  );
}
