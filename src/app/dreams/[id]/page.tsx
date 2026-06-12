import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { AnalyzeRetry } from "@/components/dream-detail/analyze-retry";
import { GenerateImageAction } from "@/components/dream-detail/generate-image-action";
import { GeneratedImagePreview } from "@/components/dream-detail/generated-image-preview";
import { isLegacyMockAnalysis } from "@/lib/dreams/legacy-analysis";
import { isDreamStoreError } from "@/lib/dreams/store-errors";
import { getDream } from "@/lib/mock-store";

export default async function DreamDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let dream;

  try {
    dream = getDream(id);
  } catch (error) {
    if (!isDreamStoreError(error)) {
      throw error;
    }

    return (
      <AppShell>
        <article className="screen-screen dream-detail" data-testid="dream-detail">
          <div className="status" data-tone="error">
            {error.message}
          </div>
        </article>
      </AppShell>
    );
  }

  if (!dream) {
    notFound();
  }

  const hasLegacyMockAnalysis = dream.analysis ? isLegacyMockAnalysis(dream.analysis) : false;

  return (
    <AppShell>
      <article className="screen-screen dream-detail" data-testid="dream-detail">
        <p className="section-kicker">Dream detail</p>
        <h2 className="report-title">{dream.title}</h2>
        <p className="report-copy">{dream.dreamText}</p>
        {dream.analysis ? (
          <div className="stack">
            {hasLegacyMockAnalysis ? (
              <AnalyzeRetry
                dreamId={dream.id}
                message="이 꿈은 예전 mock 해몽으로 저장되어 있어요. 실제 AI 해몽으로 새로 읽어올 수 있어요."
                buttonLabel="AI 해몽 새로 만들기"
              />
            ) : null}
            <div>
              <p className="result-key">현재 상태</p>
              <p>{dream.analysis.currentStateReflection}</p>
            </div>
            <div>
              <p className="result-key">장면 스케치</p>
              <div className="scene-box">{dream.analysis.sceneSummary}</div>
            </div>
            {!hasLegacyMockAnalysis ? <GenerateImageAction dreamId={dream.id} hasImage={Boolean(dream.analysis.imagePath)} /> : null}
            {dream.analysis.imagePath ? (
              <div>
                <p className="result-key">저장된 꿈 장면</p>
                <GeneratedImagePreview
                  src={dream.analysis.imagePath}
                  alt="AI가 그린 꿈 장면"
                  caption={dream.analysis.imagePrompt ?? dream.analysis.scenePrompt}
                />
              </div>
            ) : null}
            <div>
              <p className="result-key">상징 단서</p>
              <div className="symbol-pill-row">
                {dream.analysis.symbols.map((symbol) => (
                  <span key={symbol.name} className="symbol-pill">
                    {symbol.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="result-key">오늘의 해몽</p>
              <p className="dream-detail__reading">{dream.analysis.interpretation}</p>
            </div>
          </div>
        ) : (
          <AnalyzeRetry dreamId={dream.id} />
        )}
      </article>
    </AppShell>
  );
}
