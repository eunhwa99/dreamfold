import fs from "node:fs";
import path from "node:path";

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
  let useMemoryStore = false;

  function ensureFile() {
    if (useMemoryStore) {
      return false;
    }

    try {
      const directory = path.dirname(filePath);
      fs.mkdirSync(directory, { recursive: true });

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(memoryDreams, null, 2), "utf8");
      }

      return true;
    } catch {
      useMemoryStore = true;
      return false;
    }
  }

  function readDreams() {
    if (!ensureFile()) {
      return cloneDreams(memoryDreams);
    }

    try {
      const dreams = JSON.parse(fs.readFileSync(filePath, "utf8")) as DreamEntry[];
      memoryDreams = cloneDreams(dreams);
      return dreams;
    } catch {
      useMemoryStore = true;
      return cloneDreams(memoryDreams);
    }
  }

  function writeDreams(dreams: DreamEntry[]) {
    memoryDreams = cloneDreams(dreams);

    if (!ensureFile()) {
      return;
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(dreams, null, 2), "utf8");
    } catch {
      useMemoryStore = true;
    }
  }

  return {
    listDreams() {
      return readDreams();
    },
    saveDreams(dreams: DreamEntry[]) {
      writeDreams(dreams);
    },
    createDream(input: { dreamText: string; moodTags: string[] }) {
      const dreams = readDreams();
      const now = formatDreamDate(new Date());
      const id = `dream-${Date.now()}`;
      const title = input.dreamText.slice(0, 22).trim() || "이름 없는 꿈";
      const dream: DreamEntry = {
        id,
        title,
        dreamText: input.dreamText,
        moodTags: input.moodTags,
        symbolTags: [],
        createdAt: now
      };

      writeDreams([dream, ...dreams]);
      return dream;
    }
  };
}
