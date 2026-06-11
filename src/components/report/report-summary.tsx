import type { RankedItem } from "@/lib/dreams/types";

type Props = {
  title: string;
  items: RankedItem[];
  emptyLabel: string;
};

export function ReportSummary({ title, items, emptyLabel }: Props) {
  return (
    <article className="insight-card report-summary">
      <p className="insight-label">{title}</p>
      <h3>{items[0] ? `${items[0].name}의 흐름이 지금 또렷해요` : emptyLabel}</h3>
      <div className="metric-list">
        {items.slice(0, 4).map((item) => (
          <div key={item.name} className="metric">
            <span>{item.name}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
