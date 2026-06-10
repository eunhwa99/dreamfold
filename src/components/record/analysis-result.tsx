import type { AnalysisResult } from "@/lib/dreams/interpreter";

type Props = {
  result: AnalysisResult;
};

export function AnalysisResultCard({ result }: Props) {
  return (
    <section className="result-card" data-testid="analysis-result">
      <div className="result-card__hero">
        <p className="eyebrow">Today's reading</p>
        <h3>오늘의 해몽</h3>
      </div>
      <div className="result-grid">
        <div>
          <p className="result-key">감정의 결</p>
          <p>{result.emotionalSummary}</p>
        </div>
        <div>
          <p className="result-key">현재 상태</p>
          <p>{result.currentStateReflection}</p>
        </div>
        <div>
          <p className="result-key">핵심 장면</p>
          <div className="scene-box">{result.scenePrompt}</div>
        </div>
        <div>
          <p className="result-key">상징</p>
          <p>{result.symbols.map((symbol) => `${symbol.name} (${symbol.meaning})`).join(", ")}</p>
        </div>
      </div>
      <p className="result-card__reading">{result.interpretation}</p>
    </section>
  );
}
