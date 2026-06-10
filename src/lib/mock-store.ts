import { extractInterpretation, type AnalysisResult } from "@/lib/dreams/interpreter";
import { buildDreamReport } from "@/lib/dreams/report-builder";

export type DreamEntry = {
  id: string;
  title: string;
  dreamText: string;
  moodTags: string[];
  symbolTags: string[];
  createdAt: string;
  analysis?: AnalysisResult;
};

const now = "2026.06.10";

const dreams: DreamEntry[] = [
  {
    id: "seed-school",
    title: "끝없이 이어지는 복도",
    dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
    moodTags: ["불안"],
    symbolTags: ["school", "doors", "chase"],
    createdAt: now,
    analysis: extractInterpretation("학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.", ["불안"])
  },
  {
    id: "seed-ocean",
    title: "바다 위의 집",
    dreamText: "어두운 바다 위에 집 한 채가 떠 있었고, 창문 안쪽은 이상하게 따뜻했어요.",
    moodTags: ["여운"],
    symbolTags: ["water", "house", "window"],
    createdAt: now,
    analysis: extractInterpretation("어두운 바다 위에 집 한 채가 떠 있었고, 창문 안쪽은 이상하게 따뜻했어요.", ["여운"])
  }
];

function inferSymbols(text: string) {
  const values: string[] = [];
  if (/물|바다|호수|파도/.test(text)) values.push("water");
  if (/집|방|창문|문/.test(text)) values.push("house");
  if (/학교|교실|시험|복도/.test(text)) values.push("school");
  if (/하늘|달|별|날아/.test(text)) values.push("sky");
  if (/쫓|도망|늦|놓치/.test(text)) values.push("chase");
  return values.length > 0 ? values : ["mist"];
}

export function listDreams() {
  return dreams.slice().sort((a, b) => b.id.localeCompare(a.id));
}

export function getDream(id: string) {
  return dreams.find((dream) => dream.id === id) ?? null;
}

export function createDream(input: { dreamText: string; moodTags: string[] }) {
  const id = `dream-${dreams.length + 1}`;
  const title = input.dreamText.slice(0, 22).trim() || "이름 없는 꿈";
  const dream: DreamEntry = {
    id,
    title,
    dreamText: input.dreamText,
    moodTags: input.moodTags,
    symbolTags: inferSymbols(input.dreamText),
    createdAt: now
  };
  dreams.unshift(dream);
  return dream;
}

export function analyzeDream(id: string) {
  const dream = getDream(id);
  if (!dream) return null;
  const analysis = extractInterpretation(dream.dreamText, dream.moodTags);
  dream.analysis = analysis;
  dream.symbolTags = [...new Set([...dream.symbolTags, ...analysis.symbols.map((symbol) => symbol.name)])];
  return dream;
}

export function getReport() {
  return buildDreamReport(dreams.map((dream) => ({ moodTags: dream.moodTags, symbolTags: dream.symbolTags })));
}
