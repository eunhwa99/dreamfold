import { NextRequest, NextResponse } from "next/server";

import { generateDreamImage } from "@/lib/mock-store";

function resolveUserFacingError(error: unknown) {
  if (error instanceof Error && error.message && /[가-힣]/.test(error.message)) {
    return error.message;
  }

  return "이미지를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function resolveErrorStatus(error: unknown) {
  if (error instanceof Error && error.message.includes("안전 정책")) {
    return 400;
  }

  return 500;
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await generateDreamImage(id);

    if (result.status === "missing-dream") {
      return NextResponse.json({ error: "꿈 기록을 찾지 못했어요." }, { status: 404 });
    }

    if (result.status === "missing-analysis") {
      return NextResponse.json({ error: "먼저 해몽을 생성해 주세요." }, { status: 409 });
    }

    if (result.status === "legacy-analysis") {
      return NextResponse.json({ error: "예전 해몽이라 먼저 AI 해몽을 새로 불러와야 해요." }, { status: 409 });
    }

    return NextResponse.json(result.analysis);
  } catch (error) {
    return NextResponse.json({ error: resolveUserFacingError(error) }, { status: resolveErrorStatus(error) });
  }
}
