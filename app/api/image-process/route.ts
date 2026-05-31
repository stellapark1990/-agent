import { NextRequest, NextResponse } from "next/server";
import { generate3DRender } from "@/lib/hunyuan";

export const runtime = "nodejs";
export const maxDuration = 15; // 只提交任务，秒级完成

const API_KEY = process.env.DASHSCOPE_API_KEY!;

// 提交 wan2.5-i2i 任务，立即返回 taskId
async function submitWan25Edit(base64DataUrl: string, prompt: string, taskName: string): Promise<string> {
  const res = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan2.5-i2i-preview",
        input: {
          images: [base64DataUrl],
          prompt,
        },
        parameters: { n: 1 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || !data.output?.task_id) {
    throw new Error(data.message ?? data.code ?? `${taskName}任务提交失败`);
  }
  return data.output.task_id;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, productDesc, variant, scenePrompt } = await req.json();

    let taskId = "";

    switch (variant) {
      case "white":
        taskId = await submitWan25Edit(
          imageBase64,
          "保留原图中的主商品，将背景完全去除并替换为纯白背景，进行商业级别精修：去除划痕和瑕疵，增强光影立体感，凸显材质质感和高级感，提升整体亮度，电商标准白底产品图",
          "白底图"
        );
        break;
      case "texture":
        taskId = await submitWan25Edit(
          imageBase64,
          "保留原图中的主商品，将背景替换为高端大理石质感背景，柔和摄影棚光线，奢华商品陈列，浅景深，高端商业摄影风格",
          "质感图"
        );
        break;
      case "scene":
        taskId = await submitWan25Edit(
          imageBase64,
          scenePrompt || "clean product photography",
          "场景图"
        );
        break;
      case "3d":
        // 3D 渲染走腾讯混元，保持原有同步逻辑
        const url = await generate3DRender(productDesc || "product", imageBase64);
        return NextResponse.json({ success: true, url });
      default:
        return NextResponse.json({ success: false, error: `未知 variant: ${variant}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, taskId });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
