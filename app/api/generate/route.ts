import { NextRequest } from "next/server";
import { qwen } from "@/lib/dashscope";
import { quickScan } from "@/lib/prohibited-words";
import { PLATFORM_SPECS, type Platform } from "@/lib/platform-specs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { productParams, imageScripts, platform, styleDirection, productHighlights } = await req.json();
  const spec = PLATFORM_SPECS[platform as Platform];

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = (event: string, data: unknown) =>
    writer.write(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`));

  (async () => {
    try {
      // Step 1: 生成每张图的文案
      await send("status", "正在为每张图生成合规文案...");

      const copyCompletion = await qwen.chat.completions.create({
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content: `你是专业电商文案师。平台：${spec.name}。风格方向：${styleDirection}。
严禁使用违禁词（最、第一、唯一、顶级、完美、绝对、100%等极限表达）。
输出纯 JSON，无 markdown。`,
          },
          {
            role: "user",
            content: `产品参数：${productParams}
分镜脚本：${JSON.stringify(imageScripts)}

为每张图生成完整文案，输出 JSON 数组：
[
  {
    "slot": 1,
    "headline": "不超过10字的主标题",
    "subline": "不超过20字的副标题",
    "bullets": ["卖点短句1", "卖点短句2"],
    "badgeText": "角标文字（如：限时特惠/新品首发）"
  }
]`,
          },
        ],
      });

      const rawCopy = (copyCompletion.choices[0].message.content ?? "[]")
        .replace(/```json\n?|```\n?/g, "")
        .trim();
      let copies: Array<{
        slot: number;
        headline: string;
        subline: string;
        bullets: string[];
        badgeText: string;
      }> = [];

      try {
        copies = JSON.parse(rawCopy);
      } catch {
        await send("error", "文案解析失败，请重试");
        await writer.close();
        return;
      }

      await send("copies", copies);

      // Step 2: 违禁词快速扫描
      await send("status", "正在做合规检测...");

      const allText = copies
        .flatMap((c) => [c.headline, c.subline, ...c.bullets, c.badgeText])
        .join(" ");
      const quickHits = quickScan(allText);

      // Step 3: LLM 语义级检测 + 合规营销文案生成（一次调用）
      const highlightsText = Array.isArray(productHighlights) && productHighlights.length > 0
        ? productHighlights.join("、")
        : productParams;

      const semanticCompletion = await qwen.chat.completions.create({
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content: `你是电商合规审核专家兼资深营销文案师。
任务一：检查文案是否含隐式违禁表达（如"没人比我便宜"、"别家都贵"、极限词"最/第一/唯一"等）。
任务二：基于商品核心卖点，撰写一段合规的商品营销文案（60-100字，语言有感染力、流畅自然，不含任何违禁词，不使用极限表达）。
输出纯 JSON，无 markdown。`,
          },
          {
            role: "user",
            content: `待审核文案：
${allText}

商品核心卖点（营销文案的创作依据）：${highlightsText}

请同时输出：
{
  "issues": [
    { "original": "问题表达", "reason": "违规原因", "suggestion": "修改建议" }
  ],
  "overallRisk": "low|medium|high",
  "summary": "一句话总结审核结论",
  "marketingCopy": "基于核心卖点撰写的合规营销文案正文，60-100字，富有感染力，已通过广告法审核"
}`,
          },
        ],
      });

      const rawSemantic = (semanticCompletion.choices[0].message.content ?? "{}")
        .replace(/```json\n?|```\n?/g, "")
        .trim();
      let semanticResult: {
        issues: { original: string; reason: string; suggestion: string }[];
        overallRisk: string;
        summary: string;
        marketingCopy: string;
      } = { issues: [], overallRisk: "low", summary: "文案合规", marketingCopy: "" };

      try {
        semanticResult = JSON.parse(rawSemantic);
      } catch {}

      await send("compliance", {
        marketingCopy: semanticResult.marketingCopy ?? "",
        quickHits,
        semantic: semanticResult,
      });

      // Step 4: 如有违禁词，自动修复文案
      if (quickHits.length > 0 || semanticResult.issues?.length > 0) {
        await send("status", "检测到违禁词，正在自动修复...");

        const fixCompletion = await qwen.chat.completions.create({
          model: "qwen-plus",
          messages: [
            {
              role: "system",
              content: `你是电商文案合规修复专家。将文案中的违禁词替换为合规表达，保持原意和语感。
输出纯 JSON，无 markdown。`,
            },
            {
              role: "user",
              content: `原始文案：${JSON.stringify(copies)}

违禁词问题：
- 字面命中：${JSON.stringify(quickHits.map((h) => ({ word: h.word, replacement: h.replacement })))}
- 语义问题：${JSON.stringify(semanticResult.issues)}

请修复并返回相同格式的 JSON 数组。`,
            },
          ],
        });

        const rawFixed = (fixCompletion.choices[0].message.content ?? "[]")
          .replace(/```json\n?|```\n?/g, "")
          .trim();

        try {
          const fixedCopies = JSON.parse(rawFixed);
          await send("fixedCopies", fixedCopies);
        } catch {}
      }

      await send("done", "生成完成");
    } catch (err) {
      await send("error", String(err));
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
