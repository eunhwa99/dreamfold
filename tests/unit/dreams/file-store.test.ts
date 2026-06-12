import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createDreamFileStore, formatDreamDate } from "@/lib/dreams/file-store";
import { isDreamStoreError } from "@/lib/dreams/store-errors";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("createDreamFileStore", () => {
  it("formats createdAt using the local calendar date", () => {
    expect(formatDreamDate(new Date("2026-06-11T00:30:00+09:00"))).toBe("2026.06.11");
  });

  it("persists a newly created dream to disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);

    const store = createDreamFileStore({
      filePath: path.join(dir, "dreams.json"),
      seedDreams: []
    });

    const created = store.createDream({
      dreamText: "파도 위에 떠 있는 집으로 천천히 걸어 들어갔어요.",
      moodTags: ["안도"],
      symbolTags: ["water", "house"]
    });

    const reloaded = createDreamFileStore({
      filePath: path.join(dir, "dreams.json"),
      seedDreams: []
    });

    expect(created.id).toBeTruthy();
    expect(reloaded.listDreams()[0]?.dreamText).toContain("파도");
    expect(reloaded.listDreams()[0]?.symbolTags).toEqual(["water", "house"]);
  });

  it("creates unique dream ids even within the same millisecond", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    const store = createDreamFileStore({
      filePath: path.join(dir, "dreams.json"),
      seedDreams: []
    });

    const first = store.createDream({
      dreamText: "첫 번째 꿈은 문이 많은 복도였어요.",
      moodTags: ["불안"],
      symbolTags: ["door"]
    });
    const second = store.createDream({
      dreamText: "두 번째 꿈은 물 위에 떠 있는 집이었어요.",
      moodTags: ["여운"],
      symbolTags: ["water"]
    });

    expect(first.id).not.toBe(second.id);
  });

  it("throws a user-facing error when the file path is not writable", () => {
    const store = createDreamFileStore({
      filePath: "/dev/null/dreams.json",
      seedDreams: []
    });

    expect(() =>
      store.createDream({
        dreamText: "문이 열리지 않는 탑 안에서 조용히 기다렸어요.",
        moodTags: ["불안"],
        symbolTags: ["door"]
      })
    ).toThrow("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
  });

  it("marks storage failures with a dedicated store error type", () => {
    const store = createDreamFileStore({
      filePath: "/dev/null/dreams.json",
      seedDreams: []
    });

    try {
      store.createDream({
        dreamText: "문이 열리지 않는 탑 안에서 조용히 기다렸어요.",
        moodTags: ["불안"],
        symbolTags: ["door"]
      });
      throw new Error("expected createDream to throw");
    } catch (error) {
      expect(isDreamStoreError(error)).toBe(true);
    }
  });
});
