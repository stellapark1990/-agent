import OpenAI from "openai";

function getQwen() {
  return new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY ?? (() => { throw new Error("DASHSCOPE_API_KEY is not set"); })(),
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
}

export const qwen = {
  chat: {
    completions: {
      create: (...args: Parameters<OpenAI["chat"]["completions"]["create"]>) =>
        getQwen().chat.completions.create(...args),
    },
  },
};

// 通义万相图像生成（原生 DashScope API，异步任务模式）
export async function wanxTextToImage(prompt: string): Promise<string> {
  const createRes = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wanx-v1",
        input: { prompt },
        parameters: { size: "1024*1024", n: 1, style: "<photography>" },
      }),
    }
  );
  const createData = await createRes.json();
  const taskId = createData.output?.task_id;
  if (!taskId) throw new Error("Wanx task creation failed");

  // 轮询任务结果
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` } }
    );
    const pollData = await pollRes.json();
    if (pollData.output?.task_status === "SUCCEEDED") {
      return pollData.output.results[0].url;
    }
    if (pollData.output?.task_status === "FAILED") {
      throw new Error("Wanx image generation failed");
    }
  }
  throw new Error("Wanx timeout");
}
