import Link from "next/link";

import type { DreamEntry } from "@/lib/mock-store";

export function DreamList({ dreams }: { dreams: DreamEntry[] }) {
  return (
    <div className="archive-list">
      {dreams.map((dream) => (
        <Link key={dream.id} href={`/dreams/${dream.id}`} className="archive-list__item">
          <div className="archive-list__meta">
            <span>{dream.createdAt}</span>
            <span className="archive-list__pill">{dream.moodTags[0] ?? "여운"}</span>
          </div>
          <h3 className="archive-list__title">{dream.title}</h3>
          <p>{dream.dreamText}</p>
        </Link>
      ))}
    </div>
  );
}
