import { afterEach, describe, expect, it } from "vitest";

import { resolveDreamStoreFilePath } from "@/lib/dreams/store-path";

const originalDataDir = process.env.DREAMFOLD_DATA_DIR;

afterEach(() => {
  if (originalDataDir === undefined) {
    delete process.env.DREAMFOLD_DATA_DIR;
    return;
  }

  process.env.DREAMFOLD_DATA_DIR = originalDataDir;
});

describe("resolveDreamStoreFilePath", () => {
  it("uses DREAMFOLD_DATA_DIR when provided", () => {
    process.env.DREAMFOLD_DATA_DIR = "/tmp/dreamfold-isolated";

    expect(resolveDreamStoreFilePath()).toBe("/tmp/dreamfold-isolated/dreams.json");
  });
});
