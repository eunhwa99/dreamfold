import { NextResponse } from "next/server";

import { readGeneratedDreamImage } from "@/lib/dreams/image-store";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const image = readGeneratedDreamImage(filename);

    if (!image) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=60"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "저장된 꿈 이미지를 읽지 못했어요. 저장 경로를 확인해 주세요.";
    return new NextResponse(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
}
