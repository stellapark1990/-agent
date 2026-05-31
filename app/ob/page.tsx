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

export default function OBPage() {
  const [active, setActive] = useState(0);
  const s = SCENES[active];

  return (
    <div className="h-screen bg-[#f5f5f7] flex flex-col font-sans overflow-hidden">

      {/* ── Nav ── */}
      <nav className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
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
          <Link
            href="/"
            className="text-[13px] font-medium text-[#f97316] hover:opacity-80 transition-opacity"
          >
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

      {/* ── Card Carousel ── */}
      <div className="flex-1 flex items-center justify-center px-12 py-6 min-h-0 relative">

        {/* 左箭头 */}
        <button
          onClick={() => setActive((active - 1 + SCENES.length) % SCENES.length)}
          className="absolute left-4 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-black/[0.06] flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          <svg className="w-4 h-4 text-[#1d1d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 卡片 */}
        <div
          className={`w-full max-w-lg h-full rounded-3xl overflow-hidden flex flex-col shadow-xl transition-all duration-300 ${s.dark ? "bg-[#1d1d1f]" : "bg-white"}`}
        >
          {/* 图片区：固定像素高度 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.img}
            alt={s.problem}
            className="w-full object-cover object-top shrink-0"
            style={{ height: "280px" }}
          />

          {/* 文字区：撑满剩余空间，内部可滚动 */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-6">
            <p className="text-[#f97316] text-[11px] font-semibold tracking-widest uppercase">
              {s.label}
            </p>
            <h2 className={`text-xl font-bold leading-snug ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
              {s.problem}
            </h2>
            <p className={`text-sm leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
              {s.desc}
            </p>
            <div className={`rounded-2xl px-5 py-4 border ${s.dark ? "bg-white/[0.06] border-white/[0.08]" : "bg-[#f5f5f7] border-black/[0.04]"}`}>
              <p className={`text-sm font-bold mb-1 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                {s.fix}
              </p>
              <p className={`text-sm leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                {s.fixDesc}
              </p>
            </div>
          </div>
        </div>

        {/* 右箭头 */}
        <button
          onClick={() => setActive((active + 1) % SCENES.length)}
          className="absolute right-4 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-black/[0.06] flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          <svg className="w-4 h-4 text-[#1d1d1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Dots ── */}
      <div className="shrink-0 flex items-center justify-center gap-2 pb-4">
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-200 ${i === active ? "w-5 h-2 bg-[#f97316]" : "w-2 h-2 bg-black/20"}`}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-black/[0.06] py-3 px-8 bg-white">
        <p className="text-center text-[#b0b0b5] text-xs">
          © 2026 商图智造 · Powered by Qwen
        </p>
      </div>

    </div>
  );
}
