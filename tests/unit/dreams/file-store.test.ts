import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createDreamFileStore, formatDreamDate } from "@/lib/dreams/file-store";

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
      moodTags: ["안도"]
    });

    const reloaded = createDreamFileStore({
      filePath: path.join(dir, "dreams.json"),
      seedDreams: []
    });

    expect(created.id).toBeTruthy();
    expect(reloaded.listDreams()[0]?.dreamText).toContain("파도");
  });

  it("falls back to in-memory storage when the file path is not writable", () => {
    const store = createDreamFileStore({
      filePath: "/dev/null/dreams.json",
      seedDreams: []
    });

    const created = store.createDream({
      dreamText: "문이 열리지 않는 탑 안에서 조용히 기다렸어요.",
      moodTags: ["불안"]
    });

    expect(created.createdAt).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
    expect(store.listDreams()[0]?.dreamText).toContain("문이 열리지 않는 탑");
  });
});
