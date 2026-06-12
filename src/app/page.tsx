import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { MoodFilterBar } from "@/components/mood-filter-bar";
import { TodayMessageCard } from "@/components/home/today-message-card";
import { getSymbolLabel } from "@/lib/dreams/catalog";
import { buildDreamReport } from "@/lib/dreams/report-builder";
import { getHomePageState } from "@/lib/home-state";
import { listAvailableMoods, listDreams } from "@/lib/mock-store";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const { mood } = await searchParams;
  const dreams = listDreams();
  const moods = listAvailableMoods();
  const homeState = getHomePageState({ mood: mood ?? null, dreams });
  const report = buildDreamReport(
    homeState.filteredDreams.map((dream) => ({
      moodTags: dream.moodTags,
      symbolTags: dream.symbolTags,
      title: dream.title,
      createdAt: dream.createdAt
    }))
  );

  if (homeState.type === "empty") {
    return (
      <AppShell>
        <section className="home-screen">
          <h2 className="s1-date">오늘의 꿈을<br />처음으로 기록해볼까요?</h2>
          <Link href="/record" className="fab" aria-label="오늘 꿈 기록하기">
            오늘 꿈 기록하기
          </Link>
        </section>
      </AppShell>
    );
  }

  if (homeState.type === "empty-filter") {
    return (
      <AppShell>
        <section className="home-screen">
          <div className="s1-greeting">좋은 아침이에요</div>
          <h2 className="s1-date">아직 {homeState.mood} 감정의 꿈은 없어요.</h2>

          <MoodFilterBar currentPath="/" moods={moods} selectedMood={mood ?? null} />

          <article className="info-card">
            <p className="section-kicker">필터 결과</p>
            <h3>다른 감정으로 다시 둘러보거나, 오늘의 꿈을 새로 기록해보세요.</h3>
            <p>현재 선택한 감정에 해당하는 기록이 없어서 홈 카드를 비워두었어요.</p>
          </article>

          <Link href="/record" className="fab" aria-label="오늘 꿈 기록하기">
            오늘 꿈 기록하기
          </Link>
        </section>
      </AppShell>
    );
  }

  const { filteredDreams, latestDream } = homeState;

  return (
    <AppShell>
      <section className="home-screen">
        <div className="s1-greeting">좋은 아침이에요</div>
        <h2 className="s1-date">오늘의 꿈,<br />기록해볼까요?</h2>

        <MoodFilterBar currentPath="/" moods={moods} selectedMood={mood ?? null} />

        <article className="dream-card">
          <div className="dream-card-img">
            <span className="orb orb-1" />
            <span className="orb orb-2" />
            <span className="orb orb-3" />
            <span className="star star-1" />
            <span className="star star-2" />
            <span className="star star-3" />
            <span className="star star-4" />
            <div className="dream-card-meta">
              <p className="section-kicker">최근 기록</p>
              <h3 className="dream-card-title">{latestDream.title}</h3>
              <p className="dream-card-time">{latestDream.createdAt}</p>
            </div>
          </div>
        </article>

        <div className="small-cards">
          <article className="small-card">
            <div className="small-card-emoji">🌙</div>
            <p className="small-card-label">최근 기록</p>
            <strong className="small-card-value">{filteredDreams.length}개</strong>
          </article>
          <article className="small-card">
            <div className="small-card-emoji">✦</div>
            <p className="small-card-label">이번 흐름</p>
            <strong className="small-card-value">{report.recentFocus.mood}</strong>
          </article>
          <article className="small-card">
            <div className="small-card-emoji">🫧</div>
            <p className="small-card-label">되풀이되는 상징</p>
            <strong className="small-card-value">{getSymbolLabel(report.topSymbols[0]?.name ?? "mist")}</strong>
          </article>
        </div>

        <section className="home-panels">
          <TodayMessageCard />
          <article className="info-card">
            <p className="section-kicker">최근 리딩</p>
            <h3>{latestDream.analysis?.currentStateReflection ?? "아직 해몽이 없어요."}</h3>
            <p>{latestDream.analysis?.sceneSummary ?? latestDream.dreamText}</p>
          </article>
        </section>

        <Link href="/record" className="fab" aria-label="오늘 꿈 기록하기">
          오늘 꿈 기록하기
        </Link>
      </section>
    </AppShell>
  );
}
