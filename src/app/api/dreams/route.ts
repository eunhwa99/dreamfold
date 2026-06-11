import { NextRequest, NextResponse } from "next/server";

import { createDreamSchema, resolveCreateDreamInput } from "@/lib/dreams/schema";
import { createDream } from "@/lib/mock-store";

export async function POST(request: NextRequest) {
  try {
    const payload = createDreamSchema.parse(await request.json());
    const dream = createDream(resolveCreateDreamInput(payload));
    return NextResponse.json({ dreamId: dream.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "꿈 기록은 조금 더 자세히 적어주세요." }, { status: 400 });
  }
}
