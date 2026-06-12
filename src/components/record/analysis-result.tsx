import { GeneratedImagePreview } from "@/components/dream-detail/generated-image-preview";
import type { AnalysisResult } from "@/lib/dreams/types";

type Props = {
  result: AnalysisResult;
  imageLoading: boolean;
  imageError: string | null;
  onGenerateImage: () => Promise<void> | void;
};

export function AnalysisResultCard({ result, imageLoading, imageError, onGenerateImage }: Props) {
  return (
    <section className="analysis-screen" data-testid="analysis-result">
      <div className="scene-preview">
        <p className="section-kicker">장면 스케치</p>
        <h3>{result.sceneSummary}</h3>
        <p>{result.emotionalSummary}</p>
        <div className="symbol-pill-row">
          {result.symbols.map((symbol) => (
            <span key={symbol.name} className="symbol-pill">
              {symbol.label}
            </span>
          ))}
        </div>
      </div>

      <div className="s3-body">
        <h3 className="s3-title">오늘의 해몽</h3>
        <p className="result-key">현재 상태</p>
        <p className="s3-subtitle">{result.currentStateReflection}</p>

        <div className="insight-row">
          <div className="insight-card">
            <span className="insight-emoji">✦</span>
            <div className="insight-label">상징 단서</div>
            <div className="insight-value">{result.symbols.map((symbol) => symbol.label).join(", ")}</div>
          </div>
          <div className="insight-card">
            <span className="insight-emoji">🫧</span>
            <div className="insight-label">감정의 결</div>
            <div className="insight-value">{result.emotionalSummary}</div>
          </div>
          <div className="insight-card">
            <span className="insight-emoji">🌙</span>
            <div className="insight-label">장면 스케치</div>
            <div className="insight-value">{result.sceneSummary}</div>
          </div>
        </div>

        <div className="interpretation">
          <div className="interp-label">✦ AI 해석</div>
          <div className="interp-text">{result.interpretation}</div>
        </div>

        <div className="image-action-row">
          <button className="generate-btn generate-btn--secondary" type="button" onClick={onGenerateImage} disabled={imageLoading}>
            {imageLoading ? "꿈 장면을 그리고 있어요..." : result.imagePath ? "그림 다시 만들기" : "그림 만들기"}
          </button>
        </div>

        {imageError ? (
          <div className="status" data-tone="error">
            {imageError}
          </div>
        ) : null}

        {result.imagePath ? (
          <GeneratedImagePreview
            src={result.imagePath}
            alt="AI가 그린 꿈 장면"
            caption={result.imagePrompt ?? result.scenePrompt}
          />
        ) : null}
      </div>
    </section>
  );
}
