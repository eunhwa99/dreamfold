export class DreamStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DreamStoreError";
  }
}

export function isDreamStoreError(error: unknown): error is DreamStoreError {
  return error instanceof DreamStoreError;
}

export function isDreamStoreErrorMessage(message: string | undefined) {
  return message === "꿈 데이터를 읽지 못했어요. 저장 파일을 확인해 주세요." ||
    message === "꿈 데이터를 저장할 수 없어요. 저장 경로를 확인해 주세요.";
}
