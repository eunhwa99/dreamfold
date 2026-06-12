import { deleteGeneratedDreamImage, saveGeneratedDreamImage } from "@/lib/dreams/image-store";
import { isLegacyMockAnalysis } from "@/lib/dreams/legacy-analysis";
import { generateDreamAnalysis } from "@/lib/dreams/openai-client";
import { generateDreamSceneImage } from "@/lib/dreams/openai-client";
import { buildDreamReport } from "@/lib/dreams/report-builder";
import { createDreamFileStore } from "@/lib/dreams/file-store";
import { resolveDreamStoreFilePath } from "@/lib/dreams/store-path";
import type { DreamEntry } from "@/lib/dreams/types";

const now = "2026.06.10";

const seedDreams: DreamEntry[] =
  process.env.DREAMFOLD_ENABLE_SEED_DATA === "1"
    ? [
        {
          id: "seed-school",
          title: "끝없이 이어지는 복도",
          dreamText: "학교 복도를 끝없이 달리는데 문이 하나씩 닫히고 있었어요.",
          moodTags: ["불안"],
          symbolTags: ["school", "door", "chase"],
          createdAt: now
        },
        {
          id: "seed-ocean",
          title: "바다 위의 집",
          dreamText: "어두운 바다 위에 집 한 채가 떠 있었고, 창문 안쪽은 이상하게 따뜻했어요.",
          moodTags: ["여운"],
          symbolTags: ["water", "house", "door"],
          createdAt: now
        }
      ]
    : [];

const store = createDreamFileStore({
  filePath: resolveDreamStoreFilePath(),
  seedDreams
});
const inFlightAnalysis = new Map<string, ReturnType<typeof runDreamAnalysisCore>>();
const inFlightImage = new Map<string, ReturnType<typeof generateDreamImageCore>>();

function resolveAnalysisRequestKey(id: string, moodTagsOverride?: string[]) {
  return `${id}::${JSON.stringify(moodTagsOverride ?? [])}`;
}

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
  return store.createDream({
    ...input,
    symbolTags: inferSymbols(input.dreamText)
  });
}

async function runDreamAnalysisCore(id: string, moodTagsOverride?: string[]) {
  const dream = getDream(id);
  if (!dream) return null;
  if (dream.analysis && !isLegacyMockAnalysis(dream.analysis)) return dream.analysis;

  const analysis = await generateDreamAnalysis({
    dreamText: dream.dreamText,
    moodTags: moodTagsOverride ?? dream.moodTags
  });

  const updatedDream = store.updateDream(id, (currentDream) => {
    if (currentDream.analysis && !isLegacyMockAnalysis(currentDream.analysis)) {
      return currentDream;
    }

    return {
      ...currentDream,
      analysis: {
        ...analysis,
        imagePath: undefined,
        imagePrompt: undefined,
        imageGeneratedAt: undefined
      },
      moodTags: moodTagsOverride ?? currentDream.moodTags,
      symbolTags: [...new Set(analysis.symbols.map((symbol) => symbol.name))]
    };
  });

  return updatedDream?.analysis ?? null;
}

export async function runDreamAnalysis(id: string, moodTagsOverride?: string[]) {
  const requestKey = resolveAnalysisRequestKey(id, moodTagsOverride);
  const existing = inFlightAnalysis.get(requestKey);
  if (existing) {
    return existing;
  }

  const pending = runDreamAnalysisCore(id, moodTagsOverride);
  inFlightAnalysis.set(requestKey, pending);

  try {
    return await pending;
  } finally {
    if (inFlightAnalysis.get(requestKey) === pending) {
      inFlightAnalysis.delete(requestKey);
    }
  }
}

async function generateDreamImageCore(_id: string) {
  const dream = getDream(_id);

  if (!dream) {
    return { status: "missing-dream" as const };
  }

  if (!dream.analysis) {
    return { status: "missing-analysis" as const };
  }

  if (isLegacyMockAnalysis(dream.analysis)) {
    return { status: "legacy-analysis" as const };
  }

  const image = await generateDreamSceneImage(dream.analysis.scenePrompt);
  const imagePath = saveGeneratedDreamImage({
    dreamId: dream.id,
    imageBase64: image.imageBase64
  });
  let previousImagePath: string | undefined;
  let updatedDream;

  try {
    updatedDream = store.updateDream(_id, (currentDream) => {
      if (!currentDream.analysis || isLegacyMockAnalysis(currentDream.analysis)) {
        return currentDream;
      }

      previousImagePath = currentDream.analysis.imagePath;

      return {
        ...currentDream,
        analysis: {
          ...currentDream.analysis,
          imagePath,
          imagePrompt: image.revisedPrompt,
          imageGeneratedAt: new Date().toISOString()
        }
      };
    });
  } catch (error) {
    deleteGeneratedDreamImage(imagePath);
    throw error;
  }

  if (!updatedDream) {
    deleteGeneratedDreamImage(imagePath);
    return { status: "missing-dream" as const };
  }

  if (!updatedDream.analysis) {
    deleteGeneratedDreamImage(imagePath);
    return { status: "missing-analysis" as const };
  }

  if (isLegacyMockAnalysis(updatedDream.analysis)) {
    deleteGeneratedDreamImage(imagePath);
    return { status: "legacy-analysis" as const };
  }

  deleteGeneratedDreamImage(previousImagePath);

  return {
    status: "ok" as const,
    analysis: updatedDream.analysis
  };
}

export async function generateDreamImage(id: string) {
  const existing = inFlightImage.get(id);
  if (existing) {
    return existing;
  }

  const pending = generateDreamImageCore(id);
  inFlightImage.set(id, pending);

  try {
    return await pending;
  } finally {
    if (inFlightImage.get(id) === pending) {
      inFlightImage.delete(id);
    }
  }
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
