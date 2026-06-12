export async function readUserFacingError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error && /[가-힣]/.test(payload.error)) {
      return payload.error;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
