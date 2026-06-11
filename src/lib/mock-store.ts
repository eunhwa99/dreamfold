import path from "node:path";

import { extractInterpretation } from "@/lib/dreams/interpreter";
import { buildDreamReport } from "@/lib/dreams/report-builder";
import { createDreamFileStore } from "@/lib/dreams/file-store";
import type { DreamEntry } from "@/lib/dreams/types";

const now = "2026.06.10";

const seedDreams: DreamEntry[] = [
  {
    id: "seed-school",
    title: "끝없이 이어지는 복도",
    dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
    moodTags: ["불안"],
    symbolTags: ["school", "door", "chase"],
    createdAt: now,
    analysis: extractInterpretation("학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.", ["불안"])
  },
  {
    id: "seed-ocean",
    title: "바다 위의 집",
    dreamText: "어두운 바다 위에 집 한 채가 떠 있었고, 창문 안쪽은 이상하게 따뜻했어요.",
    moodTags: ["여운"],
    symbolTags: ["water", "house", "door"],
    createdAt: now,
    analysis: extractInterpretation("어두운 바다 위에 집 한 채가 떠 있었고, 창문 안쪽은 이상하게 따뜻했어요.", ["여운"])
  }
];

const store = createDreamFileStore({
  filePath: path.join(process.cwd(), ".dreamfold-data", "dreams.json"),
  seedDreams
});

function inferSymbols(text: string) {
  const values: string[] = [];
  if (/물|바다|호수|파도/.test(text)) values.push("water");
  if (/집|방/.test(text)) values.push("house");
  if (/창문|문/.test(text)) values.push("door");
  if (/학교|교실|시험|복도/.test(text)) values.push("school");
  if (/하늘|달|별|날아/.test(text)) values.push("sky");
  if (/쫓|도망|늦|놓치/.test(text)) values.push("chase");
  return values.length > 0 ? values : ["mist"];
}

export function listDreams() {
  return store.listDreams();
}

export function getDream(id: string) {
  return listDreams().find((dream) => dream.id === id) ?? null;
}

export function createDream(input: { dreamText: string; moodTags: string[] }) {
  const dream = store.createDream(input);
  const dreams = listDreams();
  const updatedDreams = dreams.map((entry) =>
    entry.id === dream.id
      ? {
          ...entry,
          symbolTags: inferSymbols(entry.dreamText)
        }
      : entry
  );
  store.saveDreams(updatedDreams);
  return dream;
}

export function analyzeDream(id: string) {
  const dreams = listDreams();
  const dream = dreams.find((entry) => entry.id === id);
  if (!dream) return null;
  const analysis = extractInterpretation(dream.dreamText, dream.moodTags);
  dream.analysis = analysis;
  dream.symbolTags = [...new Set([...dream.symbolTags, ...analysis.symbols.map((symbol) => symbol.name)])];
  store.saveDreams(dreams);
  return dream;
}

export function getReport() {
  return buildDreamReport(
    listDreams().map((dream) => ({
      moodTags: dream.moodTags,
      symbolTags: dream.symbolTags,
      title: dream.title,
      createdAt: dream.createdAt
    }))
  );
}

export function listAvailableMoods() {
  return [...new Set(listDreams().flatMap((dream) => dream.moodTags))];
}

export function filterDreamsByMood(dreams: DreamEntry[], mood: string | null) {
  if (!mood) {
    return dreams;
  }

  return dreams.filter((dream) => dream.moodTags.includes(mood));
}
