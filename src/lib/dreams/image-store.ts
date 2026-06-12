import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { resolveDreamDataDirectory } from "@/lib/dreams/store-path";

const GENERATED_DREAM_IMAGE_PREFIX = "/generated-dreams/";

function resolveGeneratedDreamImageDirectory() {
  return path.join(resolveDreamDataDirectory(), "generated-dreams");
}

function sanitizeDreamId(dreamId: string) {
  return dreamId.replace(/[^a-zA-Z0-9-]/g, "-");
}

function resolveGeneratedDreamImageFilename(imagePath: string | undefined) {
  if (!imagePath?.startsWith(GENERATED_DREAM_IMAGE_PREFIX)) {
    return null;
  }

  const filename = imagePath.slice(GENERATED_DREAM_IMAGE_PREFIX.length);
  return /^(?:[a-zA-Z0-9-]+|[a-zA-Z0-9-]+-\d+|[a-zA-Z0-9-]+-\d+-[a-f0-9-]+)\.png$/.test(filename) ? filename : null;
}

export function saveGeneratedDreamImage(input: { dreamId: string; imageBase64: string }) {
  try {
    const directory = resolveGeneratedDreamImageDirectory();
    fs.mkdirSync(directory, { recursive: true });

    const sanitizedDreamId = sanitizeDreamId(input.dreamId);
    const filename = `${sanitizedDreamId}-${Date.now()}-${randomUUID()}.png`;
    const filePath = path.join(directory, filename);
    fs.writeFileSync(filePath, Buffer.from(input.imageBase64, "base64"));

    return `/generated-dreams/${filename}`;
  } catch {
    throw new Error("이미지를 저장하지 못했어요. 저장 경로를 확인해 주세요.");
  }
}

export function deleteGeneratedDreamImage(imagePath: string | undefined, options?: { strict?: boolean }) {
  const filename = resolveGeneratedDreamImageFilename(imagePath);
  if (!filename) {
    return;
  }

  try {
    const filePath = path.join(resolveGeneratedDreamImageDirectory(), filename);
    fs.rmSync(filePath, { force: true });
  } catch {
    if (options?.strict) {
      throw new Error("이전 이미지를 정리하지 못했어요. 저장 경로를 확인해 주세요.");
    }
  }
}

export function readGeneratedDreamImage(filename: string) {
  if (!resolveGeneratedDreamImageFilename(`${GENERATED_DREAM_IMAGE_PREFIX}${filename}`)) {
    return null;
  }

  try {
    const filePath = path.join(resolveGeneratedDreamImageDirectory(), filename);
    return fs.readFileSync(filePath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw new Error("저장된 꿈 이미지를 읽지 못했어요. 저장 경로를 확인해 주세요.");
  }
}
