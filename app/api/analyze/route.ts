import { NextRequest, NextResponse } from "next/server";
import { qwen } from "@/lib/dashscope";
import { IMAGE_SET_TEMPLATES } from "@/lib/platform-specs";

export const runtime = "nodejs";

// 调用 Qwen 完成分析，useVL 控制是否走多模态
async function runAnalysis(
  productParams: string,
  competitorDesc: string,
  competitorImageUrl: string | undefined,
  useVL: boolean
) {
  const userContent: Parameters<typeof qwen.chat.completions.create>[0]["messages"][0]["content"] =
    useVL && competitorImageUrl
      ? [
          { type: "image_url", image_url: { url: competitorImageUrl } },
          {
            type: "text",
            text: `这是竞品商品的截图。请分析：1）主图风格和构图逻辑；2）卖点诉求维度；3）色调和场景氛围。
产品参数：${productParams}${competitorDesc ? `\n竞品补充描述：${competitorDesc}` : ""}`,
          },
        ]
      : `分析以下电商商品的竞品信息，给出素材策划建议。
产品参数：${productParams}
竞品描述：${competitorDesc || "无，请基于产品参数自主规划"}${competitorImageUrl ? `\n竞品图片链接（仅供参考）：${competitorImageUrl}` : ""}`;

  const completion = await qwen.chat.completions.create({
    model: useVL && competitorImageUrl ? "qwen-vl-plus" : "qwen-plus",
    messages: [
      {
        role: "system",
        content: `你是一位资深电商视觉营销策划师，专精于中国电商平台（淘宝/拼多多/京东）的商品素材策划。同时精通国内电商买家搜索行为与中文关键词排列规律。
请输出严格的 JSON 格式，不含 markdown 代码块。`,
      },
      { role: "user", content: userContent },
      {
        role: "user",
        content: `基于以上分析，为该商品规划 5 张套图的分镜脚本。
套图模板定义：${JSON.stringify(IMAGE_SET_TEMPLATES)}

每张图的 scenePrompt 必须是完整的结构化英文提示词，直接交给底层生图模型（如 MJ/SD/wan2.5）使用。
严格按照以下各槽位模板，将 {} 内的中文提示替换为结合商品实际信息的具体英文描述：

--- Slot 1（主图 · 爆款主图）---
[Subject]: A highly detailed commercial photography of {商品具体名称}, perfectly centered, placed on a {与商品调性匹配的几何展台，如 minimalist marble podium / sleek metallic cylinder / frosted glass platform}. [Environment]: Clean and premium studio background, gradient {品牌主色调} background, elegant composition, negative space on the left for text overlay. [Lighting & Camera]: Professional studio lighting, rim light to outline the product, softbox reflections on surfaces, 8k resolution, highly detailed, shot on 85mm lens, f/5.6. [Style]: High-end commercial aesthetic, ultra-realistic, octane render style, trending on Behance. [Negative Prompt]: watermark, text, blurry, messy background, extra objects, deformed shape.

--- Slot 2（场景痛点图 · 直击痛点强对比）---
[Subject]: The {商品具体名称} clearly visible and in sharp focus, being actively used in a {该商品最典型的痛点场景，如 heavy rain / noisy crowded subway / extreme cold outdoor environment}. [Visual Contrast]: The background is {背景的混乱或恶劣状态，如 blurred and chaotic / dark and stormy / dirty and cluttered}, while the product appears {商品解决痛点后的完美状态，如 perfectly dry with water droplets bouncing off / glowing and calm / immaculately clean}. [Lighting & Camera]: Cinematic lighting, dramatic contrast between subject and background, shallow depth of field (DoF), sharp macro focus on the product, action shot feel, fast shutter speed, shot on 35mm lens. [Style]: Realistic lifestyle photography, strong emotional impact, documentary style, 8k, hyper-detailed.

--- Slot 3（功能细节图 · 材质放大黑科技）---
[Subject]: Extreme macro close-up shot of the {商品最核心的功能部件，如 camera lens array / breathable mesh fabric / precision metallic dial / ceramic coating surface} of the {商品具体名称}. [Details]: Emphasizing the rich texture of {具体材质，如 brushed aluminum / soft medical-grade silicone / woven carbon fiber}, visible fine micro-details, showcasing superior manufacturing quality and craftsmanship. [Lighting & Camera]: Dramatic directional side lighting, crisp specular highlights, hard shadows to show material depth and contour, extreme shallow depth of field, macro photography, shot on 100mm macro lens, f/2.8, 8k resolution. [Style]: Industrial design photography, futuristic tech-core aesthetic, hyper-realistic material texture.

--- Slot 4（氛围场景图 · 生活方式情绪价值）---
根据商品参数（品类、材质、功能、适用人群、使用场景）自由推导最契合的氛围背景，不限于室内桌面，可以是户外自然、商业空间、旅途场景、运动环境等任何与商品实际使用语境高度匹配的地点。
[Subject]: The {商品具体名称} naturally integrated into its most authentic use context, visible and prominent but not isolated — it belongs to the scene. [Environment & Background]: {完全基于商品参数推导最真实的使用背景，如户外类→ misty mountain trail with pine-filtered morning light / sun-drenched beach shoreline with golden sand and rolling waves；厨房/食品类→ warm farmhouse kitchen with cast-iron cookware and fresh herb bundles；运动类→ gritty urban skatepark concrete walls / forest running trail with dappled light；家居类→ airy loft living room with floor-to-ceiling windows and afternoon golden light；商务类→ premium hotel lobby marble floors / sleek co-working space with city skyline backdrop；美妆/护肤类→ spa-like bathroom vanity with botanical elements / zen garden corner with stone textures}. [Props & Context]: {与商品真实使用场景强相关的道具，如户外包→ topographic map and worn leather hiking boots / 咖啡机→ freshly ground coffee beans and a ceramic dripper / 运动装备→ sweat-glistened gym equipment and chalk dust}. [Lighting & Camera]: {根据场景类型选择最匹配的光线：户外→ natural directional sunlight or overcast adventure mood；室内→ window side light or warm ambient glow；商业→ dramatic architectural lighting}, shot on 50mm or 35mm lens, f/1.8, shallow depth of field, subject in sharp focus against richly textured background. [Style]: {根据商品类目和目标用户审美自由选择：lifestyle editorial / adventure photography / cinematic realism / slow-living warmth / sports documentary / luxury commercial}, analog film color grade, 8k resolution.

--- Slot 5（白底合规图 · 电商平台审核标准）---
[Subject]: The {商品具体名称}, perfectly isolated as the sole subject. Absolutely no props, no human hands, no decorative elements, zero distractions of any kind. [Environment]: Pure #FFFFFF white background, completely clean and seamless. [Lighting & Camera]: Perfectly even studio flat lighting from all angles, no harsh highlights or hot spots, no deep black shadows on the product. A very soft and realistic natural drop shadow directly underneath the product to visually ground it. Slightly elevated frontal angle or subtle 3/4 isometric angle, 100% sharp focus from edge to edge, no depth of field blur. [Style]: E-commerce platform standard product photography, clinical precision, ultra-clean, minimalist, high resolution suitable for zoom.

输出 JSON 格式（严格 JSON，不含 markdown 代码块）：
{
  "productTitle": "综合商品名称与核心卖点提炼的商品标题，≤20字，用于电商手机端展示，语言简洁有冲击力，不得机械拼接商品名与参数",
  "seoTitle": "参考淘宝/拼多多/京东买家真实搜索习惯，全部使用中文关键词，严格按[核心功能词>品类词>规格属性词>应用场景>人群词]顺序排列的搜索优化标题，≤30字，空格分隔关键词组",
  "competitorInsight": "竞品分析总结（1-2句话）",
  "productHighlights": ["核心卖点1", "核心卖点2", "核心卖点3"],
  "styleDirection": "整体风格方向（如：户外露营风/极简高端风/温馨家居风）",
  "colorScheme": "主色调建议，必须包含具体十六进制色值，如：#1A2B3C / #D4A853",
  "imageScripts": [
    {
      "slot": 1,
      "type": "主图",
      "headline": "主标题文案",
      "subline": "副标题文案",
      "scenePrompt": "按 Slot 1 模板完整填充后的英文提示词，{}全部替换为具体英文内容"
    },
    {
      "slot": 2,
      "type": "场景痛点图",
      "headline": "主标题文案",
      "subline": "副标题文案",
      "scenePrompt": "按 Slot 2 模板完整填充后的英文提示词"
    },
    {
      "slot": 3,
      "type": "功能细节图",
      "headline": "主标题文案",
      "subline": "副标题文案",
      "scenePrompt": "按 Slot 3 模板完整填充后的英文提示词"
    },
    {
      "slot": 4,
      "type": "氛围场景图",
      "headline": "主标题文案",
      "subline": "副标题文案",
      "scenePrompt": "按 Slot 4 模板完整填充后的英文提示词"
    },
    {
      "slot": 5,
      "type": "白底合规图",
      "headline": "主标题文案",
      "subline": "副标题文案",
      "scenePrompt": "按 Slot 5 模板完整填充后的英文提示词"
    }
  ]
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { productParams, competitorDesc, competitorImageUrl } = await req.json();

    let result: unknown;

    if (competitorImageUrl) {
      // 先尝试 VL 多模态，图片下载失败时自动降级到纯文本
      try {
        result = await runAnalysis(productParams, competitorDesc, competitorImageUrl, true);
      } catch (vlErr) {
        console.warn("Qwen-VL 失败，降级到纯文本模式:", vlErr);
        result = await runAnalysis(productParams, competitorDesc, competitorImageUrl, false);
      }
    } else {
      result = await runAnalysis(productParams, competitorDesc, undefined, false);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
