"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import MaterialCard from "@/components/MaterialCard";
import { PLATFORM_SPECS, type Platform } from "@/lib/platform-specs";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ImageScript {
  slot: number;
  type: string;
  headline: string;
  subline: string;
  scenePrompt: string;
}

interface AnalysisResult {
  productTitle: string;
  seoTitle?: string;
  competitorInsight: string;
  productHighlights: string[];
  styleDirection: string;
  colorScheme: string;
  imageScripts: ImageScript[];
}

interface CopyData {
  slot: number;
  headline: string;
  subline: string;
  bullets: string[];
  badgeText: string;
}

interface ComplianceData {
  marketingCopy: string;
  quickHits: { word: string; category: string; replacement: string }[];
  semantic: {
    issues: { original: string; reason: string; suggestion: string }[];
    overallRisk: string;
    summary: string;
  };
}

interface IterateResult {
  iteratedCopies: CopyData[];
  changeLog: string[];
  newScenePrompt: string;
  newColorScheme: string;
}

interface Project {
  id: string;
  name: string;
  platform: Platform;
  createdAt: number;
}

interface AssetSlot {
  slot: number;
  type: string;
  url: string;
}

interface AssetEntry {
  projectId: string;
  productName: string;
  platform: Platform;
  createdAt: number;
  slots: AssetSlot[];
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return `${Math.floor(diff / 604_800_000)} 周前`;
}

const SEASONS = ["☀️ 夏季清凉", "🍂 秋日温润", "❄️ 圣诞雪景", "🌸 春日焕新"];
const HOTSPOTS = ["双十一大促", "618年中大促", "开学季", "情人节特供"];

// ─── 热点横幅配置 ──────────────────────────────────────────────────────────────
const HOTSPOT_BANNER_CONFIG: Record<string, {
  taobao: { leftBg: string; gradient: string; eventName: string; date: string; badge: string | null; discountType: string };
  pdd: { leftLines: string[]; date: string; rightLines: string[] };
  jd: { leftBg: string; gradient: string; eventName: string; date: string; badge: string | null; discountType: string };
}> = {
  "618年中大促": {
    taobao: { leftBg: "#C43800", gradient: "linear-gradient(90deg,#E85300 0%,#FF9500 100%)", eventName: "天猫618", date: "5.31-6.21", badge: null, discountType: "下单立减" },
    pdd: { leftLines: ["百亿补贴", "618加补", "提前抢"], date: "5.31-6.21", rightLines: ["官方补贴", "618限时抢 低价到底"] },
    jd: { leftBg: "#CC0000", gradient: "linear-gradient(90deg,#CC0000 0%,#E81B23 100%)", eventName: "京东618", date: "5.31-6.18", badge: "价保30天", discountType: "下单立减" },
  },
  "双十一大促": {
    taobao: { leftBg: "#AA0000", gradient: "linear-gradient(90deg,#CC0000 0%,#FF5500 100%)", eventName: "全球狂欢节", date: "10.20-11.11", badge: "官方立减15%", discountType: "跨店满减" },
    pdd: { leftLines: ["百亿补贴", "11.11", "年度大促"], date: "10.20-11.11", rightLines: ["百亿补贴", "低价直降"] },
    jd: { leftBg: "#AA0000", gradient: "linear-gradient(90deg,#AA0000 0%,#E01010 100%)", eventName: "双11好物节", date: "10.20-11.11", badge: "跨店满减", discountType: "跨店满减" },
  },
  "开学季": {
    taobao: { leftBg: "#0F4DAE", gradient: "linear-gradient(90deg,#1756C8 0%,#4A96E8 100%)", eventName: "开学季", date: "8.20-9.10", badge: "领券再减\n10元", discountType: "下单立减" },
    pdd: { leftLines: ["百亿补贴", "开学季"], date: "8.20-9.10", rightLines: ["学生专享", "低价好物"] },
    jd: { leftBg: "#1A4EAB", gradient: "linear-gradient(90deg,#1A4EAB 0%,#3A7FE8 100%)", eventName: "开学好物", date: "8.20-9.10", badge: "学生专享", discountType: "下单立减" },
  },
  "情人节特供": {
    taobao: { leftBg: "#A01858", gradient: "linear-gradient(90deg,#C02070 0%,#F07BA8 100%)", eventName: "情人节", date: "2.10-2.14", badge: "送礼优选\n浪漫好物", discountType: "下单立减" },
    pdd: { leftLines: ["百亿补贴", "情人节"], date: "2.10-2.14", rightLines: ["甜蜜好礼", "低价购"] },
    jd: { leftBg: "#A01858", gradient: "linear-gradient(90deg,#A01858 0%,#E05090 100%)", eventName: "情人节甄选", date: "2.10-2.14", badge: "送礼优选", discountType: "下单立减" },
  },
};

const SEASON_BANNER_CONFIG: Record<string, { gradient: string; title: string; sub: string }> = {
  "☀️ 夏季清凉": { gradient: "linear-gradient(90deg,#FF6B00 0%,#FFB400 100%)", title: "☀️ 夏季清凉专场", sub: "全场清凉好物 · 5折起" },
  "🍂 秋日温润": { gradient: "linear-gradient(90deg,#8B4513 0%,#D2691E 100%)", title: "🍂 秋日温润上新", sub: "精选秋装新品 · 焕新换季" },
  "❄️ 圣诞雪景": { gradient: "linear-gradient(90deg,#1e3a8a 0%,#3b82f6 100%)", title: "❄️ 圣诞新年特惠", sub: "好礼特惠 · 年终钜惠" },
  "🌸 春日焕新": { gradient: "linear-gradient(90deg,#C026D3 0%,#EC4899 100%)", title: "🌸 春日焕新季", sub: "焕新生活 · 春季上新" },
};

// ─── Design-system helpers ────────────────────────────────────────────────────
const cardCls =
  "bg-white rounded-2xl border border-black/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6";

const inputCls =
  "w-full bg-[#f3f4f6] border border-transparent rounded-xl px-4 py-3 text-sm text-[#0b1c30] outline-none placeholder:text-[#9ca3af] focus:bg-white focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 transition-all resize-none";

const labelCls =
  "block text-xs font-medium text-[#6b7280] mb-2";

const primaryBtnCls =
  "bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)]";

