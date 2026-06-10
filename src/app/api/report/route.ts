import { NextResponse } from "next/server";

import { getReport } from "@/lib/mock-store";

export async function GET() {
  return NextResponse.json(getReport());
}
