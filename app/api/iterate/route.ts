import { NextRequest, NextResponse } from "next/server";
import { qwen } from "@/lib/dashscope";

export const runtime = "nodejs";

export type IterateMode = "seasonal" | "hotspot";

export async function POST(req: NextRequest) {
  const { productParams, copies, mode, context } = await req.json();
  // context: 季节名 或 热点关键词

  const modePrompt =
    mode === "seasonal"
      ? `当前季节/节点：${context}（如：圣诞/冬季/双11）。请将文案的背景氛围、色调描述、情感词汇更新为符合该季节的表达。`
      : `当前营销热点：${context}。请在文案中自然融入热点元素，增加"蹭热点"的共鸣感，但不能强行生硬。`;

  const completion = await qwen.chat.completions.create({
    model: "qwen-plus",
    messages: [
      {
        role: "system",
        content: `你是电商营销文案迭代专家。在保持商品核心卖点不变的前提下，根据时令/热点更新文案氛围。
严禁使用违禁词。输出纯 JSON，无 markdown。`,
      },
      {
        role: "user",
        content: `产品参数：${productParams}

原始文案：${JSON.stringify(copies)}

迭代要求：${modePrompt}

输出更新后的文案（相同 JSON 格式），同时输出：
{
  "iteratedCopies": [...],
  "changeLog": ["改动说明1", "改动说明2"],
  "newScenePrompt": "新场景的英文图像生成提示词",
  "newColorScheme": "新色调方案"
}`,
      },
    ],
  });

  const raw = (completion.choices[0].message.content ?? "{}")
    .replace(/```json\n?|```\n?/g, "")
    .trim();

  try {
    return NextResponse.json({ success: true, data: JSON.parse(raw) });
  } catch {
    return NextResponse.json({ success: false, raw }, { status: 500 });
  }
}
