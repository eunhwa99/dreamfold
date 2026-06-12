import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  delete process.env.DREAMFOLD_DATA_DIR;
  delete process.env.DREAMFOLD_ENABLE_SEED_DATA;
  vi.restoreAllMocks();
  vi.resetModules();
  vi.doUnmock("@/lib/dreams/openai-client");

  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("mock store async updates", () => {
  it("preserves dreams created while analysis is waiting on OpenAI", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    let resolveAnalysis: ((value: {
      interpretation: string;
      emotionalSummary: string;
      currentStateReflection: string;
      dominantScene: string;
      sceneSummary: string;
      scenePrompt: string;
      symbols: Array<{ name: string; label: string; meaning: string }>;
      source: "openai";
    }) => void) | null = null;

    const analysisPromise = new Promise<{
      interpretation: string;
      emotionalSummary: string;
      currentStateReflection: string;
      dominantScene: string;
      sceneSummary: string;
      scenePrompt: string;
      symbols: Array<{ name: string; label: string; meaning: string }>;
      source: "openai";
    }>((resolve) => {
      resolveAnalysis = resolve;
    });

    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(() => analysisPromise),
      generateDreamSceneImage: vi.fn()
    }));

    const { createDream, listDreams, runDreamAnalysis } = await import("@/lib/mock-store");
    const firstDream = createDream({
      dreamText: "첫 번째 꿈에서 학교 복도를 달리고 있었어요.",
      moodTags: ["불안"]
    });

    const pendingAnalysis = runDreamAnalysis(firstDream.id);
    const secondDream = createDream({
      dreamText: "두 번째 꿈에서는 바다 위의 집을 바라봤어요.",
      moodTags: ["여운"]
    });

    resolveAnalysis?.({
      interpretation: "해석",
      emotionalSummary: "감정",
      currentStateReflection: "상태",
      dominantScene: "장면",
      sceneSummary: "요약",
      scenePrompt: "prompt",
      symbols: [{ name: "door", label: "문", meaning: "경계" }],
      source: "openai"
    });

    await pendingAnalysis;

    const dreams = listDreams();
    expect(dreams).toHaveLength(2);
    expect(dreams.some((dream) => dream.id === secondDream.id)).toBe(true);
    expect(dreams.find((dream) => dream.id === firstDream.id)?.analysis?.source).toBe("openai");
  });

  it("deduplicates concurrent analysis requests for the same dream", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    let resolveAnalysis: ((value: {
      interpretation: string;
      emotionalSummary: string;
      currentStateReflection: string;
      dominantScene: string;
      sceneSummary: string;
      scenePrompt: string;
      symbols: Array<{ name: string; label: string; meaning: string }>;
      source: "openai";
    }) => void) | null = null;

    const generateDreamAnalysisMock = vi.fn(
      () =>
        new Promise<{
          interpretation: string;
          emotionalSummary: string;
          currentStateReflection: string;
          dominantScene: string;
          sceneSummary: string;
          scenePrompt: string;
          symbols: Array<{ name: string; label: string; meaning: string }>;
          source: "openai";
        }>((resolve) => {
          resolveAnalysis = resolve;
        })
    );

    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: generateDreamAnalysisMock,
      generateDreamSceneImage: vi.fn()
    }));

    const { createDream, runDreamAnalysis } = await import("@/lib/mock-store");
    const dream = createDream({
      dreamText: "학교 복도를 달리다가 닫히는 문을 본 꿈이었어요.",
      moodTags: ["불안"]
    });

    const first = runDreamAnalysis(dream.id);
    const second = runDreamAnalysis(dream.id);

    expect(generateDreamAnalysisMock).toHaveBeenCalledTimes(1);

    resolveAnalysis?.({
      interpretation: "해석",
      emotionalSummary: "감정",
      currentStateReflection: "상태",
      dominantScene: "장면",
      sceneSummary: "요약",
      scenePrompt: "prompt",
      symbols: [{ name: "door", label: "문", meaning: "경계" }],
      source: "openai"
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult).toEqual(secondResult);
  });

  it("replaces heuristic symbol tags with canonical AI symbols after analysis", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(async () => ({
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "prompt",
        symbols: [{ name: "water", label: "물", meaning: "감정" }],
        source: "openai" as const
      })),
      generateDreamSceneImage: vi.fn()
    }));

    const { createDream, listDreams, runDreamAnalysis } = await import("@/lib/mock-store");
    const dream = createDream({
      dreamText: "학교 복도를 달리다가 바다가 열린 창문을 보는 꿈이었어요.",
      moodTags: ["불안"]
    });

    await runDreamAnalysis(dream.id);

    expect(listDreams().find((entry) => entry.id === dream.id)?.symbolTags).toEqual(["water"]);
  });

  it("deduplicates canonical symbol tags when the model returns alias-colliding symbols", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(async () => ({
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "prompt",
        symbols: [
          { name: "door", label: "문", meaning: "경계" },
          { name: "door", label: "문", meaning: "경계" }
        ],
        source: "openai" as const
      })),
      generateDreamSceneImage: vi.fn()
    }));

    const { createDream, listDreams, runDreamAnalysis } = await import("@/lib/mock-store");
    const dream = createDream({
      dreamText: "닫힌 문과 또 다른 문이 이어지는 복도를 걷는 꿈이었어요.",
      moodTags: ["불안"]
    });

    await runDreamAnalysis(dream.id);

    expect(listDreams().find((entry) => entry.id === dream.id)?.symbolTags).toEqual(["door"]);
  });

  it("updates persisted mood tags when a retry analysis provides a new mood selection", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(async () => ({
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "prompt",
        symbols: [],
        source: "openai" as const
      })),
      generateDreamSceneImage: vi.fn()
    }));

    const { createDream, listDreams, runDreamAnalysis } = await import("@/lib/mock-store");
    const dream = createDream({
      dreamText: "유리 복도 끝에서 바람을 듣는 꿈이었어요.",
      moodTags: ["불안"]
    });

    await runDreamAnalysis(dream.id, ["안도"]);

    const storedDream = listDreams().find((entry) => entry.id === dream.id);
    expect(storedDream?.moodTags).toEqual(["안도"]);
    expect(storedDream?.symbolTags).toEqual([]);
  });

  it("cleans up a generated image file when metadata persistence fails", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    const createDreamMock = vi.fn(() => ({
      id: "dream-1",
      title: "꿈",
      dreamText: "학교 복도를 달리는 꿈",
      moodTags: ["불안"],
      symbolTags: ["school"],
      createdAt: "2026.06.12"
    }));
    const listDreamsMock = vi.fn(() => [{
      id: "dream-1",
      title: "꿈",
      dreamText: "학교 복도를 달리는 꿈",
      moodTags: ["불안"],
      symbolTags: ["school"],
      createdAt: "2026.06.12",
      analysis: {
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "prompt",
        symbols: [{ name: "school", label: "학교", meaning: "상징" }],
        source: "openai" as const
      }
    }]);
    const updateDreamMock = vi.fn(() => {
      throw new Error("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
    });
    const saveGeneratedDreamImageMock = vi.fn(() => "/generated-dreams/dream-1-1-uuid.png");
    const deleteGeneratedDreamImageMock = vi.fn();

    vi.doMock("@/lib/dreams/file-store", () => ({
      createDreamFileStore: vi.fn(() => ({
        listDreams: listDreamsMock,
        saveDreams: vi.fn(),
        updateDream: updateDreamMock,
        createDream: createDreamMock
      })),
      formatDreamDate: vi.fn()
    }));
    vi.doMock("@/lib/dreams/image-store", () => ({
      saveGeneratedDreamImage: saveGeneratedDreamImageMock,
      deleteGeneratedDreamImage: deleteGeneratedDreamImageMock
    }));
    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(),
      generateDreamSceneImage: vi.fn(async () => ({
        imageBase64: Buffer.from("hello").toString("base64"),
        revisedPrompt: "prompt"
      }))
    }));

    const { generateDreamImage } = await import("@/lib/mock-store");

    await expect(generateDreamImage("dream-1")).rejects.toThrow("꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.");
    expect(deleteGeneratedDreamImageMock).toHaveBeenCalledWith("/generated-dreams/dream-1-1-uuid.png");
  });

  it("deduplicates concurrent image generation requests for the same dream", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-store-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    const dreams = [{
      id: "dream-1",
      title: "꿈",
      dreamText: "학교 복도를 달리는 꿈",
      moodTags: ["불안"],
      symbolTags: ["school"],
      createdAt: "2026.06.12",
      analysis: {
        interpretation: "해석",
        emotionalSummary: "감정",
        currentStateReflection: "상태",
        dominantScene: "장면",
        sceneSummary: "요약",
        scenePrompt: "prompt",
        symbols: [{ name: "school", label: "학교", meaning: "상징" }],
        source: "openai" as const
      }
    }];

    let resolveImage: ((value: { imageBase64: string; revisedPrompt: string }) => void) | null = null;
    const generateDreamSceneImageMock = vi.fn(
      () =>
        new Promise<{ imageBase64: string; revisedPrompt: string }>((resolve) => {
          resolveImage = resolve;
        })
    );

    vi.doMock("@/lib/dreams/file-store", () => ({
      createDreamFileStore: vi.fn(() => ({
        listDreams: vi.fn(() => dreams),
        saveDreams: vi.fn(),
        updateDream: vi.fn((id: string, updater: (dream: typeof dreams[number]) => typeof dreams[number]) => {
          const nextDream = updater(dreams[0]);
          dreams[0] = nextDream;
          return nextDream;
        }),
        createDream: vi.fn()
      })),
      formatDreamDate: vi.fn()
    }));
    vi.doMock("@/lib/dreams/image-store", () => ({
      saveGeneratedDreamImage: vi.fn(() => "/generated-dreams/dream-1-1-uuid.png"),
      deleteGeneratedDreamImage: vi.fn()
    }));
    vi.doMock("@/lib/dreams/openai-client", () => ({
      generateDreamAnalysis: vi.fn(),
      generateDreamSceneImage: generateDreamSceneImageMock
    }));

    const { generateDreamImage } = await import("@/lib/mock-store");

    const first = generateDreamImage("dream-1");
    const second = generateDreamImage("dream-1");

    expect(generateDreamSceneImageMock).toHaveBeenCalledTimes(1);

    resolveImage?.({
      imageBase64: Buffer.from("hello").toString("base64"),
      revisedPrompt: "prompt"
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult).toEqual(secondResult);
  });
});
