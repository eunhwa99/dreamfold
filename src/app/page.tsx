import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { TodayMessageCard } from "@/components/home/today-message-card";
import { listDreams } from "@/lib/mock-store";

export default function HomePage() {
  const latestDream = listDreams()[0];

  return (
    <AppShell>
      <section className="hero hero--home">
        <div className="hero__copy">
          <p className="eyebrow">Good morning</p>
          <h2>오늘의 꿈, 기록해볼까요?</h2>
          <p className="lede">
            사라지기 전에 붙잡은 장면은 시간이 지나며 당신만의 상징 지도와 감정의 결로 접혀 들어갑니다.
          </p>
          <div className="hero__actions">
            <Link href="/record" className="button">
              오늘 꿈 기록하기
            </Link>
            <Link href="/report" className="button--secondary">
              내 리포트 보기
            </Link>
          </div>
        </div>
        <article className="dream-spotlight">
          <p className="dream-spotlight__label">Latest reading</p>
          <div className="dream-spotlight__art">
            <span className="dream-spotlight__orb dream-spotlight__orb--one" />
            <span className="dream-spotlight__orb dream-spotlight__orb--two" />
            <span className="dream-spotlight__orb dream-spotlight__orb--three" />
            <div className="dream-spotlight__overlay">
              <h3>{latestDream.title}</h3>
              <p>{latestDream.createdAt}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="overview-grid">
        <TodayMessageCard />
        <article className="panel panel--feature">
          <p className="eyebrow">Recent Reading</p>
          <h3>{latestDream.analysis?.currentStateReflection ?? "아직 해몽이 없어요."}</h3>
          <p>{latestDream.dreamText}</p>
          <p className="footer-note">최근 상징 · {latestDream.symbolTags.join(" · ")}</p>
        </article>
        <article className="panel panel--feature panel--accent">
          <p className="eyebrow">Quiet pattern</p>
          <h3>기록, 해석, 리포트가 한 흐름처럼 이어져요.</h3>
          <p>매일의 꿈은 가볍게 남기고, 의미는 쌓인 뒤에 천천히 읽을 수 있게 구성했습니다.</p>
        </article>
      </section>

      <section className="home-ritual">
        <div className="panel panel--soft">
          <p className="eyebrow">Tonight check-in</p>
          <h3>가장 선명했던 장면 하나만 적어도 충분해요.</h3>
          <p>완전한 서사가 아니라 조각난 기억이어도, DreamFold는 그 안의 감정과 상징을 조용히 연결해줍니다.</p>
        </div>
        <div className="mini-metrics">
          <article className="mini-metric">
            <span className="mini-metric__icon">✦</span>
            <p className="mini-metric__label">이번 달 꿈</p>
            <strong>14개</strong>
          </article>
          <article className="mini-metric">
            <span className="mini-metric__icon">☾</span>
            <p className="mini-metric__label">자주 등장</p>
            <strong>책, 빛</strong>
          </article>
          <article className="mini-metric">
            <span className="mini-metric__icon">🫧</span>
            <p className="mini-metric__label">감정 톤</p>
            <strong>평온함</strong>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
