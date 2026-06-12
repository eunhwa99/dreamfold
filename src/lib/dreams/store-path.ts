import path from "node:path";

export function resolveDreamStoreFilePath() {
  const dataDirectory = process.env.DREAMFOLD_DATA_DIR ?? path.join(process.cwd(), ".dreamfold-data");
  return path.join(dataDirectory, "dreams.json");
}
