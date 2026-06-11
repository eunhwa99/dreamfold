import Link from "next/link";

import { buildArchiveCalendarModel } from "@/lib/archive-calendar";
import type { DreamEntry } from "@/lib/dreams/types";

type Props = {
  dreams: DreamEntry[];
  month?: string;
  day?: string;
  mood?: string | null;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatMonthHeading(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}.${month.toString().padStart(2, "0")}`;
}

function buildArchiveHref(params: { month: string; day?: string; mood?: string | null }) {
  const searchParams = new URLSearchParams();

  if (params.mood) {
    searchParams.set("mood", params.mood);
  }

  searchParams.set("month", params.month);

  if (params.day) {
    searchParams.set("day", params.day);
  }

  const query = searchParams.toString();
  return query ? `/archive?${query}` : "/archive";
}

export function ArchiveCalendar({ dreams, month, day, mood }: Props) {
  const model = buildArchiveCalendarModel(dreams, { month, day });

  return (
    <section className="archive-calendar-shell" data-testid="archive-calendar">
      <div className="archive-calendar__header">
        <div>
          <p className="section-kicker">Month view</p>
          <h3 className="archive-calendar__title">{formatMonthHeading(model.month)}</h3>
        </div>
        <div className="archive-calendar__controls">
          <Link href={buildArchiveHref({ month: model.previousMonth, mood })} aria-label="이전 달" className="archive-calendar__nav">
            <span aria-hidden="true">←</span>
          </Link>
          <Link href={buildArchiveHref({ month: model.nextMonth, mood })} aria-label="다음 달" className="archive-calendar__nav">
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="archive-calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="archive-calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="archive-calendar__grid">
        {model.weeks.flat().map((cell) => {
          const isSelected = cell.dateKey === model.selectedDay.dateKey;
          const cellHref = buildArchiveHref({
            month: model.month,
            day: cell.dateKey,
            mood
          });
          const dayContent = (
            <>
              <span className="archive-calendar__day-number">{cell.dayNumber}</span>
              {cell.hasDreams ? (
                <span
                  className="archive-calendar__day-dot"
                  data-testid="archive-day-dot"
                  data-mood={cell.representativeMood ?? "none"}
                  aria-hidden="true"
                />
              ) : (
                <span className="archive-calendar__day-dot archive-calendar__day-dot--empty" aria-hidden="true" />
              )}
            </>
          );

          if (!cell.inMonth) {
            return (
              <span
                key={cell.dateKey}
                className="archive-calendar__day"
                data-current-month={false}
                data-has-dreams={cell.hasDreams}
                aria-hidden="true"
              >
                {dayContent}
              </span>
            );
          }

          return (
            <Link
              key={cell.dateKey}
              href={cellHref}
              className="archive-calendar__day"
              data-current-month={cell.inMonth}
              data-has-dreams={cell.hasDreams}
              data-selected={isSelected}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${cell.dateKey}${cell.hasDreams ? " recorded" : ""}`}
            >
              {dayContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