// ─── Step tracker items (top progress bar) ───────────────────────────────────
const STEP_ITEMS = [
  { step: 1, label: "商品录入" },
  { step: 2, label: "特征解析" },
  { step: 3, label: "效果预览" },
  { step: 4, label: "迭代演示" },
];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState(1);

  // Step 1 — 图片上传
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLTextAreaElement>(null);

  // Step 1 — 商品信息表单
  const [productName, setProductName] = useState("");
  const [productParams, setProductParams] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [platform, setPlatform] = useState<Platform>("taobao");
  const [competitorDesc, setCompetitorDesc] = useState("");
  const [competitorImageUrl, setCompetitorImageUrl] = useState("");

  // Step 2 state
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Step 3 results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copies, setCopies] = useState<CopyData[]>([]);
  const [fixedCopies, setFixedCopies] = useState<CopyData[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);

  // 目标风格 AI 拓词
  const [styleSuggestions, setStyleSuggestions] = useState<string[]>([]);
  const [loadingStyle, setLoadingStyle] = useState(false);
  const [loadingParams, setLoadingParams] = useState(false);

  // Step 4 iterate
  const [iterateMode, setIterateMode] = useState<"seasonal" | "hotspot">("seasonal");
  const [selectedContext, setSelectedContext] = useState("");
  const [iterating, setIterating] = useState(false);
  const [iterateResult, setIterateResult] = useState<IterateResult | null>(null);

  // Step 3 — AI 生图
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [generatingSlots, setGeneratingSlots] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState(1);

  // Projects — persisted to localStorage
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const projectsSaveEnabled = useRef(false);

  // Load from localStorage after mount (avoids SSR/client hydration mismatch)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ecom-projects") ?? "[]");
      if (saved.length > 0) setProjects(saved);
    } catch {}
    projectsSaveEnabled.current = true;
  }, []);

  useEffect(() => {
    if (!projectsSaveEnabled.current) return;
    localStorage.setItem("ecom-projects", JSON.stringify(projects));
  }, [projects]);

  // Asset library
  const [savedAssets, setSavedAssets] = useState<AssetEntry[]>([]);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showProductGuide, setShowProductGuide] = useState(false);
  const [assetFilter, setAssetFilter] = useState<Platform | "all">("all");

  // 图文分层 — text layer overrides (user-editable per slot)
  const [textLayers, setTextLayers] = useState<Record<number, { headline: string; subline: string }>>({});
  const [editingLayer, setEditingLayer] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ecom-assets") ?? "[]");
      if (saved.length > 0) setSavedAssets(saved);
    } catch {}
  }, []);

  const addLog = (msg: string) => setAgentLogs((prev) => [...prev, msg]);

  // 商品名称变化时自动拉取风格建议气泡（防抖 700ms）
  useEffect(() => {
    if (productName.length < 2 || step !== 1) return;
    setStyleSuggestions([]);
    const timer = setTimeout(async () => {
      setLoadingStyle(true);
      try {
        const res = await fetch("/api/style-suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName, platform, productParams: competitorDesc }),
        });
        const data = await res.json();
        if (data.suggestions?.length) setStyleSuggestions(data.suggestions);
      } catch {}
      finally { setLoadingStyle(false); }
    }, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName, platform]);

  const handleStyleSuggest = async () => {
    setLoadingStyle(true);
    setStyleSuggestions([]);
    try {
      const res = await fetch("/api/style-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, platform, productParams: competitorDesc }),
      });
      const data = await res.json();
      if (data.suggestions?.length) setStyleSuggestions(data.suggestions);
    } catch {
      // silent fail
    } finally {
      setLoadingStyle(false);
    }
  };

  const handleParamsSuggest = async () => {
    if (!productName) return;
    setLoadingParams(true);
    try {
      const res = await fetch("/api/params-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });
      const data = await res.json();
      if (data.text) {
        const priceRow = data.price ? `\n参考售价：${data.price}` : "";
        setCompetitorDesc(data.text + priceRow);
      }
    } catch {}
    finally { setLoadingParams(false); }
  };

  // 从商品参数文本自动解析价格（供手机预览使用）
  useEffect(() => {
    const m = competitorDesc.match(/(?:价格|售价|定价|参考售价|市场价|建议零售价)[：:]\s*¥?\s*(\d+(?:\.\d+)?)/);
    if (m) setProductPrice(m[1]);
  }, [competitorDesc]);

  // 前端轮询直到任务完成（无 Vercel 超时限制）
  const pollUntilDone = async (taskId: string, maxMinutes = 5): Promise<string> => {
    const deadline = Date.now() + maxMinutes * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`/api/image-status?taskId=${taskId}`);
      const data = await res.json();
      if (data.status === "SUCCEEDED" && data.url) return data.url;
      if (data.status === "FAILED") throw new Error(data.error ?? "生图任务失败");
    }
    throw new Error("等待超时");
  };

  // Step 3 进场：提交生图任务，前端持续轮询直到完成
  useEffect(() => {
    if (step !== 3 || !analysis || !uploadedImage) return;
    analysis.imageScripts.forEach(async (script) => {
      if (generatedImages[script.slot]) return;
      setGeneratingSlots((prev) => new Set([...prev, script.slot]));
      try {
        // 1. 提交任务，立即拿到 taskId（~2s，不受 Vercel 超时影响）
        const submitRes = await fetch("/api/image-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: uploadedImage,
            variant: "scene",
            scenePrompt: script.scenePrompt,
          }),
        });
        const submitData = await submitRes.json();
        if (!submitData.success) throw new Error(submitData.error);

        // 2. 如果直接返回了 url（3d 等同步模式），直接用
        if (submitData.url) {
          setGeneratedImages((prev) => ({ ...prev, [script.slot]: submitData.url }));
          return;
        }

        // 3. 前端轮询状态，最多等 5 分钟
        const url = await pollUntilDone(submitData.taskId);
        setGeneratedImages((prev) => ({ ...prev, [script.slot]: url }));
      } catch {
        // 生图失败时静默降级到文案占位
      } finally {
        setGeneratingSlots((prev) => {
          const s = new Set(prev);
          s.delete(script.slot);
          return s;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 生图后自动存入素材库
  useEffect(() => {
    if (!activeProjectId || !analysis || Object.keys(generatedImages).length === 0) return;
    const slots: AssetSlot[] = analysis.imageScripts
      .filter((s) => generatedImages[s.slot])
      .map((s) => ({ slot: s.slot, type: s.type, url: generatedImages[s.slot] }));
    if (slots.length === 0) return;
    const entry: AssetEntry = {
      projectId: activeProjectId,
      productName,
      platform,
      createdAt: projects.find((p) => p.id === activeProjectId)?.createdAt ?? Date.now(),
      slots,
    };
    setSavedAssets((prev) => {
      const updated = [entry, ...prev.filter((a) => a.projectId !== activeProjectId)];
      localStorage.setItem("ecom-assets", JSON.stringify(updated));
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedImages]);

  // ─── Project management ──────────────────────────────────────────────────
  const handleNewProject = () => {
    setStep(1);
    setUploadedImage("");
    setProductName("");
    setProductParams("");
    setPlatform("taobao");
    setCompetitorDesc("");
    setCompetitorImageUrl("");
    setProductPrice("");
    setAnalysis(null);
    setCopies([]);
    setFixedCopies([]);
    setCompliance(null);
    setGeneratedImages({});
    setGeneratingSlots(new Set());
    setAgentLogs([]);
    setIterateResult(null);
    setActiveProjectId(null);
    setTextLayers({});
    setEditingLayer(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length === 0) {
        setSavedAssets([]);
        localStorage.removeItem("ecom-assets");
      } else {
        setSavedAssets((prev) => {
          const updated = prev.filter((a) => a.projectId !== id);
          localStorage.setItem("ecom-assets", JSON.stringify(updated));
          return updated;
        });
      }
      return next;
    });
    if (activeProjectId === id) setActiveProjectId(null);
  };

  // ─── Batch download ──────────────────────────────────────────────────────
  const handleBatchDownload = async () => {
    const entries = Object.entries(generatedImages);
    if (entries.length === 0) return;
    for (const [slot, url] of entries) {
      const script = analysis?.imageScripts.find((s) => s.slot === Number(slot));
      const filename = script ? `图${slot}-${script.type}.jpg` : `image-${slot}.jpg`;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  // ─── Step 1: Image Upload ────────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 压缩到最长边 1024px，避免 base64 超过 Vercel 4.5MB 请求体限制
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedImage(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // ─── Step 1→2: Analyze ───────────────────────────────────────────────────
  const handleAnalyze = async () => {
    const newProject: Project = { id: Date.now().toString(), name: productName, platform, createdAt: Date.now() };
    setProjects((prev) => [newProject, ...prev].slice(0, 30));
    setActiveProjectId(newProject.id);
    setStep(2);
    setIsLoading(true);
    setAgentLogs([]);
    addLog(`🔍 开始分析商品：${productName}`);
    addLog(`📦 参数：${productParams}`);
    addLog(`🛒 目标平台：${PLATFORM_SPECS[platform].name}`);
    if (competitorDesc) addLog(`🔗 竞品信息：${competitorDesc.slice(0, 50)}...`);

    try {
      const imageUrlForVL = competitorImageUrl || undefined;
      addLog(imageUrlForVL ? "🤖 调用 Qwen-VL 分析竞品图片..." : "🤖 调用 Qwen 规划素材策略...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productParams: `${productName}，${productParams}`,
          competitorDesc,
          competitorImageUrl: imageUrlForVL,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`服务异常 (${res.status})：${text.slice(0, 100)}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "分析失败，请重试");

      setAnalysis(data.data);
      addLog(`✅ 竞品洞察：${data.data.competitorInsight}`);
      addLog(`🎨 风格方向：${data.data.styleDirection}`);
      addLog(`📝 核心卖点：${data.data.productHighlights?.join("、")}`);
      addLog("🖼 分镜规划完成，共 5 张套图");
      addLog("✍️ 开始生成每张图的合规文案...");

      // SSE: generate copy + compliance
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productParams: `${productName}，${productParams}`,
          imageScripts: data.data.imageScripts,
          platform,
          styleDirection: data.data.styleDirection,
          productHighlights: data.data.productHighlights ?? [],
        }),
      });

      const reader = genRes.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.event === "status") addLog(`⏳ ${payload.data}`);
          if (payload.event === "copies") {
            setCopies(payload.data);
            addLog(`✅ 文案生成完成`);
          }
          if (payload.event === "compliance") {
            setCompliance(payload.data);
            const total =
              (payload.data.quickHits?.length ?? 0) +
              (payload.data.semantic?.issues?.length ?? 0);
            if (total > 0) addLog(`⚠️ 检测到 ${total} 处违禁词，正在自动修复...`);
            else addLog("✅ 合规检测通过，无违禁词");
          }
          if (payload.event === "fixedCopies") {
            setFixedCopies(payload.data);
            addLog("✅ 文案修复完成");
          }
          if (payload.event === "done") addLog("🎉 全部生成完毕！");
          if (payload.event === "error") addLog(`❌ ${payload.data}`);
        }
      }

      setStep(3);
    } catch (e) {
      addLog(`❌ 出错：${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 4: Iterate ─────────────────────────────────────────────────────
  const handleIterate = async () => {
    if (!selectedContext) return;
    setIterating(true);
    setIterateResult(null);
    try {
      const res = await fetch("/api/iterate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productParams: `${productName}，${productParams}`,
          copies: fixedCopies.length > 0 ? fixedCopies : copies,
          mode: iterateMode,
          context: selectedContext,
        }),
      });
      const data = await res.json();
      if (data.success) setIterateResult(data.data);
    } finally {
      setIterating(false);
    }
  };

  const displayCopies = (fixedCopies.length > 0 ? fixedCopies : copies).map((c) => ({
    ...c,
    headline: textLayers[c.slot]?.headline ?? c.headline,
    subline: textLayers[c.slot]?.subline ?? c.subline,
  }));
  const spec = PLATFORM_SPECS[platform];

  // ─── 热点横幅渲染（内嵌在手机屏幕内）───────────────────────────────────────
  const renderHotspotBanner = (context: string) => {
    const priceNum = parseFloat(productPrice) || 0;
    const originalPrice = priceNum > 0 ? Math.round(priceNum * 1.5) : null;
    const discount = originalPrice ? Math.round(originalPrice - priceNum) : null;
    const priceStr = productPrice || "—";
    const priceColor = platform === "pdd" ? "#CC0000" : platform === "jd" ? "#CC0000" : "#D03000";

    const hotCfg = HOTSPOT_BANNER_CONFIG[context];
    if (hotCfg) {
      if (platform === "taobao") {
        const c = hotCfg.taobao;
        return (
          <div style={{ width: "100%", overflow: "hidden", background: c.gradient }}>
            <div style={{ display: "flex", height: 60 }}>
              <div style={{ width: 76, background: "rgba(0,0,0,0.22)", padding: "6px 7px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ background: c.leftBg, borderRadius: 3, padding: "1px 4px", display: "inline-block", marginBottom: 2 }}>
                    <span style={{ color: "white", fontSize: 8.5, fontWeight: 800 }}>淘宝</span>
                  </div>
                  <div style={{ color: "white", fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>{c.eventName}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 6 }}>活动: {c.date}</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.93)", padding: "5px 7px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 6, color: "#888", marginBottom: 1 }}>预估到手价</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: priceColor, lineHeight: 1 }}>{priceStr}</span>
                  <span style={{ fontSize: 7, color: "#888" }}>起</span>
                </div>
                {originalPrice && (
                  <div style={{ fontSize: 6, color: "#aaa", marginTop: 1 }}>
                    = {originalPrice}起 日常价 - {discount}起 {c.discountType}
                  </div>
                )}
              </div>
              {c.badge && (
                <div style={{ width: 42, background: c.leftBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "3px 2px", flexShrink: 0 }}>
                  <span style={{ color: "white", fontSize: 5.5, fontWeight: 700, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line" }}>{c.badge}</span>
                </div>
              )}
            </div>
          </div>
        );
      }
      if (platform === "jd") {
        const c = hotCfg.jd;
        return (
          <div style={{ width: "100%", overflow: "hidden", background: c.gradient }}>
            <div style={{ display: "flex", height: 60 }}>
              <div style={{ width: 76, background: "rgba(0,0,0,0.22)", padding: "6px 7px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ background: c.leftBg, borderRadius: 3, padding: "1px 4px", display: "inline-block", marginBottom: 2 }}>
                    <span style={{ color: "white", fontSize: 8.5, fontWeight: 800 }}>京东</span>
                  </div>
                  <div style={{ color: "white", fontSize: 8, fontWeight: 700, lineHeight: 1.3 }}>{c.eventName}</div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 6 }}>活动: {c.date}</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.93)", padding: "5px 7px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 6, color: "#888", marginBottom: 1 }}>预估到手价</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: priceColor, lineHeight: 1 }}>{priceStr}</span>
                  <span style={{ fontSize: 7, color: "#888" }}>起</span>
                </div>
                {originalPrice && (
                  <div style={{ fontSize: 6, color: "#aaa", marginTop: 1 }}>
                    = {originalPrice}起 日常价 - {discount}起 {c.discountType}
                  </div>
                )}
              </div>
              {c.badge && (
                <div style={{ width: 42, background: c.leftBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "3px 2px", flexShrink: 0 }}>
                  <span style={{ color: "white", fontSize: 5.5, fontWeight: 700, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line" }}>{c.badge}</span>
                </div>
              )}
            </div>
          </div>
        );
      }
      if (platform === "pdd") {
        const c = hotCfg.pdd;
        return (
          <div style={{ width: "100%", overflow: "hidden", background: "linear-gradient(90deg,#CC0000 0%,#E82020 100%)" }}>
            <div style={{ display: "flex", height: 60 }}>
              <div style={{ width: 68, background: "rgba(0,0,0,0.2)", padding: "6px 6px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  {c.leftLines.map((line, i) => (
                    <div key={i} style={{ color: i === 0 ? "#FFE500" : "white", fontSize: i === 0 ? 7 : 8, fontWeight: i === 0 ? 900 : 700, lineHeight: 1.3 }}>{line}</div>
                  ))}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 5.5 }}>活动: {c.date}</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.93)", padding: "5px 7px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 6, color: "#888", marginBottom: 1 }}>预估到手价</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: priceColor, lineHeight: 1 }}>{priceStr}</span>
                  <span style={{ fontSize: 7, color: "#888" }}>起</span>
                </div>
                {originalPrice && (
                  <div style={{ fontSize: 6, color: "#aaa", marginTop: 1 }}>
                    = {originalPrice}起 日常价 - {discount}起 平台直降
                  </div>
                )}
              </div>
              <div style={{ width: 48, background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", padding: "3px 2px", flexShrink: 0 }}>
                <span style={{ color: "white", fontSize: 5.5, fontWeight: 700, textAlign: "center", lineHeight: 1.5, whiteSpace: "pre-line" }}>{c.rightLines.join("\n")}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    // 季节横幅
    const seaCfg = SEASON_BANNER_CONFIG[context];
    if (seaCfg) {
      return (
        <div style={{ width: "100%", overflow: "hidden", background: seaCfg.gradient, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "white", fontSize: 11, fontWeight: 800, lineHeight: 1.2 }}>{seaCfg.title}</div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 8, marginTop: 3 }}>{seaCfg.sub}</div>
            </div>
            {priceNum > 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 6.5 }}>限时优惠</div>
                <div style={{ color: "white", fontSize: 16, fontWeight: 900, lineHeight: 1 }}>¥{priceStr}</div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">

      {/* ── Silk Ambient Background ── */}
      <style>{`
        @keyframes silkDriftA {
          0%   { transform: translate(0,0) scale(1) rotate(0deg); }
          20%  { transform: translate(3%,-4%) scale(1.05) rotate(1deg); }
          45%  { transform: translate(6%,3%) scale(0.97) rotate(-1.5deg); }
          70%  { transform: translate(-2%,6%) scale(1.06) rotate(2deg); }
          100% { transform: translate(0,0) scale(1) rotate(0deg); }
        }
        @keyframes silkDriftB {
          0%   { transform: translate(0,0) scale(1); }
          30%  { transform: translate(-4%,-3%) scale(1.05) rotate(-2deg); }
          60%  { transform: translate(3%,5%) scale(0.96) rotate(1.5deg); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes silkFloat {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-30px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes silkPulse {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 0.85; }
        }
        @keyframes silkSlow {
          0%   { transform: translate(0,0) scale(1); }
          25%  { transform: translate(2%,3%) scale(1.03); }
          50%  { transform: translate(-3%,1%) scale(0.98); }
          75%  { transform: translate(1%,-3%) scale(1.04); }
          100% { transform: translate(0,0) scale(1); }
        }
      `}</style>
      <div className="fixed inset-0 -z-50 bg-white overflow-hidden pointer-events-none">
        {/* 底层暖光 — 大面积橙金铺底 */}
        <div className="absolute" style={{
          top:"-20%", left:"-10%", width:"80vw", height:"80vw",
          background:"radial-gradient(ellipse at center, rgba(251,146,60,0.28) 0%, rgba(253,186,116,0.12) 55%, transparent 75%)",
          filter:"blur(100px)",
          animation:"silkSlow 45s ease-in-out infinite",
        }}/>
        <div className="absolute" style={{
          bottom:"-20%", right:"-10%", width:"85vw", height:"85vw",
          background:"radial-gradient(ellipse at center, rgba(249,115,22,0.22) 0%, rgba(253,186,116,0.1) 55%, transparent 75%)",
          filter:"blur(110px)",
          animation:"silkDriftB 38s ease-in-out infinite",
          animationDelay:"-20s",
        }}/>
        {/* 中层主光晕 — 橙色核心流动 */}
        <div className="absolute" style={{
          top:"-10%", right:"-5%", width:"65vw", height:"65vw",
          background:"radial-gradient(ellipse at center, rgba(249,115,22,0.30) 0%, rgba(251,146,60,0.14) 50%, transparent 72%)",
          filter:"blur(90px)",
          animation:"silkDriftA 28s ease-in-out infinite",
          animationDelay:"-7s",
        }}/>
        <div className="absolute" style={{
          bottom:"-5%", left:"0%", width:"60vw", height:"60vw",
          background:"radial-gradient(ellipse at center, rgba(249,115,22,0.26) 0%, rgba(251,146,60,0.12) 50%, transparent 72%)",
          filter:"blur(90px)",
          animation:"silkDriftA 28s ease-in-out infinite",
          animationDelay:"-15s",
        }}/>
        {/* 浮动高光 — 垂直漂浮制造层次 */}
        <div className="absolute" style={{
          top:"20%", left:"30%", width:"50vw", height:"50vw",
          background:"radial-gradient(ellipse at center, rgba(253,186,116,0.35) 0%, rgba(254,215,170,0.12) 50%, transparent 70%)",
          filter:"blur(80px)",
          animation:"silkFloat 22s ease-in-out infinite",
          animationDelay:"-5s",
        }}/>
        <div className="absolute" style={{
          bottom:"15%", right:"20%", width:"42vw", height:"42vw",
          background:"radial-gradient(ellipse at center, rgba(251,146,60,0.30) 0%, rgba(253,186,116,0.1) 50%, transparent 70%)",
          filter:"blur(80px)",
          animation:"silkFloat 22s ease-in-out infinite",
          animationDelay:"-11s",
        }}/>
        {/* 点缀脉冲光 */}
        <div className="absolute" style={{
          top:"35%", right:"8%", width:"32vw", height:"32vw",
          background:"radial-gradient(ellipse at center, rgba(249,115,22,0.20) 0%, transparent 65%)",
          filter:"blur(70px)",
          animation:"silkPulse 16s ease-in-out infinite",
          animationDelay:"-3s",
        }}/>
        <div className="absolute" style={{
          top:"55%", left:"12%", width:"28vw", height:"28vw",
          background:"radial-gradient(ellipse at center, rgba(251,146,60,0.18) 0%, transparent 65%)",
          filter:"blur(70px)",
          animation:"silkPulse 16s ease-in-out infinite",
          animationDelay:"-9s",
        }}/>
        {/* 极淡边缘收口 — 不完全遮盖，只柔化边角 */}
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(255,255,255,0.25) 100%)" }}/>
      </div>

      {/* ── Fixed Top Nav ── */}
      <nav
        className="fixed top-0 w-full h-16 z-50 flex items-center border-b border-black/[0.05]"
        style={{ backgroundColor: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        {/* Logo — aligns with sidebar width */}
        <div className="flex items-center gap-2.5 px-5 w-56 shrink-0">
          <img src="/app-icon.png" alt="logo" className="w-7 h-7 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#0b1c30] leading-tight truncate">商图智造</p>
          </div>
        </div>

        {/* Step tracker — fills rest of nav */}
        <div className="flex-1 flex items-center px-8">
          {STEP_ITEMS.map(({ step: s, label }, idx) => {
            const isActive = step === s;
            const isDone = step > s;
            const isReachable = s <= step;
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => isReachable && setStep(s)}
                  disabled={!isReachable}
                  className={`flex items-center gap-2 transition-all ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isDone
                      ? "bg-[#f97316] text-white"
                      : isActive
                      ? "bg-[#f97316] text-white shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
                      : "bg-[#f3f4f6] text-[#c0c8d8]"
                  }`}>
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`text-sm font-medium transition-all ${
                    isActive ? "text-[#f97316]" : isDone ? "text-[#0b1c30]" : "text-[#c0c8d8]"
                  }`}>{label}</span>
                </button>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-all ${isDone ? "bg-[#f97316]/40" : "bg-[#f0f2f5]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Fixed Sidebar ── */}
      <aside
        className="fixed left-0 top-16 h-[calc(100vh-64px)] w-56 flex flex-col border-r border-black/[0.07]"
        style={{ backgroundColor: "rgba(246,246,247,0.96)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* 新建项目 */}
        <div className="px-4 pt-5 pb-3">
          <button
            onClick={handleNewProject}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0b1c30] hover:bg-[#162d47] text-white text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(11,28,48,0.18)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
            </svg>
            <span>新建项目</span>
          </button>
        </div>

        {/* WORKSPACE 区域 */}
        <div className="px-4 flex-1 overflow-y-auto min-h-0">
          <p className="text-[10px] font-semibold text-[#b8bfcc] tracking-[0.14em] uppercase mb-2 mt-1">Workspace</p>

          {/* 固定导航项 */}
          <div className="flex flex-col gap-0.5 mb-3">
            <button onClick={() => setShowAssetLibrary(true)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#374151] hover:text-[#0b1c30] hover:bg-black/[0.05] transition-all w-full text-left">
              <svg className="w-4 h-4 text-[#a0a8b8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={1.5} />
              </svg>
              <span>素材库</span>
            </button>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#374151] hover:text-[#0b1c30] hover:bg-black/[0.05] transition-all w-full text-left">
              <svg className="w-4 h-4 text-[#a0a8b8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
              </svg>
              <span>最近项目</span>
            </button>
          </div>

          {/* 项目列表 */}
          {projects.length === 0 ? (
            <p className="text-[11px] text-[#c0c8d8] px-3 py-1">暂无项目记录</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {projects.map((item) => {
                const isActive = item.id === activeProjectId;
                const platformName = PLATFORM_SPECS[item.platform]?.name.split(" / ")[0] ?? item.platform;
                return (
                  <div
                    key={item.id}
                    className={`group relative w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#f97316]/[0.08] text-[#0b1c30]"
                        : "text-[#6b7280] hover:text-[#0b1c30] hover:bg-black/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-1 pr-4">
                      <span className="text-[11px] font-medium truncate">{item.name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0 ml-auto" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#9ca3af]">{platformName}</span>
                      <span className="text-[10px] text-[#d1d5db]">·</span>
                      <span className="text-[10px] text-[#9ca3af]">{relativeTime(item.createdAt)}</span>
                    </div>
                    {/* 删除按钮 — 悬停可见 */}
                    <button
                      onClick={(e) => handleDeleteProject(item.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部：产品说明 */}
        <div className="px-4 pb-5 pt-3 border-t border-black/[0.06]">
          <button onClick={() => setShowProductGuide(true)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#9ca3af] hover:text-[#374151] hover:bg-black/[0.05] transition-all w-full text-left">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
              <path d="M12 16v-4m0-4h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
            </svg>
            <span>产品说明</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-56 pt-16 min-h-screen bg-transparent">

        {/* ── Step 1: 商品录入 ───────────────────────────────── */}
        {step === 1 && (
          <>
          <div className="h-[calc(100vh-64px)] px-4 pt-5 pb-28 flex flex-col">
            <div className="flex gap-6 flex-1 min-h-0">

              {/* ── Left: 源文件上传 + 风格参考 ── */}
              <div className="flex-[2] flex flex-col">
                <div className={`${cardCls} flex flex-col flex-1`}>
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                      </svg>
                      <h2 className="text-sm font-semibold text-[#0b1c30]">源文件上传</h2>
                    </div>
                    <span className="text-xs text-[#9ca3af] font-medium">JPG, PNG</span>
                  </div>

                  {/* Drop zone */}
                  {!uploadedImage ? (
                    <div
                      className={`flex flex-col items-center justify-center border border-dashed rounded-2xl flex-1 px-6 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? "border-[#f97316] bg-[#fff7ed]"
                          : "border-[#e5e7eb] bg-[#f9fafb] hover:border-[#f97316] hover:bg-[#fff7ed]/40"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileSelect(file);
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-[#374151]">将文件拖到这里，或点击选择</p>
                      <p className="text-xs text-[#9ca3af] mt-1.5">为获得最佳效果，建议提供 2000px 以上白底原图</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] bg-white flex-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedImage} alt="商品白底图" className="w-full max-h-64 object-contain" />
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">已上传</div>
                      <button
                        onClick={() => { setUploadedImage(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#565e74] text-xs px-3 py-1.5 rounded-lg border border-black/[0.08] shadow-sm transition-all"
                      >重新上传</button>
                    </div>
                  )}

                  {/* 风格参考 — inside same card */}
                  <div className="mt-5 pt-5 border-t border-black/[0.04]">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-3.5 h-3.5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                      </svg>
                      <span className="text-xs font-semibold text-[#0b1c30]">风格对标</span>
                      <span className="text-[10px] text-[#9d6400] bg-[#fff3c4] px-1.5 py-0.5 rounded-full">可选</span>
                    </div>
                    <input
                      className={inputCls}
                      value={competitorImageUrl}
                      onChange={(e) => setCompetitorImageUrl(e.target.value)}
                      placeholder="粘贴竞品店铺或商品链接"
                    />
                  </div>
                </div>
              </div>

              {/* ── Right: 精细化配置 (single card) ── */}
              <div className="flex-1 flex flex-col">
                <div className={`${cardCls} flex flex-col flex-1`}>
                  <h2 className="text-sm font-semibold text-[#0b1c30] mb-5">精细化配置</h2>

                  <div className="flex flex-col gap-4 flex-1">
                    <div>
                      <label className={labelCls}>商品名称</label>
                      <input
                        className={inputCls}
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="输入商品核心描述"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>分发平台</label>
                      <div className="flex bg-[#f3f4f6] p-1 rounded-xl">
                        {(Object.keys(PLATFORM_SPECS) as Platform[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              platform === p
                                ? "bg-white text-[#0b1c30] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold"
                                : "text-[#6b7280] hover:text-[#0b1c30]"
                            }`}
                          >
                            {PLATFORM_SPECS[p].name.split(" / ")[0]}
                          </button>
                        ))}
                      </div>
                      {/* 平台规格提示 */}
                    </div>

                    {/* 目标风格 — 短，气泡选择 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <label className="text-xs font-medium text-[#6b7280]">目标风格</label>
                        {loadingStyle && (
                          <span className="w-3 h-3 border border-[#f97316] border-t-transparent rounded-full animate-spin ml-1" />
                        )}
                      </div>
                      <textarea
                        ref={styleInputRef}
                        className={`${inputCls} min-h-[52px]`}
                        value={productParams}
                        onChange={(e) => setProductParams(e.target.value)}
                        placeholder="例如：极简冷淡、赛博朋克…"
                      />
                      {styleSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {styleSuggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setProductParams(s)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                productParams === s
                                  ? "bg-[#f97316] text-white border-[#f97316]"
                                  : "bg-[#fff7ed] text-[#f97316] border-[#f97316]/25 hover:bg-[#f97316] hover:text-white"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                          {/* 兜底气泡：自定义 */}
                          <button
                            type="button"
                            onClick={() => { setProductParams(""); styleInputRef.current?.focus(); }}
                            className="text-[11px] px-2.5 py-1 rounded-full border border-black/[0.1] bg-[#f9fafb] text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151] transition-all"
                          >
                            ✏️ 自定义
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 商品参数 — 长，AI 补充 */}
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-[#6b7280]">商品参数</label>
                        <button
                          type="button"
                          onClick={handleParamsSuggest}
                          disabled={loadingParams || !productName}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#f97316] hover:text-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loadingParams ? (
                            <span className="w-3 h-3 border border-[#f97316] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                            </svg>
                          )}
                          AI 补充
                        </button>
                      </div>
                      <textarea
                        className={`${inputCls} flex-1 min-h-[80px]`}
                        value={competitorDesc}
                        onChange={(e) => setCompetitorDesc(e.target.value)}
                        placeholder="材质、规格、售价、核心功能、适用人群…"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* end two-column row */}
          </div>

            {/* ── Floating action buttons ── */}
            <div className="fixed bottom-7 right-10 z-40 flex items-center gap-5">

              <button
                onClick={handleAnalyze}
                disabled={!productName || !productParams || !uploadedImage}
                className="flex items-center gap-2.5 bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[15px] px-7 py-3.5 rounded-full transition-all"
                style={{ boxShadow: "0 6px 24px rgba(249,115,22,0.45), 0 2px 8px rgba(249,115,22,0.25)" }}
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>生成 AI 素材</span>
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: AI 分析中 ───────────────────────────────── */}
        {step === 2 && (
          <div className="p-10 flex flex-col h-[calc(100vh-64px)]">
            <header className="mb-8 shrink-0">
              <h1
                className="text-3xl font-bold text-[#0b1c30]"
                style={{ fontFamily: "var(--font-hanken), sans-serif" }}
              >
                {isLoading ? "特征解析中..." : "解析完成，合成素材中..."}
              </h1>
              <p className="text-sm text-[#565e74] mt-2">
                {productName} · {PLATFORM_SPECS[platform].name.split(" / ")[0]}
              </p>
            </header>

            {/* Two-column body */}
            <div className="flex gap-6 flex-1 min-h-0 items-stretch">

              {/* Left: progress steps */}
              <div className="flex-1 space-y-3">
                {[
                  {
                    key: "analyze",
                    label: "商品解读与风格策划",
                    desc: analysis
                      ? analysis.styleDirection
                      : "分析商品品类、卖点与视觉风格...",
                    done: !!analysis,
                  },
                  {
                    key: "script",
                    label: "5张套图分镜规划",
                    desc: analysis
                      ? `已规划 ${analysis.imageScripts?.length ?? 0} 张分镜`
                      : "规划主图/场景/细节/氛围/合规图...",
                    done: !!analysis,
                  },
                  {
                    key: "copy",
                    label: "营销文案创作",
                    desc:
                      copies.length > 0
                        ? `已生成 ${copies.length} 套主副标题与卖点`
                        : "撰写每张图的标题与核心卖点...",
                    done: copies.length > 0,
                  },
                  {
                    key: "compliance",
                    label: "生成营销文案",
                    desc: compliance
                      ? compliance.marketingCopy
                        ? "文案已生成，通过广告合规检测"
                        : "文案生成完毕"
                      : "基于推荐卖点生成合规营销文案...",
                    done: !!compliance,
                  },
                ].map((s, i) => {
                  const isActive =
                    !s.done &&
                    (i === 0 ||
                      (i === 1 && !!analysis) ||
                      // i === 2 是平台规格适配，always done，不参与 active 判断
                      (i === 3 && copies.length === 0 && !!analysis) ||
                      (i === 4 && copies.length > 0 && !compliance));
                  return (
                    <div
                      key={s.key}
                      className={`flex items-start gap-4 rounded-xl p-4 border bg-white transition-all ${
                        isActive
                          ? "border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                          : "border-black/[0.04]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mt-0.5 transition-all ${
                          s.done
                            ? "bg-[#ecfdf5] text-[#10b981]"
                            : isActive
                            ? "bg-[#f97316] text-white"
                            : "bg-[#f3f4f6] text-[#9ca3af]"
                        }`}
                      >
                        {s.done ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                          </svg>
                        ) : isActive ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${s.done || isActive ? "text-[#0b1c30]" : "text-[#9ca3af]"}`}>
                          {s.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${
                          isActive ? "text-[#f97316] animate-pulse" : s.done ? "text-[#6b7280]" : "text-[#c0c8d8]"
                        }`}>
                          {s.desc}
                        </p>
                        {s.key === "analyze" && s.done && (() => {
                          const hexes = (analysis?.colorScheme ?? "").match(/#[0-9A-Fa-f]{6}/g) ?? [];
                          return hexes.length > 0 ? (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {hexes.map((hex) => (
                                <div
                                  key={hex}
                                  className="w-3.5 h-3.5 rounded-full border border-black/[0.08] shrink-0"
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                              ))}
                              <span className="text-[10px] text-[#c0c8d8] font-mono">{hexes.join(" · ")}</span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: result cards */}
              <div className="w-80 shrink-0 flex flex-col gap-4 justify-start">

                {/* 平台规格适配 — 始终显示 */}
                {(() => {
                  const spec = PLATFORM_SPECS[platform];
                  const mb = spec.mainImage.maxSizeKB >= 1024
                    ? `${spec.mainImage.maxSizeKB / 1024} MB`
                    : `${spec.mainImage.maxSizeKB} KB`;
                  const rows = [
                    { label: "主图尺寸", value: `${spec.mainImage.width} × ${spec.mainImage.height} px` },
                    { label: "长宽比", value: spec.mainImage.ratio },
                    { label: "最多张数", value: `${spec.mainImage.maxCount} 张主图` },
                    { label: "文件格式", value: spec.format.join(" / ") },
                    { label: "单图上限", value: `≤ ${mb}` },
                  ];
                  return (
                    <div className={cardCls}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-semibold text-[#f97316]">{spec.name}</p>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                          </svg>
                          自动适配
                        </span>
                      </div>
                      <div className="space-y-2">
                        {rows.map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-[11px] text-[#9ca3af]">{label}</span>
                            <span className="text-[11px] font-semibold text-[#0b1c30] tabular-nums">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {analysis ? (
                  <>
                    {/* 标题优化 */}
                    {analysis.seoTitle && (
                      <div className={cardCls}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={labelCls} style={{ marginBottom: 0 }}>标题优化</p>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                            </svg>
                            自动排序
                          </span>
                        </div>
                        <p className="text-[12px] font-semibold text-[#0b1c30] leading-snug">{analysis.seoTitle}</p>
                        <p className="text-[10px] text-[#9ca3af] mt-1.5">核心功能 → 品类 → 规格 → 人群</p>
                      </div>
                    )}
                    {/* 核心卖点 */}
                    <div className={cardCls}>
                      <p className={labelCls}>核心卖点</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.productHighlights?.map((h, i) => (
                          <span
                            key={i}
                            className="text-xs bg-[#f3f4f6] text-[#374151] px-2.5 py-1 rounded-md font-medium"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Skeleton placeholder while loading */
                  <div className={`${cardCls} space-y-3`}>
                    <div className="h-3 bg-[#f3f4f6] rounded-full w-1/3 animate-pulse" />
                    <div className="flex flex-wrap gap-2">
                      {[60, 80, 50, 70, 55].map((w, i) => (
                        <div key={i} className={`h-6 bg-[#f3f4f6] rounded-md animate-pulse`} style={{ width: w }} />
                      ))}
                    </div>
                    <div className="pt-4 border-t border-black/[0.04] space-y-2">
                      <div className="h-3 bg-[#f3f4f6] rounded-full w-1/4 animate-pulse" />
                      <div className="h-4 bg-[#f3f4f6] rounded-full w-2/3 animate-pulse" />
                      <div className="flex gap-2 pt-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-[#f3f4f6] animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── Step 3 / Step 4: 共用手机栏，右侧内容按 step 分支 ── */}
        {(step === 3 || step === 4) && analysis && (
          <div className="p-10">
            {/* Two-column layout */}
            <div className="flex flex-col xl:flex-row gap-10 items-start">
              {/* ── Left: Sticky phone column ── */}
              <div className="w-full xl:w-[340px] flex flex-col items-center xl:sticky xl:top-20 gap-3 shrink-0">
                {displayCopies.length > 0 && (
                <div>
                  <p className="text-xs text-[#565e74] text-center mb-3 flex items-center justify-center gap-1.5">
                    <span className="font-semibold text-[#0b1c30]">{PLATFORM_SPECS[platform].name.split(" / ")[0]}</span>
                    <span>商城效果预览</span>
                    {generatingSlots.size > 0 && (
                      <span className="text-[#f97316] animate-pulse">· 生成中</span>
                    )}
                  </p>

                  {/* iPhone 17 手机框架（真实图片） */}
                  <div
                    className="relative overflow-hidden"
                    style={{ width: 280, height: 570, isolation: "isolate", borderRadius: 44 }}
                  >
                    {/* 屏幕内容层（在图片之下） */}
                    <div
                      className="absolute overflow-hidden"
                      style={{
                        left: 13,
                        top: 13,
                        width: 252,
                        height: 543,
                        borderRadius: 30,
                        backgroundColor: "white",
                      }}
                    >
                      {platform === "taobao" ? (
                        /* ────────── 淘宝详情页布局 ────────── */
                        <>
                          {/* 浮层顶栏：回退 + 右侧图标，叠在主图上 */}
                          <div className="absolute top-8 left-0 right-0 px-2.5 flex justify-between items-center z-[5] pointer-events-none">
                            <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                              </svg>
                            </div>
                            <div className="flex gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                </svg>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center relative">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                </svg>
                                <span className="absolute -top-0.5 -right-0.5 bg-[#FF5000] text-white text-[6px] w-3 h-3 rounded-full flex items-center justify-center font-bold">1</span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M5 12h.01M12 12h.01M19 12h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} />
                                </svg>
                              </div>
                            </div>
                          </div>


                          {/* 可滚动主体 */}
                          <div
                            className="overflow-y-auto h-full"
                            style={{ paddingBottom: 44, scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
                          >
                            {/* 主图：全幅正方形 */}
                            <div className="relative w-full bg-[#E0E0E0]" style={{ paddingTop: "100%" }}>
                              <div className="absolute inset-0">
                                {(() => {
                                  const active =
                                    analysis.imageScripts.find((s) => s.slot === selectedSlot) ??
                                    analysis.imageScripts[0];
                                  const copy = displayCopies.find((c) => c.slot === active?.slot);
                                  if (!active || !copy) return <div className="w-full h-full bg-[#E0E0E0]" />;
                                  return (
                                    <MaterialCard
                                      script={active}
                                      copy={copy}
                                      platformLabel=""
                                      isFixed={false}
                                      compact
                                      imageUrl={generatedImages[active.slot]}
                                      isGenerating={generatingSlots.has(active.slot)}
                                    />
                                  );
                                })()}
                              </div>
                              {/* Slot 1 文字横幅 overlay — 仅首图显示 */}
                              {selectedSlot === 1 && (() => {
                                const c1 = displayCopies.find((c) => c.slot === 1);
                                if (!c1?.headline) return null;
                                return (
                                  <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)", padding: "22px 8px 9px" }}>
                                    <p style={{ color: "white", fontSize: 8.5, fontWeight: 800, lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.6)", marginBottom: 2 }}>{c1.headline}</p>
                                    <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 7, lineHeight: 1.3 }}>{c1.subline}</p>
                                  </div>
                                );
                              })()}
                              {/* 页码 */}
                              <div className="absolute bottom-2 right-2 bg-black/30 text-white text-[8px] px-1.5 py-0.5 rounded-full z-10">
                                {analysis.imageScripts.findIndex((s) => s.slot === selectedSlot) + 1}/
                                {analysis.imageScripts.length}
                              </div>
                            </div>

                            {/* 缩略图条 */}
                            <div
                              className="bg-white px-2 py-1.5 flex gap-1.5 overflow-x-auto border-b border-[#EEEEEE]"
                              style={{ scrollbarWidth: "none" } as React.CSSProperties}
                            >
                              {analysis.imageScripts.map((s) => (
                                <button
                                  key={s.slot}
                                  onClick={() => setSelectedSlot(s.slot)}
                                  className={`w-10 h-10 shrink-0 rounded overflow-hidden border-2 transition-colors ${
                                    selectedSlot === s.slot ? "border-[#FF5000]" : "border-[#EEEEEE]"
                                  }`}
                                >
                                  <MaterialCard
                                    script={s}
                                    copy={displayCopies.find((c) => c.slot === s.slot)!}
                                    platformLabel=""
                                    isFixed={false}
                                    compact
                                    imageUrl={generatedImages[s.slot]}
                                    isGenerating={generatingSlots.has(s.slot)}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* 价格区 */}
                            <div className="bg-white px-3 py-2 flex justify-between items-center border-b border-[#EEEEEE]">
                              <div>
                                <div className="flex items-baseline gap-0.5 text-[#FF0036]">
                                  <span className="text-[10px]">¥</span>
                                  <span className="text-xl font-bold leading-none">{productPrice || "--"}</span>
                                </div>
                                <div className="text-[8px] text-gray-400 line-through mt-0.5">
                                  原价 ¥{productPrice ? Math.round(parseFloat(productPrice) * 1.5) : "1999"}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[8px] text-gray-500">距结束</div>
                                <div className="font-mono bg-[#FF0036]/10 text-[#FF0036] text-[8px] px-1.5 py-0.5 rounded mt-0.5">
                                  12 : 00 : 00
                                </div>
                              </div>
                            </div>

                            {/* 标题 + 标签 */}
                            <div className="bg-white px-3 py-2 mb-1">
                              <p className="text-[10px] font-bold text-gray-900 leading-snug mb-1.5">
                                <span className="inline-block bg-[#FF0036] text-white text-[7px] px-1 rounded mr-1 align-middle">
                                  新品上市
                                </span>
                                {analysis?.productTitle || productName}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <span className="bg-[#FF0036]/10 text-[#FF0036] text-[7px] px-1.5 py-0.5 rounded">热销</span>
                                <span className="bg-[#FF0036]/10 text-[#FF0036] text-[7px] px-1.5 py-0.5 rounded">百亿补贴</span>
                                {analysis.productHighlights?.slice(0, 2).map((h, i) => (
                                  <span key={i} className="bg-orange-50 text-orange-500 text-[7px] px-1.5 py-0.5 rounded border border-orange-100">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* 选择 / 配送 / 服务 行 */}
                            <div className="bg-white mb-1">
                              {[
                                { label: "选择", val: "颜色、尺码、规格" },
                                { label: "配送至", val: "北京市 朝阳区" },
                                { label: "服务", val: "7天无理由 · 正品保障" },
                              ].map(({ label, val }, idx, arr) => (
                                <div
                                  key={label}
                                  className={`flex justify-between items-center px-3 py-2 ${
                                    idx < arr.length - 1 ? "border-b border-[#F5F5F5]" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] text-gray-500 w-9 shrink-0">{label}</span>
                                    <span className="text-[8px] text-gray-800">{val}</span>
                                  </div>
                                  <svg className="w-2.5 h-2.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                  </svg>
                                </div>
                              ))}
                            </div>

                            {/* 评价 */}
                            <div className="bg-white mb-1 px-3 py-2">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[9px] font-bold text-gray-900">评价 (1000+)</span>
                                <span className="text-[8px] text-[#FF5000] flex items-center gap-0.5">
                                  查看全部
                                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                  </svg>
                                </span>
                              </div>
                              <div
                                className="flex gap-1 overflow-x-auto mb-2"
                                style={{ scrollbarWidth: "none" } as React.CSSProperties}
                              >
                                {["质量好 (120)", "发货快 (85)", "外观好看 (50)"].map((t) => (
                                  <span key={t} className="bg-[#F8F8F8] text-gray-700 text-[7px] px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0" />
                                <span className="text-[7px] text-gray-500">用***名</span>
                                <span className="text-[7px] text-gray-400 ml-auto">颜色: 默认</span>
                              </div>
                              <p className="text-[8px] text-gray-800 leading-relaxed">
                                质量很好，做工精细，非常满意！发货很快。
                              </p>
                            </div>

                            {/* 店铺 */}
                            <div className="bg-white mb-1 px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
                                <div>
                                  <div className="text-[9px] font-bold text-gray-900">官方品牌旗舰店</div>
                                  <div className="text-[7px] text-gray-500 mt-0.5">宝贝 4.9 · 服务 4.9 · 物流 4.9</div>
                                </div>
                              </div>
                              <button className="border border-[#FF5000] text-[#FF5000] text-[7px] px-2 py-0.5 rounded-full shrink-0">
                                进店逛逛
                              </button>
                            </div>

                            {/* 商品详情分割线 */}
                            <div className="bg-white pt-3 pb-2">
                              <div className="relative flex items-center px-4">
                                <div className="flex-1 h-px bg-[#EEEEEE]" />
                                <span className="text-[8px] text-gray-400 px-2 bg-white shrink-0">商品详情</span>
                                <div className="flex-1 h-px bg-[#EEEEEE]" />
                              </div>
                            </div>

                            {/* 详情图：所有 AI 生成图依次排列 */}
                            <div className="flex flex-col gap-0.5 bg-[#F8F8F8]">
                              {analysis.imageScripts.map((s) => {
                                const copy = displayCopies.find((c) => c.slot === s.slot);
                                if (!copy) return null;
                                return (
                                  <div
                                    key={s.slot}
                                    className="w-full bg-[#E0E0E0]"
                                    style={{ paddingTop: "100%", position: "relative" }}
                                  >
                                    <div className="absolute inset-0">
                                      <MaterialCard
                                        script={s}
                                        copy={copy}
                                        platformLabel=""
                                        isFixed={false}
                                        compact
                                        imageUrl={generatedImages[s.slot]}
                                        isGenerating={generatingSlots.has(s.slot)}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="py-6 text-center text-[8px] text-gray-400">— 已经到底了 —</div>
                            </div>
                          </div>

                          {/* 底部操作栏（固定） */}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EEEEEE] flex items-center z-20"
                            style={{ height: 44 }}
                          >
                            <div className="flex justify-around items-center py-1.5" style={{ width: "42%" }}>
                              {[
                                { d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "店铺" },
                                { d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "客服" },
                                { d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", label: "收藏" },
                              ].map(({ d, label }) => (
                                <div key={label} className="flex flex-col items-center">
                                  <svg className="w-4 h-4 text-gray-600 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                  </svg>
                                  <span className="text-[7px] text-gray-600">{label}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1.5 pr-3" style={{ width: "58%" }}>
                              <button className="flex-1 bg-[#FF9500] text-white text-[8px] font-semibold py-1.5 rounded-full">
                                加入购物车
                              </button>
                              <button className="flex-1 bg-[#FF5000] text-white text-[8px] font-semibold py-1.5 rounded-full">
                                立即购买
                              </button>
                            </div>
                          </div>
                        </>
                      ) : platform === "pdd" ? (
                        /* ────────── 拼多多详情页布局 ────────── */
                        <>
                          {/* 浮层顶栏 */}
                          <div className="absolute top-8 left-0 right-0 px-2.5 flex justify-between items-center z-[5] pointer-events-none">
                            <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                            </div>
                            <div className="flex gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                              </div>
                            </div>
                          </div>
                          {/* 可滚动主体 */}
                          <div className="overflow-y-auto h-full" style={{ paddingBottom: 44, scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
                            {/* 主图 */}
                            <div className="relative w-full bg-[#eae7e7]" style={{ paddingTop: "100%" }}>
                              <div className="absolute inset-0">
                                {(() => {
                                  const active = analysis.imageScripts.find((s) => s.slot === selectedSlot) ?? analysis.imageScripts[0];
                                  const copy = displayCopies.find((c) => c.slot === active?.slot);
                                  if (!active || !copy) return <div className="w-full h-full bg-[#eae7e7]" />;
                                  return <MaterialCard script={active} copy={copy} platformLabel="" isFixed={false} compact imageUrl={generatedImages[active.slot]} isGenerating={generatingSlots.has(active.slot)} />;
                                })()}
                              </div>
                              {/* Slot 1 文字横幅 overlay — 仅首图显示 */}
                              {selectedSlot === 1 && (() => {
                                const c1 = displayCopies.find((c) => c.slot === 1);
                                if (!c1?.headline) return null;
                                return (
                                  <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)", padding: "22px 8px 9px" }}>
                                    <p style={{ color: "white", fontSize: 8.5, fontWeight: 800, lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.6)", marginBottom: 2 }}>{c1.headline}</p>
                                    <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 7, lineHeight: 1.3 }}>{c1.subline}</p>
                                  </div>
                                );
                              })()}
                              <div className="absolute bottom-2 right-2 bg-black/30 text-white text-[8px] px-1.5 py-0.5 rounded-full z-10">
                                {analysis.imageScripts.findIndex((s) => s.slot === selectedSlot) + 1}/{analysis.imageScripts.length}
                              </div>
                            </div>
                            {/* 缩略图条 */}
                            <div className="bg-white px-2 py-1.5 flex gap-1.5 overflow-x-auto border-b border-[#e6bdb7]" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
                              {analysis.imageScripts.map((s) => (
                                <button key={s.slot} onClick={() => setSelectedSlot(s.slot)} className={`w-10 h-10 shrink-0 rounded overflow-hidden border-2 transition-colors ${selectedSlot === s.slot ? "border-[#bb0c0d]" : "border-[#e6bdb7]"}`}>
                                  <MaterialCard script={s} copy={displayCopies.find((c) => c.slot === s.slot)!} platformLabel="" isFixed={false} compact imageUrl={generatedImages[s.slot]} isGenerating={generatingSlots.has(s.slot)} />
                                </button>
                              ))}
                            </div>
                            {/* 百亿补贴栏 */}
                            <div className="px-3 py-2 flex justify-between items-center" style={{ background: "linear-gradient(to right, #bb0c0d, #e02e24)" }}>
                              <div>
                                <div className="flex items-baseline gap-0.5 text-white">
                                  <span className="text-[10px]">¥</span>
                                  <span className="text-xl font-bold leading-none">{productPrice || "--"}</span>
                                  <span className="text-[8px] line-through ml-1 opacity-80">
                                    ¥{productPrice ? Math.round(parseFloat(productPrice) * 1.5) : "1999"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="bg-white/20 text-white text-[6px] font-bold px-1.5 py-0.5 rounded">官方补贴</span>
                                  <span className="text-[6px] text-white/90">已售 20万+件</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="bg-[#FFE500] text-[#bb0c0d] text-[7px] font-bold px-2 py-0.5 rounded">百亿补贴</div>
                                <div className="bg-black/20 text-white text-[6px] px-1.5 py-0.5 rounded-full">距结束 02:15:30</div>
                              </div>
                            </div>
                            {/* 信任标签 + 标题 */}
                            <div className="bg-white px-3 py-2 mb-px">
                              <div className="flex gap-1 mb-1.5">
                                <span className="text-[6px] text-[#ba1a1a] border border-[#ba1a1a]/30 bg-[#ffdad6] px-1.5 py-0.5 rounded">退货包运费</span>
                                <span className="text-[6px] text-[#006c32] border border-[#006c32]/30 bg-[#e5f7ec] px-1.5 py-0.5 rounded">假一赔十</span>
                              </div>
                              <p className="text-[9px] font-bold text-[#1c1b1b] leading-snug">
                                <span className="inline-block bg-[#bb0c0d] text-white text-[6px] px-1 rounded mr-1 align-middle">品牌</span>
                                {analysis?.productTitle || productName}
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 px-1.5 py-1 bg-[#f6f3f2] rounded-lg">
                                <span className="text-[6px] text-[#8e4e00]">👍 品质优选</span>
                                <span className="w-px h-2 bg-[#e6bdb7]" />
                                <span className="text-[6px] text-[#8e4e00]">📈 本月回头客飙升 200%</span>
                              </div>
                            </div>
                            {/* 拼单列表 */}
                            <div className="bg-white px-3 py-2 mb-px">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[8px] font-bold text-[#1c1b1b]">25.7万人正在拼单</span>
                                <span className="text-[7px] text-[#5c403c]">查看更多 ›</span>
                              </div>
                              {[{ name: "某***户", time: "剩余 01:11:03" }, { name: "匿***名", time: "剩余 00:45:12" }].map((u) => (
                                <div key={u.name} className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 rounded-full bg-[#eae7e7]" />
                                    <div>
                                      <div className="text-[8px] text-[#1c1b1b]">{u.name}</div>
                                      <span className="text-[6px] text-[#bb0c0d] border border-[#bb0c0d]/30 px-0.5 rounded">品牌回头客</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="text-right">
                                      <div className="text-[7px] text-[#bb0c0d]">还差1人拼成</div>
                                      <div className="text-[6px] text-[#5c403c]">{u.time}</div>
                                    </div>
                                    <button className="bg-[#bb0c0d] text-white text-[6px] font-bold px-1.5 py-0.5 rounded">去拼单</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* 评价 */}
                            <div className="bg-white px-3 py-2 mb-px">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[8px] font-bold text-[#1c1b1b]">商品评价 (198)</span>
                                <span className="text-[7px] text-[#5c403c]">查看全部 ›</span>
                              </div>
                              <div className="flex gap-1 mb-1.5">
                                {["质量好(45)", "尺码准(32)", "穿着好(28)"].map((t) => (
                                  <span key={t} className="text-[6px] border border-[#e6bdb7] bg-[#f6f3f2] text-[#1c1b1b] px-1.5 py-0.5 rounded whitespace-nowrap">{t}</span>
                                ))}
                              </div>
                              <p className="text-[8px] text-[#1c1b1b] leading-relaxed">质量很好，做工精细，非常满意！发货很快。</p>
                            </div>
                            {/* 品牌店铺 */}
                            <div className="bg-white px-3 py-2 mb-px flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#eae7e7] rounded border border-[#e6bdb7]" />
                                <div>
                                  <div className="text-[8px] font-bold text-[#1c1b1b]">官方品牌旗舰店</div>
                                  <div className="text-[6px] text-[#5c403c] mt-0.5">热销 3164万+ | 粉丝 100万+</div>
                                </div>
                              </div>
                              <button className="border border-[#bb0c0d] text-[#bb0c0d] text-[6px] px-2 py-0.5 rounded-full">进店逛逛</button>
                            </div>
                            {/* 商品详情分割线 */}
                            <div className="bg-white py-3">
                              <div className="flex items-center gap-2 px-3">
                                <div className="flex-1 h-px bg-[#e6bdb7]" />
                                <span className="text-[8px] font-bold text-[#1c1b1b]">商品详情</span>
                                <div className="flex-1 h-px bg-[#e6bdb7]" />
                              </div>
                            </div>
                            {/* 详情图 */}
                            <div className="flex flex-col gap-0.5 bg-[#f6f3f2]">
                              {analysis.imageScripts.map((s) => {
                                const copy = displayCopies.find((c) => c.slot === s.slot);
                                if (!copy) return null;
                                return (
                                  <div key={s.slot} className="w-full bg-[#eae7e7]" style={{ paddingTop: "100%", position: "relative" }}>
                                    <div className="absolute inset-0">
                                      <MaterialCard script={s} copy={copy} platformLabel="" isFixed={false} compact imageUrl={generatedImages[s.slot]} isGenerating={generatingSlots.has(s.slot)} />
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="py-6 text-center text-[8px] text-[#916f6a]">— 已经到底了 —</div>
                            </div>
                          </div>
                          {/* 底部操作栏 */}
                          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e6bdb7] flex items-center z-20" style={{ height: 44 }}>
                            <div className="flex justify-around items-center" style={{ width: "38%", padding: "6px 0" }}>
                              {[
                                { d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "店铺" },
                                { d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", label: "收藏" },
                                { d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "客服" },
                              ].map(({ d, label }) => (
                                <div key={label} className="flex flex-col items-center">
                                  <svg className="w-4 h-4 text-[#5c403c] mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                  </svg>
                                  <span className="text-[7px] text-[#5c403c]">{label}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1 pr-2" style={{ width: "62%", height: 36 }}>
                              <button className="flex-1 flex flex-col items-center justify-center bg-[#ffdad6] text-[#bb0c0d] font-bold rounded-l-full rounded-r text-[7px] h-full">
                                <span>¥1999</span>
                                <span className="font-normal text-[6px]">单独购买</span>
                              </button>
                              <button className="flex-[1.4] flex flex-col items-center justify-center bg-[#bb0c0d] text-white font-bold rounded-r-full rounded-l text-[7px] h-full">
                                <span>¥--</span>
                                <span className="font-normal text-[6px]">发起拼单</span>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* ────────── 通用平台布局 ────────── */
                        <>

                          {/* 平台 App 顶栏 */}
                          <div className="bg-orange-500 px-3 py-1.5 flex items-center justify-between">
                            <span className="text-white text-[10px] font-bold">
                              {PLATFORM_SPECS[platform].name.split(" / ")[0]}
                            </span>
                            <span className="text-white text-[10px]">🛒</span>
                          </div>

                          {/* 滚动内容区 */}
                          <div className="overflow-y-auto" style={{ height: 494 } as React.CSSProperties}>
                            {/* 主图 */}
                            <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                              {(() => {
                                const first = analysis.imageScripts[0];
                                const copy = displayCopies.find((c) => c.slot === first?.slot);
                                if (!first || !copy) return null;
                                return (
                                  <MaterialCard
                                    script={first}
                                    copy={copy}
                                    platformLabel=""
                                    isFixed={false}
                                    compact
                                    imageUrl={generatedImages[first.slot]}
                                    isGenerating={generatingSlots.has(first.slot)}
                                  />
                                );
                              })()}
                            </div>

                            {/* 缩略图条 */}
                            <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-gray-100">
                              {analysis.imageScripts.map((s, i) => (
                                <div
                                  key={i}
                                  className={`w-9 h-9 shrink-0 rounded-lg overflow-hidden border-2 ${
                                    i === 0 ? "border-orange-400" : "border-gray-200"
                                  }`}
                                >
                                  <MaterialCard
                                    script={s}
                                    copy={displayCopies.find((c) => c.slot === s.slot)!}
                                    platformLabel=""
                                    isFixed={false}
                                    compact
                                    imageUrl={generatedImages[s.slot]}
                                    isGenerating={generatingSlots.has(s.slot)}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* 促销横幅（Step 4 选中热点/季节时内嵌显示） */}
                            {step === 4 && selectedContext && renderHotspotBanner(selectedContext)}

                            {/* 商品信息 */}
                            <div className="px-3 py-2 space-y-1">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-red-500 font-bold text-xs">¥</span>
                                <span className="text-red-500 font-bold text-base">--</span>
                                <span className="text-gray-400 text-[9px] ml-1">已售1000+件</span>
                              </div>
                              <p className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2">
                                {analysis.productTitle || productName}
                              </p>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {analysis.productHighlights?.slice(0, 3).map((h, i) => (
                                  <span key={i} className="text-[8px] bg-orange-50 text-orange-500 border border-orange-100 px-1 py-0.5 rounded">
                                    {h}
                                  </span>
                                ))}
                              </div>
                              <div className="border-t border-gray-100 mt-1.5 pt-1.5 text-[9px] text-gray-400">
                                {analysis.styleDirection}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/iphone17-frame.png"
                      alt=""
                      className="absolute pointer-events-none select-none"
                      style={{ width: 280, height: 570, left: 0, top: 0, zIndex: 10 }}
                      draggable={false}
                    />
                  </div>
                </div>
                )}

                {/* 平台规格适配 — 手机下方 */}
                {(() => {
                  const spec = PLATFORM_SPECS[platform];
                  const mb = spec.mainImage.maxSizeKB >= 1024
                    ? `${spec.mainImage.maxSizeKB / 1024}MB`
                    : `${spec.mainImage.maxSizeKB}KB`;
                  const rows = [
                    { label: "主图尺寸", value: `${spec.mainImage.width}×${spec.mainImage.height}px` },
                    { label: "比例", value: spec.mainImage.ratio },
                    { label: "最多张数", value: `${spec.mainImage.maxCount} 张` },
                    { label: "格式", value: spec.format.join("/") },
                    { label: "单图上限", value: `≤${mb}` },
                  ];
                  return (
                    <div className="w-[280px] bg-white rounded-2xl border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.04)] px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-[#0b1c30]">{spec.name}</span>
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-[#10b981] bg-[#ecfdf5] px-1.5 py-0.5 rounded-full">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
                          </svg>
                          已适配规格
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-x-2 gap-y-1">
                        {rows.map(({ label, value }) => (
                          <div key={label} className="flex flex-col items-center">
                            <span className="text-[8px] text-[#9ca3af]">{label}</span>
                            <span className="text-[9px] font-semibold text-[#374151] tabular-nums text-center">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ── Right: content sections (step 3) / iterate panel (step 4) ── */}
              {step === 4 ? (
              <div className="flex-1 min-w-0 space-y-10">

                {/* Step 4 Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0b1c30]" style={{ fontFamily: "var(--font-hanken), sans-serif" }}>一键捕捉热点</h1>
                    <p className="text-sm text-[#565e74] mt-1">保持商品本体不变，一键更新季节氛围 / 蹭营销热点</p>
                  </div>
                  <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#f97316] border border-black/[0.08] bg-white px-4 py-2 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                    </svg>
                    效果预览
                  </button>
                </div>

                {/* 迭代控制 */}
                <section className={cardCls}>
                  <div className="flex gap-2 mb-5">
                    {([
                      { mode: "seasonal" as const, label: "🌡️ 季节时令", active: "bg-[#eff4ff] border-[#494bd6] text-[#494bd6]" },
                      { mode: "hotspot" as const, label: "🔥 营销热点", active: "bg-[#fff7ed] border-[#f97316] text-[#f97316]" },
                    ]).map(({ mode, label, active }) => (
                      <button key={mode} onClick={() => { setIterateMode(mode); setSelectedContext(""); setIterateResult(null); }}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          iterateMode === mode ? active : "bg-white border-black/[0.08] text-[#565e74] hover:border-[#f97316] hover:text-[#f97316]"
                        }`}
                      >{label}</button>
                    ))}
                  </div>
                  <div>
                    <p className={labelCls}>{iterateMode === "seasonal" ? "选择目标季节" : "选择热点"}</p>
                    <div className="flex flex-wrap gap-2">
                      {(iterateMode === "seasonal" ? SEASONS : HOTSPOTS).map((ctx) => (
                        <button key={ctx} onClick={() => { setSelectedContext(ctx); setIterateResult(null); }}
                          className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                            selectedContext === ctx
                              ? "bg-[#f97316] border-[#f97316] text-white font-semibold"
                              : "bg-white border-black/[0.08] text-[#565e74] hover:border-[#f97316] hover:text-[#f97316]"
                          }`}
                        >{ctx}</button>
                      ))}
                    </div>
                  </div>
                  {selectedContext && (
                    <div className="mt-5">
                      <button onClick={handleIterate} disabled={iterating}
                        className={`${primaryBtnCls} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {iterating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {iterating ? "更新中..." : `一键生成「${selectedContext}」版本`}
                      </button>
                    </div>
                  )}
                </section>

                {/* 图片预览 / 迭代对比 */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#0b1c30] flex items-center gap-2.5">
                      图片预览
                      {generatingSlots.size > 0 && (
                        <span className="text-xs font-normal text-[#f97316] animate-pulse">
                          已完成 {Object.keys(generatedImages).length}/{analysis?.imageScripts.length ?? 5} · AI 生图约 30s
                        </span>
                      )}
                      {generatingSlots.size === 0 && Object.keys(generatedImages).length > 0 && (
                        <span className="text-xs font-normal text-[#22c55e]">✓ 全部生成完成</span>
                      )}
                    </h2>
                    <button onClick={handleBatchDownload} disabled={Object.keys(generatedImages).length === 0}
                      className="bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                      </svg>
                      批量导出
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.imageScripts.map((script) => {
                      const iterCopy = iterateResult?.iteratedCopies?.find((c) => c.slot === script.slot);
                      const copy = iterCopy ?? displayCopies.find((c) => c.slot === script.slot);
                      if (!copy) return null;
                      const isGen = generatingSlots.has(script.slot);
                      return (
                        <div key={script.slot} className="group cursor-pointer">
                          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f6f3f2] border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                            <div className="w-full h-full">
                              <MaterialCard script={script} copy={copy}
                                platformLabel={PLATFORM_SPECS[platform].name.split(" / ")[0]}
                                isFixed={!!iterCopy} compact
                                imageUrl={generatedImages[script.slot]}
                                isGenerating={isGen}
                              />
                            </div>

                            {isGen && (
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                                生成中
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-[#0b1c30]">图{script.slot}：{script.type}</h4>
                              <p className="text-[11px] text-[#9ca3af] mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]/60" />商品图层
                                <span className="text-[#d1d5db]">+</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]/60" />文字图层
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 改动日志 */}
                {iterateResult?.changeLog && (
                  <section className="bg-white border border-black/[0.06] rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                    <h2 className="text-xl font-semibold text-[#0b1c30] mb-6">迭代改动说明</h2>
                    <ul className="space-y-3">
                      {iterateResult.changeLog.map((log, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#374151]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-2 shrink-0" />
                          {log}
                        </li>
                      ))}
                    </ul>
                    {iterateResult.newColorScheme && (
                      <p className="text-xs text-[#9ca3af] mt-4 pt-4 border-t border-black/[0.04]">
                        新色调方案：{iterateResult.newColorScheme}
                      </p>
                    )}
                  </section>
                )}

              </div>
              ) : (
              <div className="flex-1 min-w-0 space-y-12">

                {/* Section 1: 推荐卖点 */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#0b1c30]">推荐卖点</h2>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-[#0b1c30] hover:bg-black/[0.04] transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {(analysis.productHighlights?.slice(0, 3) ?? []).map((h, i) => {
                      const script = analysis.imageScripts[i];
                      const copy = displayCopies.find((c) => c.slot === (script?.slot ?? i + 1));
                      return (
                        <div key={i} className="bg-white border border-black/[0.05] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow">
                          <h3 className="text-sm font-semibold text-[#0b1c30] leading-snug mb-2">{h}</h3>
                          <p className="text-xs text-[#9ca3af] leading-relaxed">
                            {copy?.subline?.replace(/^AI\s*/i, "") || "已针对此卖点规划专属渲染图，视觉与文案保持一致。"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Section 2: 图片预览 */}
                {displayCopies.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-[#0b1c30] flex items-center gap-2.5">
                        图片预览
                        {generatingSlots.size > 0 && (
                          <span className="text-xs font-normal text-[#f97316] animate-pulse">
                            已完成 {Object.keys(generatedImages).length}/{analysis?.imageScripts.length ?? 5} · AI 生图约 30s
                          </span>
                        )}
                        {generatingSlots.size === 0 && Object.keys(generatedImages).length > 0 && (
                          <span className="text-xs font-normal text-[#22c55e]">✓ 全部生成完成</span>
                        )}
                      </h2>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setStep(4)}
                          className="border border-black/[0.08] bg-white text-[#374151] px-4 py-2 rounded-lg text-sm font-medium hover:bg-black/[0.02] transition-all"
                        >
                          迭代演示
                        </button>
                        <button
                          onClick={handleBatchDownload}
                          disabled={Object.keys(generatedImages).length === 0}
                          className="bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                          </svg>
                          批量导出
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analysis.imageScripts.map((script) => {
                        const copy = displayCopies.find((c) => c.slot === script.slot);
                        const original = copies.find((c) => c.slot === script.slot);
                        if (!copy) return null;
                        const isFixed = fixedCopies.length > 0 && JSON.stringify(copy) !== JSON.stringify(original);
                        const isGen = generatingSlots.has(script.slot);
                        const isDone = !!generatedImages[script.slot];
                        return (
                          <div key={script.slot} className="group cursor-pointer">
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#f6f3f2] border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                              <div className="w-full h-full">
                                <MaterialCard
                                  script={script}
                                  copy={copy}
                                  platformLabel={PLATFORM_SPECS[platform].name.split(" / ")[0]}
                                  isFixed={false}
                                  compact
                                  imageUrl={generatedImages[script.slot]}
                                  isGenerating={isGen}
                                />
                              </div>
                              {isGen && (
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                                  生成中
                                </div>
                              )}
                            </div>
                            <div className="mt-3 flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-[#0b1c30]">图{script.slot}：{script.type}</h4>
                                <p className="text-[11px] text-[#9ca3af] mt-0.5 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]/60" />商品图层
                                  <span className="text-[#d1d5db]">+</span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]/60" />文字图层
                                </p>
                              </div>
                              <button
                                onClick={() => setEditingLayer(editingLayer === script.slot ? null : script.slot)}
                                className={`p-1 rounded-lg transition-all ${editingLayer === script.slot ? "text-[#3b82f6] bg-[#eff6ff]" : "text-[#9ca3af] hover:text-[#3b82f6] hover:bg-[#eff6ff]"}`}
                                title="编辑文字图层"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} />
                                </svg>
                              </button>
                            </div>
                            {/* 文字图层编辑面板 */}
                            {editingLayer === script.slot && (
                              <div className="mt-2 p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe] space-y-2">
                                <p className="text-[10px] font-semibold text-[#3b82f6] mb-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                  </svg>
                                  文字图层 · 独立可调整
                                </p>
                                <div>
                                  <p className="text-[9px] text-[#6b7280] mb-1">主标题</p>
                                  <input
                                    className="w-full text-xs bg-white border border-[#bfdbfe] rounded-lg px-2.5 py-1.5 text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
                                    value={textLayers[script.slot]?.headline ?? copy?.headline ?? ""}
                                    onChange={(e) => setTextLayers((prev) => ({ ...prev, [script.slot]: { headline: e.target.value, subline: prev[script.slot]?.subline ?? copy?.subline ?? "" } }))}
                                    placeholder="主标题文案"
                                  />
                                </div>
                                <div>
                                  <p className="text-[9px] text-[#6b7280] mb-1">副标题</p>
                                  <input
                                    className="w-full text-xs bg-white border border-[#bfdbfe] rounded-lg px-2.5 py-1.5 text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
                                    value={textLayers[script.slot]?.subline ?? copy?.subline ?? ""}
                                    onChange={(e) => setTextLayers((prev) => ({ ...prev, [script.slot]: { headline: prev[script.slot]?.headline ?? copy?.headline ?? "", subline: e.target.value } }))}
                                    placeholder="副标题文案"
                                  />
                                </div>
                                {(textLayers[script.slot]) && (
                                  <button
                                    onClick={() => setTextLayers((prev) => { const n = {...prev}; delete n[script.slot]; return n; })}
                                    className="text-[9px] text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                                  >
                                    重置为 AI 原文
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Section 3: 营销文案 */}
                {compliance?.marketingCopy && (
                  <section className="bg-white border border-black/[0.06] rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-[#0b1c30]">营销文案</h2>
                      {/* 合规徽章 */}
                      <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#86efac] text-[#16a34a] text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        已通过广告合规检测
                      </div>
                    </div>
                    <p className="text-[15px] text-[#374151] leading-relaxed tracking-wide">
                      {compliance.marketingCopy}
                    </p>
                  </section>
                )}

              </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── Asset Library Overlay ── */}
      {showAssetLibrary && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop (left sidebar area) */}
          <div className="w-56 shrink-0" onClick={() => setShowAssetLibrary(false)} />

          {/* Panel */}
          <div className="flex-1 flex flex-col bg-[#f6f6f7] overflow-hidden">
            {/* Header — h-16 与顶部导航齐平 */}
            <div
              className="h-16 flex items-center justify-between px-8 border-b border-black/[0.06] shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
            >
              <h1 className="text-[17px] font-semibold text-[#0b1c30]">素材库</h1>
              <button
                onClick={() => setShowAssetLibrary(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.06] text-[#9ca3af] hover:text-[#374151] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>

            {/* Filter tabs */}
            <div className="px-8 py-3.5 flex items-center gap-2 border-b border-black/[0.04] bg-white/70 shrink-0">
              {([ { key: "all", label: "全部素材" }, { key: "taobao", label: "淘宝/天猫" }, { key: "pdd", label: "拼多多" }, { key: "jd", label: "京东" } ] as { key: Platform | "all"; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAssetFilter(key)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    assetFilter === key
                      ? "bg-[#0b1c30] text-white shadow-sm"
                      : "bg-black/[0.05] text-[#6b7280] hover:bg-black/[0.09] hover:text-[#0b1c30]"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-[#b8bfcc]">
                {(assetFilter === "all" ? savedAssets : savedAssets.filter((a) => a.platform === assetFilter)).length} 个结果
              </span>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {savedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center pb-20">
                  <div className="w-14 h-14 rounded-2xl bg-black/[0.05] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#c0c8d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={1.5} />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#9ca3af]">暂无保存的素材</p>
                  <p className="text-xs text-[#c0c8d8] mt-1">生成 AI 素材后将自动存入素材库</p>
                </div>
              ) : (() => {
                const filtered = assetFilter === "all" ? savedAssets : savedAssets.filter((a) => a.platform === assetFilter);
                return (
                  <div style={{ columns: 3, columnGap: "16px" }}>
                    {filtered.map((asset, idx) => {
                      const mainSlot = asset.slots.find((s) => s.slot === 1) ?? asset.slots[0];
                      const secondSlot = asset.slots.find((s) => s.slot === 2);
                      const platformLabel = PLATFORM_SPECS[asset.platform]?.name.split(" / ")[0] ?? asset.platform;
                      // Vary card heights for masonry feel
                      const tall = idx % 5 === 1 || idx % 7 === 4;
                      return (
                        <div
                          key={asset.projectId}
                          className="break-inside-avoid mb-4 bg-white rounded-2xl overflow-hidden border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all cursor-pointer group"
                        >
                          {/* Main image */}
                          {mainSlot ? (
                            <div className={`relative w-full overflow-hidden bg-[#f3f4f6] ${tall ? "h-56" : "h-40"}`}>
                              <img
                                src={mainSlot.url}
                                alt={asset.productName}
                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                              />
                              {/* Second image thumbnail overlay */}
                              {secondSlot && (
                                <img
                                  src={secondSlot.url}
                                  alt=""
                                  className="absolute bottom-2 right-2 w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm opacity-90"
                                />
                              )}
                              {/* Slot count */}
                              <div className="absolute top-2 left-2 bg-black/45 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                                {asset.slots.length} 张素材
                              </div>
                            </div>
                          ) : (
                            <div className={`w-full bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] flex items-center justify-center ${tall ? "h-56" : "h-40"}`}>
                              <svg className="w-8 h-8 text-[#d1d5db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.5} />
                                <path d="M3 9l5-5 4 4 4-4 5 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                              </svg>
                            </div>
                          )}

                          {/* Card footer */}
                          <div className="px-4 py-3">
                            <p className="text-[13px] font-semibold text-[#0b1c30] truncate">{asset.productName}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-medium text-white bg-[#f97316] px-1.5 py-0.5 rounded-md leading-none">{platformLabel}</span>
                              <span className="text-[10px] text-[#9ca3af]">{relativeTime(asset.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── 产品说明弹层 ── */}
      {showProductGuide && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowProductGuide(false)}>
          <div
            className="bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-black/[0.06] px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-[#0b1c30]">商图智造 · 产品说明</span>
              </div>
              <button onClick={() => setShowProductGuide(false)} className="w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/[0.1] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>

            <div className="px-8 py-8 space-y-10">

              {/* Hero */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-[#fff7ed] border border-[#f97316]/20 text-[#f97316] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI 驱动 · 全链路自动化
                </div>
                <h2 className="text-2xl font-bold text-[#0b1c30]">0 设计基础，1 分钟完成电商主图套图上架</h2>
                <p className="text-sm text-[#6b7280] max-w-lg mx-auto leading-relaxed">
                  以商品信息为唯一输入，自动完成竞品分析 → 分镜策划 → 图片生成 → 文案撰写 → 合规检测，输出可直接上架的完整素材包。
                </p>
              </div>

              {/* 四步流程 */}
              <div>
                <p className="text-xs font-semibold text-[#9ca3af] tracking-widest uppercase mb-5">使用流程</p>
                <div className="space-y-6">
                  {[
                    {
                      step: "01", label: "商品录入", color: "#f97316", bg: "#fff7ed",
                      desc: "填写商品名称、选择淘宝 / 拼多多 / 京东平台、上传商品图，可选填竞品链接和目标风格。",
                      img: "/guide-step1.png",
                    },
                    {
                      step: "02", label: "特征解析", color: "#6366f1", bg: "#eef2ff",
                      desc: "AI 自动分析竞品、提炼 3 条核心卖点、规划 5 张套图分镜，生成标题优化并自动适配平台图片规范。",
                      img: "/guide-step2.png",
                    },
                    {
                      step: "03", label: "效果预览", color: "#10b981", bg: "#ecfdf5",
                      desc: "生成 5 张商品场景图，配套主副标题与卖点文案，双层合规检测（字面违禁词 + 语义级 LLM 审核），自动修复问题文案。",
                      img: "/guide-step3.png",
                    },
                    {
                      step: "04", label: "迭代演示", color: "#f59e0b", bg: "#fffbeb",
                      desc: "选择季节时令或营销热点（618 / 双11 / 开学季等），一键更新文案层和促销横幅，保留原有图片资产。",
                      img: "/guide-step4.png",
                    },
                  ].map(({ step, label, color, bg, desc, img }) => (
                    <div key={step} className="rounded-2xl border border-black/[0.05] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
                      {/* 截图 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={label} className="w-full object-cover object-top" style={{ maxHeight: 320 }} />
                      {/* 文字 */}
                      <div className="px-5 py-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: bg }}>
                          <span className="text-[11px] font-black" style={{ color }}>{step}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0b1c30] mb-1">{label}</p>
                          <p className="text-xs text-[#6b7280] leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 核心能力 */}
              <div>
                <p className="text-xs font-semibold text-[#9ca3af] tracking-widest uppercase mb-5">核心能力</p>
                <div className="space-y-3">
                  {[
                    { icon: "✅", title: "图片规格自动适配平台规范", desc: "内置淘宝（800×800px · ≤3MB）、拼多多（800×800px · ≤1MB）、京东（1000×1000px · ≤3MB）规格，切换平台自动适配，无需手动调整。" },
                    { icon: "🛡️", title: "双层广告合规检测", desc: "L1 本地词库毫秒级扫描字面违禁词，L2 调用大模型进行语义级审核（覆盖「没人比我便宜」等隐式违禁表达），命中后自动修复并保持语感。" },
                    { icon: "🔍", title: "AI 多模态竞品分析", desc: "支持粘贴竞品图片 URL，Qwen-VL 多模态模型自动解读竞品主图风格、构图逻辑与色调策略，竞品无图时自动降级为纯文本分析。" },
                    { icon: "🏷️", title: "关键词自动排序优化", desc: "参考国内电商买家真实搜索习惯，按「核心功能词 → 品类词 → 规格属性词 → 应用场景 → 人群词」顺序自动排列搜索优化标题。" },
                    { icon: "🎨", title: "5 槽位结构化套图分镜", desc: "主图（爆款吸睛）→ 场景痛点图（直击用户痛点）→ 功能细节图（材质放大）→ 氛围场景图（情绪价值）→ 白底合规图（平台审核标准），每张图均有独立分镜逻辑。" },
                    { icon: "🔄", title: "热点一键迭代", desc: "保留已生成的商品图片资产，仅更新文案层与促销横幅。支持季节时令（春夏秋冬）和营销热点（618 / 双11 / 开学季 / 情人节），按平台自动渲染不同样式的促销横幅。" },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex gap-4 p-4 rounded-2xl bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors">
                      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#0b1c30] mb-1">{title}</p>
                        <p className="text-xs text-[#6b7280] leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部 */}
              <div className="text-center pt-2 pb-2">
                <button onClick={() => setShowProductGuide(false)} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
                  开始使用
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
