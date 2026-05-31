"use client";
import Link from "next/link";
import { useState } from "react";

const SCENES = [
  {
    label: "场景一",
    img: "/1.png",
    problem: "AI 生成驴唇不对马嘴，尺寸不对，审核不过",
    desc: "生成的图片商品对不上、尺寸不合规、上传平台直接被拒——白白浪费时间和金钱。",
    fix: "平台帮你精准适配",
    fixDesc: "内置淘宝、拼多多、京东三大平台规范，生成即合规，不需要懂任何参数。",
    dark: false,
  },
  {
    label: "场景二",
    img: "/2.png",
    problem: '就加了个"最"字，被罚了一万',
    desc: "「最好」「第一」「唯一」……AI 随手就写，商家毫不知情，直到平台扣分罚款通知来了。",
    fix: "平台帮你智能避坑",
    fixDesc: "双层合规检测：本地违禁词秒扫 + 大模型语义审核，有问题自动改，改完给你看。",
    dark: true,
  },
  {
    label: "场景三",
    img: "/3.png",
    problem: "每次大促都要重做素材，熬不住了",
    desc: "618、双11、中秋……每个节点都得重头来，一套图弄三天，大促还没结束人先倒。",
    fix: "一键迭代热点素材",
    fixDesc: "输入热点关键词，自动更新文案和视觉风格，原图资产全保留，分钟级完成换季。",
    dark: false,
  },
];

const CARD_W = 300; // px

function getTransform(pos: "left" | "center" | "right") {
  if (pos === "center") return { transform: "translateX(0) rotate(0deg) scale(1)", zIndex: 10, brightness: 1 };
  if (pos === "left")   return { transform: `translateX(-${CARD_W * 0.78}px) rotate(-8deg) scale(0.92)`, zIndex: 4, brightness: 0.82 };
  return                       { transform: `translateX(${CARD_W * 0.78}px) rotate(8deg) scale(0.92)`, zIndex: 4, brightness: 0.82 };
}

export default function OBPage() {
  const [active, setActive] = useState(1);

  const getPos = (i: number): "left" | "center" | "right" => {
    const diff = ((i - active) % 3 + 3) % 3;
    if (diff === 0) return "center";
    if (diff === 1) return "right";
    return "left";
  };

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden" style={{ background: "#f0f0f2" }}>

      {/* ── Nav ── */}
      <nav className="shrink-0 bg-white/90 backdrop-blur-xl border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#f97316] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">商图智造</span>
            <span className="text-[13px] text-[#6e6e73] tracking-tight">电商素材全链路 Agent</span>
          </div>
          <Link href="/" className="text-[13px] font-medium text-[#f97316] hover:opacity-80 transition-opacity">
            免费开始使用 →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="shrink-0 pt-6 pb-4 px-8 text-center bg-white border-b border-black/[0.06]">
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-1">
          困扰电商人的 3 个日常难题
        </h1>
        <p className="text-sm text-[#6e6e73]">
          从出图到上架，耗时又费力，交给我们，让上新变得简单点～
        </p>
      </div>

      {/* ── Card Fan ── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {SCENES.map((s, i) => {
          const pos = getPos(i);
          const { transform, zIndex, brightness } = getTransform(pos);
          const isCenter = pos === "center";

          return (
            <div
              key={i}
              onClick={() => !isCenter && setActive(i)}
              style={{
                position: "absolute",
                width: CARD_W,
                transform,
                zIndex,
                filter: `brightness(${brightness})`,
                transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isCenter ? "default" : "pointer",
              }}
              className={`rounded-3xl overflow-hidden shadow-2xl flex flex-col ${s.dark ? "bg-[#1d1d1f]" : "bg-white"}`}
            >
              {/* 图片 4:3 */}
              <div style={{ aspectRatio: "4/3", width: "100%", flexShrink: 0, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.problem} className="w-full h-full object-cover object-top" />
              </div>

              {/* 文字 */}
              <div className="flex flex-col gap-2 p-5">
                <p className="text-[#f97316] text-[10px] font-semibold tracking-widest uppercase">
                  {s.label}
                </p>
                <h2 className={`text-[15px] font-bold leading-snug ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                  {s.problem}
                </h2>
                <p className={`text-xs leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                  {s.desc}
                </p>
                <div className={`rounded-xl px-4 py-3 border ${s.dark ? "bg-white/[0.06] border-white/[0.08]" : "bg-[#f5f5f7] border-black/[0.04]"}`}>
                  <p className={`text-xs font-bold mb-0.5 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                    {s.fix}
                  </p>
                  <p className={`text-[11px] leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                    {s.fixDesc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dots ── */}
      <div className="shrink-0 flex items-center justify-center gap-2 pb-4">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-2 bg-[#f97316]" : "w-2 h-2 bg-black/20"}`}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-black/[0.06] py-3 px-8 bg-white">
        <p className="text-center text-[#b0b0b5] text-xs">© 2026 商图智造 · Powered by Qwen</p>
      </div>

    </div>
  );
}
