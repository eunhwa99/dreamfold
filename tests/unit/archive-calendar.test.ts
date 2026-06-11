import { describe, expect, it } from "vitest";

import { buildArchiveCalendarModel, getArchiveMonthKey } from "@/lib/archive-calendar";
import type { DreamEntry } from "@/lib/dreams/types";

const dreams: DreamEntry[] = [
  {
    id: "a",
    title: "복도",
    dreamText: "학교 복도를 달렸어요.",
    moodTags: ["불안"],
    symbolTags: ["school"],
    createdAt: "2026.06.11"
  },
  {
    id: "b",
    title: "바다",
    dreamText: "바다 위의 집을 봤어요.",
    moodTags: ["여운"],
    symbolTags: ["water"],
    createdAt: "2026.06.11"
  },
  {
    id: "c",
    title: "빛",
    dreamText: "따뜻한 빛이 내렸어요.",
    moodTags: ["안도"],
    symbolTags: ["sky"],
    createdAt: "2026.06.15"
  }
];

describe("archive calendar helpers", () => {
  it("groups dreams by date and keeps the first mood as the representative dot", () => {
    const model = buildArchiveCalendarModel(dreams, { month: "2026-06", day: "2026-06-11" });

    expect(model.selectedDay.dateKey).toBe("2026-06-11");
    expect(model.selectedDay.representativeMood).toBe("불안");
    expect(model.selectedDay.dreams).toHaveLength(2);
  });

  it("builds a month grid that marks days with records", () => {
    const model = buildArchiveCalendarModel(dreams, { month: "2026-06" });
    const eleventh = model.weeks.flat().find((cell) => cell.dateKey === "2026-06-11");

    expect(eleventh?.hasDreams).toBe(true);
    expect(eleventh?.representativeMood).toBe("불안");
  });

  it("defaults the selected day to the most recent day in the chosen month", () => {
    const model = buildArchiveCalendarModel(dreams, { month: getArchiveMonthKey("2026.06.15") });

    expect(model.selectedDay.dateKey).toBe("2026-06-15");
  });

  it("ignores a stale day query from a different month and falls back to the latest day in the chosen month", () => {
    const model = buildArchiveCalendarModel(dreams, { month: "2026-06", day: "2026-05-31" });

    expect(model.selectedDay.dateKey).toBe("2026-06-15");
    expect(model.selectedDay.dreams).toHaveLength(1);
  });

  it("keeps a same-month empty day selected as a placeholder instead of falling back", () => {
    const model = buildArchiveCalendarModel(dreams, { month: "2026-06", day: "2026-06-20" });

    expect(model.selectedDay.dateKey).toBe("2026-06-20");
    expect(model.selectedDay.dreams).toHaveLength(0);
  });
});
