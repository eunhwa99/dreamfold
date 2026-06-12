import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createDreamSchema, resolveCreateDreamInput } from "@/lib/dreams/schema";
import { createDream } from "@/lib/mock-store";

function resolveUserFacingError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message && /[가-힣]/.test(error.message)) {
    return error.message;
  }

  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const payload = createDreamSchema.parse(await request.json());
    const input = resolveCreateDreamInput(payload);
    const dream = createDream(input);
    return NextResponse.json({ dreamId: dream.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "꿈 기록은 조금 더 자세히 적어주세요." }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "꿈 기록은 조금 더 자세히 적어주세요." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: resolveUserFacingError(error, "꿈 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.") },
      { status: 500 }
    );
  }
}
