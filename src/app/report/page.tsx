import { AppShell } from "@/components/app-shell";
import { MoodFilterBar } from "@/components/mood-filter-bar";
import { ReportSummary } from "@/components/report/report-summary";
import { getSymbolLabel } from "@/lib/dreams/catalog";
import { buildDreamReport } from "@/lib/dreams/report-builder";
import { filterDreamsByMood, listAvailableMoods, listDreams } from "@/lib/mock-store";

export default async function ReportPage({
  searchParams
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const { mood } = await searchParams;
  const dreams = filterDreamsByMood(listDreams(), mood ?? null);
  const moods = listAvailableMoods();
  const report = buildDreamReport(
    dreams.map((dream) => ({
      moodTags: dream.moodTags,
      symbolTags: dream.symbolTags,
      title: dream.title,
      createdAt: dream.createdAt
    }))
  );

  return (
    <AppShell>
      <section className="screen-screen">
        <div className="report-hero">
          <p className="section-kicker">My report</p>
          <h2 className="report-title">내 리포트</h2>
          <p className="report-copy">반복되는 감정과 상징을 따라가며, 최근 내 무의식이 어디에 오래 머물고 있는지 읽어보세요.</p>
        </div>
        <MoodFilterBar currentPath="/report" moods={moods} selectedMood={mood ?? null} />

        <section className="summary-grid">
          <ReportSummary title="지금 가장 오래 머무는 감정" items={report.topMoods} emptyLabel="감정 데이터가 아직 적어요" />
          <ReportSummary
            title="자주 되풀이되는 상징"
            items={report.topSymbols.map((item) => ({ ...item, name: getSymbolLabel(item.name) }))}
            emptyLabel="상징 데이터가 아직 적어요"
          />
        </section>

        <section className="summary-grid summary-grid--insight">
          <article className="insight-card report-summary">
            <p className="insight-label">최근 3개의 꿈에서</p>
            <h3>{report.recentFocus.summary}</h3>
          </article>
          <article className="insight-card report-summary">
            <p className="insight-label">이전 흐름과 비교하면</p>
            <h3>{report.comparison.summary}</h3>
          </article>
        </section>

        <section className="highlight-list-card">
          <p className="section-kicker">최근 3개의 꿈에서</p>
          <div className="highlight-list">
            {report.highlightMoments.map((moment) => (
              <div key={moment} className="highlight-item">
                {moment}
              </div>
            ))}
          </div>
        </section>

        <section className="interpretation">
          <p className="interp-label">✦ AI insight</p>
          <p className="interp-text">{report.insight}</p>
        </section>
      </section>
    </AppShell>
  );
}
