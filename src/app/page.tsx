import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { TodayMessageCard } from "@/components/home/today-message-card";
import { listDreams } from "@/lib/mock-store";

export default function HomePage() {
  const latestDream = listDreams()[0];

  return (
    <AppShell>
      <section className="hero">
        <p className="eyebrow">Tonight's Echo</p>
        <h2>사라지기 전에, 꿈의 조각을 적어보세요.</h2>
        <p className="lede">
          신비로운 해몽, 가장 선명한 장면을 붙잡는 일러스트 프롬프트, 그리고 쌓일수록 진짜 내 상태를 읽어주는 리포트까지 이어지는 꿈 기록 앱입니다.
        </p>
        <div className="hero__actions">
          <Link href="/record" className="button">
            오늘 꿈 기록하기
          </Link>
          <Link href="/report" className="button--secondary">
            내 리포트 보기
          </Link>
        </div>
      </section>

      <section className="overview-grid">
        <TodayMessageCard />
        <article className="panel">
          <p className="eyebrow">Recent Reading</p>
          <h3>{latestDream.title}</h3>
          <p>{latestDream.analysis?.currentStateReflection ?? "아직 해몽이 없어요."}</p>
          <p className="footer-note">최근 상징: {latestDream.symbolTags.join(", ")}</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Quick Path</p>
          <h3>기록 {"->"} 해몽 {"->"} 리포트</h3>
          <p>몽환적인 첫 경험은 빠르게, 장기적인 인사이트는 천천히 쌓이도록 설계합니다.</p>
        </article>
      </section>
    </AppShell>
  );
}
