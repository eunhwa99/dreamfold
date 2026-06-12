import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { DreamStoreError } from "@/lib/dreams/store-errors";
import type { DreamEntry } from "@/lib/dreams/types";

type Options = {
  filePath: string;
  seedDreams: DreamEntry[];
};

export function formatDreamDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function cloneDreams(dreams: DreamEntry[]) {
  return dreams.map((dream) => ({
    ...dream,
    moodTags: [...dream.moodTags],
    symbolTags: [...dream.symbolTags],
      analysis: dream.analysis
      ? {
          ...dream.analysis,
          symbols: dream.analysis.symbols.map((symbol) => ({ ...symbol }))
        }
      : undefined
  }));
}

export function createDreamFileStore({ filePath, seedDreams }: Options) {
  let memoryDreams = cloneDreams(seedDreams);

  function ensureFile() {
    try {
      const directory = path.dirname(filePath);
      fs.mkdirSync(directory, { recursive: true });

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(memoryDreams, null, 2), "utf8");
      }
    } catch {
      throw new DreamStoreError("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
    }
  }

  function readDreams() {
    ensureFile();

    try {
      const dreams = JSON.parse(fs.readFileSync(filePath, "utf8")) as DreamEntry[];
      memoryDreams = cloneDreams(dreams);
      return dreams;
    } catch {
      throw new DreamStoreError("꿈 데이터를 읽지 못했어요. 저장 파일을 확인해 주세요.");
    }
  }

  function writeDreams(dreams: DreamEntry[]) {
    memoryDreams = cloneDreams(dreams);

    ensureFile();

    try {
      fs.writeFileSync(filePath, JSON.stringify(dreams, null, 2), "utf8");
    } catch {
      throw new DreamStoreError("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
    }
  }

  return {
    listDreams() {
      return readDreams();
    },
    saveDreams(dreams: DreamEntry[]) {
      writeDreams(dreams);
    },
    updateDream(id: string, updater: (dream: DreamEntry) => DreamEntry) {
      const dreams = readDreams();
      const index = dreams.findIndex((dream) => dream.id === id);

      if (index < 0) {
        return null;
      }

      dreams[index] = updater(dreams[index]);
      writeDreams(dreams);
      return dreams[index];
    },
    createDream(input: { dreamText: string; moodTags: string[]; symbolTags: string[] }) {
      const dreams = readDreams();
      const now = formatDreamDate(new Date());
      const id = `dream-${Date.now()}-${randomUUID()}`;
      const title = input.dreamText.slice(0, 22).trim() || "이름 없는 꿈";
      const dream: DreamEntry = {
        id,
        title,
        dreamText: input.dreamText,
        moodTags: input.moodTags,
        symbolTags: input.symbolTags,
        createdAt: now
      };

      writeDreams([dream, ...dreams]);
      return dream;
    }
  };
}
