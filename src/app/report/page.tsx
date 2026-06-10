import { AppShell } from "@/components/app-shell";
import { ReportSummary } from "@/components/report/report-summary";
import { getReport } from "@/lib/mock-store";

export default function ReportPage() {
  const report = getReport();

  return (
    <AppShell>
      <section className="panel panel--feature">
        <p className="eyebrow">My report</p>
        <h2 className="section-title">내 리포트</h2>
        <p className="section-copy">반복되는 감정과 상징을 따라가며, 최근 내 무의식이 어디에 오래 머물고 있는지 차분하게 읽어보세요.</p>
      </section>

      <section className="summary-grid">
        <ReportSummary title="자주 반복된 감정" items={report.topMoods} emptyLabel="감정 데이터가 아직 적어요" />
        <ReportSummary title="자주 나타난 상징" items={report.topSymbols} emptyLabel="상징 데이터가 아직 적어요" />
      </section>

      <section className="panel panel--soft">
        <p className="eyebrow">AI insight</p>
        <h3>최근 변화의 흐름</h3>
        <p>{report.insight}</p>
      </section>
    </AppShell>
  );
}
