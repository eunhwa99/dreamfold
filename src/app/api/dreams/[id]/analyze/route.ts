import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { runDreamAnalysis } from "@/lib/mock-store";

const retryAnalyzeBodySchema = z.object({
  moodTags: z.array(z.string().min(1)).max(5).default([])
});

function resolveUserFacingError(error: unknown) {
  if (error instanceof Error && error.message && /[가-힣]/.test(error.message)) {
    return error.message;
  }

  return "해몽을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function resolveErrorStatus(error: unknown) {
  if (error instanceof Error && error.message.includes("안전 정책")) {
    return 400;
  }

  return 500;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let moodTags: string[] | undefined;
    const rawBody = await request.text();

    if (rawBody.trim().length > 0) {
      moodTags = retryAnalyzeBodySchema.parse(JSON.parse(rawBody)).moodTags;
    }

    const analysis = await runDreamAnalysis(id, moodTags);

    if (analysis) {
      return NextResponse.json(analysis);
    }

    return NextResponse.json({ error: "꿈 기록을 찾지 못했어요." }, { status: 404 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return NextResponse.json({ error: "감정 태그를 다시 확인해 주세요." }, { status: 400 });
    }

    return NextResponse.json({ error: resolveUserFacingError(error) }, { status: resolveErrorStatus(error) });
  }
}
