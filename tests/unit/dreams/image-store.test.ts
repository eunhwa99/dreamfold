import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  delete process.env.DREAMFOLD_DATA_DIR;
  vi.restoreAllMocks();

  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("generated dream image store", () => {
  it("writes and reads generated images inside DREAMFOLD_DATA_DIR", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-images-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    const { readGeneratedDreamImage, saveGeneratedDreamImage } = await import("@/lib/dreams/image-store");
    const imagePath = saveGeneratedDreamImage({
      dreamId: "dream-1",
      imageBase64: Buffer.from("hello").toString("base64")
    });

    expect(imagePath).toMatch(/^\/generated-dreams\/dream-1-\d+-[a-f0-9-]+\.png$/);
    const filename = imagePath.replace("/generated-dreams/", "");
    const storedFile = path.join(dir, "generated-dreams", filename);

    expect(fs.existsSync(storedFile)).toBe(true);
    expect(readGeneratedDreamImage(filename)?.toString("utf8")).toBe("hello");
  });

  it("sanitizes dream ids before building image filenames", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-images-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    const { saveGeneratedDreamImage } = await import("@/lib/dreams/image-store");
    const imagePath = saveGeneratedDreamImage({
      dreamId: "../outside",
      imageBase64: Buffer.from("hello").toString("base64")
    });

    expect(imagePath).toMatch(/^\/generated-dreams\/---outside-\d+-[a-f0-9-]+\.png$/);
    expect(fs.existsSync(path.join(dir, "generated-dreams"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "outside"))).toBe(false);
  });

  it("keeps regenerated filenames unique even within the same millisecond", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-images-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    const { saveGeneratedDreamImage } = await import("@/lib/dreams/image-store");
    const firstPath = saveGeneratedDreamImage({
      dreamId: "dream-1",
      imageBase64: Buffer.from("hello").toString("base64")
    });
    const secondPath = saveGeneratedDreamImage({
      dreamId: "dream-1",
      imageBase64: Buffer.from("world").toString("base64")
    });

    expect(firstPath).not.toBe(secondPath);
    expect(fs.existsSync(path.join(dir, firstPath.replace(/^\//, "")))).toBe(true);
    expect(fs.existsSync(path.join(dir, secondPath.replace(/^\//, "")))).toBe(true);
  });

  it("ignores poisoned cleanup paths outside the image directory", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamfold-images-"));
    tempDirs.push(dir);
    process.env.DREAMFOLD_DATA_DIR = dir;

    const dreamsFile = path.join(dir, "dreams.json");
    fs.writeFileSync(dreamsFile, "[]", "utf8");

    const { deleteGeneratedDreamImage } = await import("@/lib/dreams/image-store");
    deleteGeneratedDreamImage("/generated-dreams/../../dreams.json", { strict: true });

    expect(fs.readFileSync(dreamsFile, "utf8")).toBe("[]");
  });
});
