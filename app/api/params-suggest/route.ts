import { NextRequest, NextResponse } from "next/server";
import { qwen } from "@/lib/dashscope";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { productName } = await req.json();

  const completion = await qwen.chat.completions.create({
    model: "qwen-turbo",
    messages: [
      {
        role: "system",
        content: `你是电商选品专家。根据商品名称推断核心结构化参数，并猜测一个合理的电商定价。
输出严格 JSON，无 markdown，无注释：
{
  "text": "每行一个参数，格式"字段名：参考值"，4~6个字段，优先含材质/规格/核心功能/适用人群，根据品类补充最相关字段，值≤20字",
  "price": "数字字符串，不含¥符号，参考该品类在淘宝/拼多多的主流定价区间，取一个合理中位数"
}`,
      },
      {
        role: "user",
        content: `商品名称：${productName}`,
      },
    ],
  });

  const raw = (completion.choices[0].message.content ?? "")
    .replace(/```json\n?|```\n?/g, "")
    .trim();

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ success: true, text: parsed.text ?? "", price: parsed.price ?? "" });
  } catch {
    // 降级：把整个输出当 text 返回，price 为空
    return NextResponse.json({ success: true, text: raw, price: "" });
  }
}
