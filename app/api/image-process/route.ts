import { NextRequest, NextResponse } from "next/server";
import { generate3DRender } from "@/lib/hunyuan";

export const runtime = "nodejs";
export const maxDuration = 120; // 轮询最长 2 分钟

const API_KEY = process.env.DASHSCOPE_API_KEY!;

// ─── DashScope 工具 ──────────────────────────────────────────────────────────

async function pollDashScope(taskId: string, maxTries = 30): Promise<string> {
  for (let i = 0; i < maxTries; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    const status = data.output?.task_status;
    if (status === "SUCCEEDED") {
      return (
        data.output?.results?.[0]?.url ??
        data.output?.results?.[0]?.image_url ??
        data.output?.output_image_url ??
        ""
      );
    }
    if (status === "FAILED") throw new Error(`任务失败: ${JSON.stringify(data.output)}`);
  }
  throw new Error("轮询超时");
}

// wan2.5-i2i-preview：接受 RGB data URI，图像理解 + 文本引导编辑，质量高于 wanx2.1-imageedit
async function callWan25Edit(base64DataUrl: string, prompt: string, taskName: string): Promise<string> {
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
          images: [base64DataUrl],   // 接受 data:image/jpeg;base64,... 格式
          prompt,
        },
        parameters: { n: 1 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || !data.output?.task_id) {
    throw new Error(data.message ?? data.code ?? `${taskName}任务创建失败`);
  }
  return pollDashScope(data.output.task_id);
}

// 白底图：基于原图抠图 + 白底 + 商业精修（wan2.5-i2i-preview）
async function generateWhiteBg(base64DataUrl: string): Promise<string> {
  return callWan25Edit(
    base64DataUrl,
    "保留原图中的主商品，将背景完全去除并替换为纯白背景，进行商业级别精修：去除划痕和瑕疵，增强光影立体感，凸显材质质感和高级感，提升整体亮度，电商标准白底产品图",
    "白底图"
  );
}

// 质感图：抠图 + 高端质感背景
async function generateTextureBg(base64DataUrl: string): Promise<string> {
  return callWan25Edit(
    base64DataUrl,
    "保留原图中的主商品，将背景替换为高端大理石质感背景，柔和摄影棚光线，奢华商品陈列，浅景深，高端商业摄影风格",
    "质感图"
  );
}

// 套图场景图：直接使用 analyze 生成的结构化英文 prompt
async function generateSceneImg(base64DataUrl: string, scenePrompt: string): Promise<string> {
  return callWan25Edit(base64DataUrl, scenePrompt, "场景图");
}

// ─── 单 variant 生成（同步返回 JSON）────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, productDesc, variant, scenePrompt } = await req.json();

    let url = "";
    switch (variant) {
      case "white":
        url = await generateWhiteBg(imageBase64);
        break;
      case "texture":
        url = await generateTextureBg(imageBase64);
        break;
      case "3d":
        url = await generate3DRender(productDesc || "product", imageBase64);
        break;
      case "scene":
        url = await generateSceneImg(imageBase64, scenePrompt || "clean product photography");
        break;
      default:
        return NextResponse.json({ success: false, error: `未知 variant: ${variant}` }, { status: 400 });
    }

    if (!url) throw new Error("返回 URL 为空");
    return NextResponse.json({ success: true, url });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
