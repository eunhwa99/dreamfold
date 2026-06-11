import type { DreamEntry } from "@/lib/dreams/types";

type ArchiveDaySummary = {
  dateKey: string;
  displayDate: string;
  representativeMood: string | null;
  dreams: DreamEntry[];
};

type ArchiveCalendarCell = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  hasDreams: boolean;
  representativeMood: string | null;
};

type ArchiveCalendarQuery = {
  month?: string;
  day?: string;
};

function toDateKey(createdAt: string) {
  return createdAt.replace(/\./g, "-");
}

function formatMonthKey(year: number, month: number) {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
}

function formatDateKey(year: number, month: number, day: number) {
  return `${formatMonthKey(year, month)}-${day.toString().padStart(2, "0")}`;
}

function getDefaultMonthKey(dreams: DreamEntry[]) {
  if (dreams.length === 0) {
    const now = new Date();
    return formatMonthKey(now.getFullYear(), now.getMonth() + 1);
  }

  return [...dreams]
    .map((dream) => getArchiveMonthKey(dream.createdAt))
    .sort((left, right) => right.localeCompare(left))[0];
}

export function getArchiveMonthKey(createdAt: string) {
  return toDateKey(createdAt).slice(0, 7);
}

export function buildArchiveCalendarModel(dreams: DreamEntry[], query: ArchiveCalendarQuery) {
  const grouped = new Map<string, ArchiveDaySummary>();

  dreams.forEach((dream) => {
    const dateKey = toDateKey(dream.createdAt);
    const existing = grouped.get(dateKey);

    if (existing) {
      existing.dreams.push(dream);
      return;
    }

    grouped.set(dateKey, {
      dateKey,
      displayDate: dream.createdAt,
      representativeMood: dream.moodTags[0] ?? null,
      dreams: [dream]
    });
  });

  const month = query.month ?? getDefaultMonthKey(dreams);
  const monthDreams = [...grouped.values()]
    .filter((entry) => entry.dateKey.startsWith(month))
    .sort((left, right) => right.dateKey.localeCompare(left.dateKey));

  const requestedDay = query.day?.startsWith(`${month}-`) ? query.day : undefined;
  const fallbackDateKey = requestedDay ?? monthDreams[0]?.dateKey ?? `${month}-01`;
  const selectedDay =
    grouped.get(fallbackDateKey) ?? {
      dateKey: fallbackDateKey,
      displayDate: fallbackDateKey.replace(/-/g, "."),
      representativeMood: null,
      dreams: []
    };

  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const weeks: ArchiveCalendarCell[][] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - offset + 1;
    const cellDate = new Date(year, monthNumber - 1, dayOffset);
    const cellYear = cellDate.getFullYear();
    const cellMonth = cellDate.getMonth() + 1;
    const cellDay = cellDate.getDate();
    const dateKey = formatDateKey(cellYear, cellMonth, cellDay);
    const summary = grouped.get(dateKey);
    const weekIndex = Math.floor(index / 7);

    weeks[weekIndex] ??= [];
    weeks[weekIndex].push({
      dateKey,
      dayNumber: cellDay,
      inMonth: cellMonth === monthNumber,
      hasDreams: Boolean(summary),
      representativeMood: summary?.representativeMood ?? null
    });
  }

  const previousMonthDate = new Date(year, monthNumber - 2, 1);
  const nextMonthDate = new Date(year, monthNumber, 1);

  return {
    month,
    weeks,
    selectedDay,
    previousMonth: formatMonthKey(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1),
    nextMonth: formatMonthKey(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1)
  };
}
