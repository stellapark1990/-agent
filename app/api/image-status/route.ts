import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

const API_KEY = process.env.DASHSCOPE_API_KEY!;

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ success: false, error: "缺少 taskId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    const data = await res.json();
    const status = data.output?.task_status;

    if (status === "SUCCEEDED") {
      const url =
        data.output?.results?.[0]?.url ??
        data.output?.results?.[0]?.image_url ??
        data.output?.output_image_url ??
        "";
      return NextResponse.json({ success: true, status: "SUCCEEDED", url });
    }

    if (status === "FAILED") {
      return NextResponse.json({ success: false, status: "FAILED", error: JSON.stringify(data.output) });
    }

    // PENDING / RUNNING
    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
