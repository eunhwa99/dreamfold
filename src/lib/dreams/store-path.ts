import path from "node:path";

export function resolveDreamDataDirectory() {
  return process.env.DREAMFOLD_DATA_DIR ?? path.join(process.cwd(), ".dreamfold-data");
}

export function resolveDreamStoreFilePath() {
  return path.join(resolveDreamDataDirectory(), "dreams.json");
}
