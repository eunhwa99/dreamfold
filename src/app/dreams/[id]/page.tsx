import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getDream } from "@/lib/mock-store";

export default async function DreamDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dream = getDream(id);

  if (!dream) {
    notFound();
  }

  return (
    <AppShell>
      <article className="panel panel--feature dream-detail" data-testid="dream-detail">
        <p className="eyebrow">Dream Detail</p>
        <h2 className="section-title">{dream.title}</h2>
        <p className="section-copy">{dream.dreamText}</p>
        {dream.analysis ? (
          <div className="stack">
            <div>
              <p className="result-key">현재 상태</p>
              <p>{dream.analysis.currentStateReflection}</p>
            </div>
            <div>
              <p className="result-key">핵심 장면</p>
              <div className="scene-box">{dream.analysis.scenePrompt}</div>
            </div>
            <div>
              <p className="result-key">오늘의 해몽</p>
              <p className="dream-detail__reading">{dream.analysis.interpretation}</p>
            </div>
          </div>
        ) : (
          <p>아직 해몽이 생성되지 않았어요.</p>
        )}
      </article>
    </AppShell>
  );
}
