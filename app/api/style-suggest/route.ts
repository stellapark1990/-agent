import { NextRequest, NextResponse } from "next/server";
import { qwen } from "@/lib/dashscope";

export const runtime = "nodejs";

const PLATFORM_LABEL: Record<string, string> = {
  taobao: "淘宝/天猫",
  pdd: "拼多多",
  jd: "京东",
};

export async function POST(req: NextRequest) {
  const { productName, platform, productParams } = await req.json();

  const platformLabel = PLATFORM_LABEL[platform] ?? platform;

  const completion = await qwen.chat.completions.create({
    model: "qwen-turbo",
    messages: [
      {
        role: "system",
        content: `你是电商视觉营销专家，精通各平台商品主图的风格调性策划。
根据商品信息，生成 8～10 个适合该商品的视觉风格方向词组。
要求：
- 每个词组 4～10 字，自然流畅，有画面感
- 覆盖多个维度：氛围感（如极简冷淡、温暖治愈）、场景（户外露营、居家轻奢）、色调（莫兰迪、马卡龙）、人群调性（Z世代、精致白领）、风格流派（日系杂志感、欧美大片风）等
- 结合目标平台用户审美偏好（${platformLabel}）
- 输出纯 JSON 数组，无 markdown，无解释`,
      },
      {
        role: "user",
        content: `商品名称：${productName || "未填写"}
分发平台：${platformLabel}
商品描述/参数：${productParams || "未填写"}

请输出 8～10 个视觉风格方向词组，JSON 数组格式：
["词组1", "词组2", ...]`,
      },
    ],
  });

  const raw = (completion.choices[0].message.content ?? "[]")
    .replace(/```json\n?|```\n?/g, "")
    .trim();

  try {
    const suggestions: string[] = JSON.parse(raw);
    return NextResponse.json({ success: true, suggestions });
  } catch {
    return NextResponse.json({ success: false, suggestions: [] }, { status: 500 });
  }
}
