import type { AnalysisResult } from "@/lib/dreams/interpreter";

type Props = {
  result: AnalysisResult;
};

export function AnalysisResultCard({ result }: Props) {
  return (
    <section className="analysis-screen" data-testid="analysis-result">
      <div className="s3-illust">
        <span className="star star-1" />
        <span className="star star-2" />
        <span className="star star-3" />
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <div className="s3-illust-label">AI 생성 일러스트</div>
      </div>

      <div className="s3-body">
        <h3 className="s3-title">오늘의 해몽</h3>
        <p className="result-key">현재 상태</p>
        <p className="s3-subtitle">{result.currentStateReflection}</p>

        <div className="insight-row">
          <div className="insight-card">
            <span className="insight-emoji">✦</span>
            <div className="insight-label">핵심 심볼</div>
            <div className="insight-value">{result.symbols.map((symbol) => symbol.name).join(", ")}</div>
          </div>
          <div className="insight-card">
            <span className="insight-emoji">🫧</span>
            <div className="insight-label">감정의 결</div>
            <div className="insight-value">{result.emotionalSummary}</div>
          </div>
          <div className="insight-card">
            <span className="insight-emoji">🌙</span>
            <div className="insight-label">핵심 장면</div>
            <div className="insight-value">{result.scenePrompt}</div>
          </div>
        </div>

        <div className="interpretation">
          <div className="interp-label">✦ AI 해석</div>
          <div className="interp-text">{result.interpretation}</div>
        </div>
      </div>
    </section>
  );
}
