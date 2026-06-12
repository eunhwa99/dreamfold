import { NextRequest, NextResponse } from "next/server";

import { analyzeDream } from "@/lib/mock-store";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dream = analyzeDream(id);

  if (dream?.analysis) {
    return NextResponse.json(dream.analysis);
  }

  return NextResponse.json({ error: "dream not found" }, { status: 404 });
}
