import Link from "next/link";

import { getSymbolLabel } from "@/lib/dreams/catalog";
import type { DreamEntry } from "@/lib/dreams/types";

export function DreamList({ dreams }: { dreams: DreamEntry[] }) {
  if (dreams.length === 0) {
    return (
      <article className="archive-entry archive-entry--empty">
        <p className="section-kicker">Archive</p>
        <h3 className="archive-list__title">아직 이 감정으로 저장된 꿈이 없어요.</h3>
        <p>다른 감정 필터를 열어보거나 새로운 꿈을 먼저 기록해보세요.</p>
      </article>
    );
  }

  return (
    <div className="archive-list">
      {dreams.map((dream) => (
        <Link key={dream.id} href={`/dreams/${dream.id}`} className="archive-entry">
          <div className="archive-list__meta">
            <span>{dream.createdAt}</span>
            <span className="archive-list__pill">{dream.moodTags[0] ?? "여운"}</span>
          </div>
          <h3 className="archive-list__title">{dream.title}</h3>
          <p>{dream.dreamText}</p>
          <div className="archive-symbols">
            {dream.symbolTags.slice(0, 3).map((symbol) => (
              <span key={`${dream.id}-${symbol}`} className="archive-symbol">
                {getSymbolLabel(symbol)}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
