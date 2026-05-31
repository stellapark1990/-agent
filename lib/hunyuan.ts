import * as hunyuanSdk from "tencentcloud-sdk-nodejs-hunyuan";
import type { SubmitHunyuanImageJobRequest } from "tencentcloud-sdk-nodejs-hunyuan/tencentcloud/services/hunyuan/v20230901/hunyuan_models";

const HunyuanClient = hunyuanSdk.hunyuan.v20230901.Client;

export const hunyuan = new HunyuanClient({
  credential: {
    secretId: process.env.TENCENTCLOUD_SECRET_ID!,
    secretKey: process.env.TENCENTCLOUD_SECRET_KEY!,
  },
  region: "ap-guangzhou",
});

/**
 * 用混元 3D渲染风格（3dxuanran）生成商品 3D 图。
 * contentImageBase64：上传的商品原图 base64（去掉 data:... 前缀）
 */
export async function generate3DRender(
  productPrompt: string,
  contentImageBase64?: string
): Promise<string> {
  const params: SubmitHunyuanImageJobRequest = {
    Prompt: `professional 3D render of ${productPrompt}, studio lighting, photorealistic, commercial product visualization, clean background`,
    NegativePrompt: "blurry, low quality, distorted, watermark, text",
    Style: "3dxuanran",
    Resolution: "1024:1024",
    Num: 1,
  };

  // 有原图则走图生图，保留商品形态
  if (contentImageBase64) {
    params.ContentImage = {
      ImageBase64: contentImageBase64.replace(/^data:image\/\w+;base64,/, ""),
    };
  }

  const { JobId } = await hunyuan.SubmitHunyuanImageJob(params);
  if (!JobId) throw new Error("混元任务创建失败，未返回 JobId");

  // 轮询结果（最多 2 分钟）
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const result = await hunyuan.QueryHunyuanImageJob({ JobId });
    if (result.JobStatusCode === "5") {
      const url = result.ResultImage?.[0];
      if (!url) throw new Error("混元返回结果为空");
      return url;
    }
    if (result.JobStatusCode === "4") {
      throw new Error(`混元任务失败: ${result.JobErrorMsg}`);
    }
  }
  throw new Error("混元任务轮询超时");
}
