import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DreamForm } from "@/components/record/dream-form";

export default function RecordPage() {
  return (
    <AppShell>
      <section className="screen-screen">
        <div className="screen-header">
          <Link href="/" className="back-btn" aria-label="이전으로">
            ‹
          </Link>
          <span className="screen-title">새 꿈 기록</span>
          <span className="screen-action">자동 저장</span>
        </div>

        <div className="screen-body">
          <p className="s2-prompt">"오늘 꿈에서<br />무슨 일이 있었나요?"</p>
          <p className="record-intro">적는 순간 바로 저장되고, 이어서 오늘의 흐름을 읽는 리딩 카드가 열려요.</p>
          <DreamForm />
        </div>
      </section>
    </AppShell>
  );
}
