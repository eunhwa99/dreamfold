import { AppShell } from "@/components/app-shell";
import { ArchiveCalendar } from "@/components/archive/archive-calendar";
import { MoodFilterBar } from "@/components/mood-filter-bar";
import { filterDreamsByMood, listAvailableMoods, listDreams } from "@/lib/mock-store";

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Promise<{ mood?: string; month?: string; day?: string }>;
}) {
  const { mood, month, day } = await searchParams;
  const dreams = filterDreamsByMood(listDreams(), mood ?? null);
  const moods = listAvailableMoods();

  return (
    <AppShell>
      <section className="screen-screen">
        <div className="report-hero">
          <p className="section-kicker">Archive</p>
          <h2 className="report-title">보관함</h2>
          <p className="report-copy">기록된 꿈을 다시 열어보고, 어떤 장면과 감정이 오래 남았는지 조용히 되짚어보세요.</p>
        </div>
        <MoodFilterBar currentPath="/archive" moods={moods} selectedMood={mood ?? null} />
        <ArchiveCalendar dreams={dreams} month={month} day={day} mood={mood ?? null} />
      </section>
    </AppShell>
  );
}
