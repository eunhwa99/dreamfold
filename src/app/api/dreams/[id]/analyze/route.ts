import { NextRequest, NextResponse } from "next/server";

import { createDreamSchema } from "@/lib/dreams/schema";
import { extractInterpretation } from "@/lib/dreams/interpreter";
import { analyzeDream } from "@/lib/mock-store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dream = analyzeDream(id);

  if (dream?.analysis) {
    return NextResponse.json(dream.analysis);
  }

  try {
    const payload = createDreamSchema.partial({ voiceTranscript: true }).parse(await request.json());
    if (!payload.dreamText) {
      return NextResponse.json({ error: "analysis failed" }, { status: 404 });
    }
    return NextResponse.json(extractInterpretation(payload.dreamText, payload.moodTags ?? []));
  } catch {
    return NextResponse.json({ error: "analysis failed" }, { status: 400 });
  }
}
