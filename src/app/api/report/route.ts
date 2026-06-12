import { NextResponse } from "next/server";

import { getReport } from "@/lib/mock-store";

export async function GET() {
  try {
    return NextResponse.json(getReport());
  } catch (error) {
    const message =
      error instanceof Error && error.message && /[가-힣]/.test(error.message)
        ? error.message
        : "꿈 데이터를 읽지 못했어요. 저장 파일을 확인해 주세요.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
