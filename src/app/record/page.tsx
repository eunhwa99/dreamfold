import { AppShell } from "@/components/app-shell";
import { DreamForm } from "@/components/record/dream-form";

export default function RecordPage() {
  return (
    <AppShell>
      <section className="record-layout">
        <div className="stack">
          <div className="panel">
            <p className="eyebrow">Dream Record</p>
            <h2 className="section-title">어젯밤 꿈을 붙잡아 볼까요?</h2>
            <p className="section-copy">
              조각난 기억도 괜찮아요. 장면, 감정, 사람, 공간 중 하나만 남겨도 AI가 지금 마음의 흐름을 읽어볼 수 있어요.
            </p>
          </div>
          <DreamForm />
        </div>
        <aside className="stack">
          <div className="panel">
            <p className="eyebrow">How It Feels</p>
            <h3>타로처럼 신비롭고, 일기처럼 개인적이게</h3>
            <p>해몽은 단정하지 않고, 해석의 여지를 남겨야 해요. 그래서 모든 문장은 진단이 아니라 리딩처럼 들리도록 설계합니다.</p>
          </div>
          <div className="panel">
            <p className="eyebrow">What You Get</p>
            <p>오늘의 해석, 감정의 결, 현재 상태 한 줄 리딩, 그리고 가장 강한 장면을 위한 일러스트 프롬프트가 함께 나옵니다.</p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
