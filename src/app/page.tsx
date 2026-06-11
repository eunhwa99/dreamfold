import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { TodayMessageCard } from "@/components/home/today-message-card";
import { listDreams } from "@/lib/mock-store";

export default function HomePage() {
  const latestDream = listDreams()[0];

  return (
    <AppShell>
      <section className="home-screen">
        <div className="s1-greeting">좋은 아침이에요</div>
        <h2 className="s1-date">오늘의 꿈,<br />기록해볼까요?</h2>

        <div className="s1-mood-row">
          <span className="mood-pill active">전체</span>
          <span className="mood-pill">신비로운</span>
          <span className="mood-pill">따뜻한</span>
        </div>

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
              <h3 className="dream-card-title">{latestDream.title}</h3>
              <p className="dream-card-time">{latestDream.createdAt}</p>
            </div>
          </div>
        </article>

        <div className="small-cards">
          <article className="small-card">
            <div className="small-card-emoji">🌙</div>
            <p className="small-card-label">이번 달 꿈</p>
            <strong className="small-card-value">14개</strong>
          </article>
          <article className="small-card">
            <div className="small-card-emoji">✦</div>
            <p className="small-card-label">자주 등장</p>
            <strong className="small-card-value">하늘, 책</strong>
          </article>
          <article className="small-card">
            <div className="small-card-emoji">🫧</div>
            <p className="small-card-label">감정 톤</p>
            <strong className="small-card-value">평온함</strong>
          </article>
        </div>

        <section className="home-panels">
          <TodayMessageCard />
          <article className="info-card">
            <p className="section-kicker">최근 리딩</p>
            <h3>{latestDream.analysis?.currentStateReflection ?? "아직 해몽이 없어요."}</h3>
            <p>{latestDream.dreamText}</p>
          </article>
        </section>

        <Link href="/record" className="fab" aria-label="오늘 꿈 기록하기">
          +
        </Link>
      </section>
    </AppShell>
  );
}
