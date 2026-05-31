"use client";

import { IMAGE_SET_TEMPLATES } from "@/lib/platform-specs";

interface CopyData {
  slot: number;
  headline: string;
  subline: string;
  bullets: string[];
  badgeText: string;
}

interface Script {
  slot: number;
  type: string;
  headline: string;
  subline: string;
  scenePrompt: string;
}

// 每个 slot 的渐变色方案
const SLOT_GRADIENTS = [
  "from-slate-800 to-slate-600",
  "from-stone-700 to-amber-800",
  "from-zinc-700 to-zinc-500",
  "from-neutral-600 to-stone-500",
  "from-white to-gray-50",
];

const SLOT_TEXT_COLORS = ["text-white", "text-white", "text-white", "text-white", "text-gray-800"];

export default function MaterialCard({
  script,
  copy,
  platformLabel,
  isFixed,
  compact = false,
  imageUrl,
  isGenerating = false,
  hideOverlay = false,
}: {
  script: Script;
  copy: CopyData;
  platformLabel: string;
  isFixed?: boolean;
  compact?: boolean;
  imageUrl?: string;
  hideOverlay?: boolean;
  isGenerating?: boolean;
}) {
  const gradIdx = (script.slot - 1) % SLOT_GRADIENTS.length;
  const textColor = SLOT_TEXT_COLORS[gradIdx];

  // 紧凑模式：用于手机壳缩略图
  if (compact) {
    if (isGenerating) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (imageUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={imageUrl} alt={script.type} className="w-full h-full object-cover" />;
    }
    return (
      <div className={`w-full h-full bg-gradient-to-br ${SLOT_GRADIENTS[gradIdx]} relative overflow-hidden`}>
        <div className={`absolute inset-0 flex flex-col justify-end p-1.5 ${textColor}`}>
          <p className="text-[8px] font-bold leading-tight truncate drop-shadow">{copy.headline}</p>
        </div>
        <div className="absolute top-1 left-1 bg-black/30 text-white text-[7px] px-1 rounded">
          {script.type}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 图片区 */}
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
        {/* 背景：生成图 / 生成中 / 渐变占位 */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={script.type} className="w-full h-full object-cover" />
        ) : isGenerating ? (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400">AI 生图中...</span>
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${SLOT_GRADIENTS[gradIdx]}`} />
        )}

        {/* 文案叠加 */}
        {!hideOverlay && (
          <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent ${imageUrl ? "text-white" : textColor}`}>
            <p className="text-sm font-bold leading-tight drop-shadow">{copy.headline}</p>
            <p className="text-[11px] mt-0.5 opacity-80 drop-shadow">{copy.subline}</p>
          </div>
        )}

        {/* 角标 */}
        {!hideOverlay && copy.badgeText && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {copy.badgeText}
          </div>
        )}

        {/* 图片类型标签 */}
        {!hideOverlay && (
          <div className="absolute top-2 left-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
            {script.type}
          </div>
        )}

        {/* 平台水印 */}
        {!hideOverlay && platformLabel && (
          <div className="absolute bottom-1 right-1 text-[8px] opacity-30 text-white">
            {platformLabel} · AI生成
          </div>
        )}

        {/* 修复标记 */}
        {isFixed && (
          <div className="absolute inset-0 border-2 border-green-400 rounded-xl pointer-events-none" />
        )}
      </div>

      {/* 卡片底部信息 */}
      <div className="px-1">
        <p className="text-xs font-semibold text-gray-700">图{script.slot}：{script.type}</p>
      </div>
    </div>
  );
}
