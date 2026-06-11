import Link from "next/link";

import { getSymbolLabel } from "@/lib/dreams/catalog";
import type { ArchiveDaySummary } from "@/lib/archive-calendar";

type Props = {
  day: ArchiveDaySummary;
};

export function ArchiveDayPanel({ day }: Props) {
  return (
    <section className="archive-day-panel" aria-label="선택한 날짜의 기록">
      <p className="section-kicker">Selected day</p>
      <h3 className="archive-day-panel__title">{day.displayDate}의 꿈</h3>

      {day.dreams.length === 0 ? (
        <p>이 날짜에는 아직 기록된 꿈이 없어요.</p>
      ) : (
        <div className="archive-list">
          {day.dreams.map((dream) => (
            <Link key={dream.id} href={`/dreams/${dream.id}`} className="archive-entry">
              <div className="archive-list__meta">
                <span>{dream.createdAt}</span>
                <span className="archive-list__pill">{dream.moodTags[0] ?? "여운"}</span>
              </div>
              <h4 className="archive-list__title">{dream.title}</h4>
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
      )}
    </section>
  );
}
