import { AppShell } from "@/components/app-shell";
import { DreamForm } from "@/components/record/dream-form";

export default function RecordPage() {
  return (
    <AppShell>
      <section className="record-layout">
        <div className="stack">
          <div className="panel panel--journal">
            <p className="eyebrow">Dream entry</p>
            <h2 className="section-title">오늘 가장 선명한 장면을 적어볼까요?</h2>
            <p className="section-copy">
              길게 정리하지 않아도 괜찮아요. 떠오르는 장면, 감정, 사람, 공간 중 하나만 남겨도 지금 마음의 흐름을 읽는 데 충분해요.
            </p>
          </div>
          <DreamForm />
        </div>
        <aside className="stack">
          <div className="panel panel--feature">
            <p className="eyebrow">Writing mood</p>
            <h3>일기처럼 가까우면서도, 리딩처럼 부드럽게.</h3>
            <p>해석은 단정하지 않고 여백을 남깁니다. 그래서 DreamFold의 문장은 진단이 아니라 조용한 해석처럼 들려야 해요.</p>
          </div>
          <div className="panel panel--soft">
            <p className="eyebrow">What you get</p>
            <p>오늘의 해석, 감정의 결, 현재 상태 한 줄 리딩, 그리고 가장 선명한 장면을 붙잡는 일러스트 프롬프트가 함께 나옵니다.</p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
