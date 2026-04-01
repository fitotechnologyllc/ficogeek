import { NextRequest, NextResponse } from "next/server";
import { refineLetterBody } from "@/lib/ai/letter-engine";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ success: false, message: "Missing content" }, { status: 400 });
    }

    const refined = await refineLetterBody(content);

    return NextResponse.json({
      success: true,
      refinedContent: refined
    });

  } catch (err: any) {
    console.error("Refine API Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
