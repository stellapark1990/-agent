"use client";
import Link from "next/link";

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
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/72 backdrop-blur-xl border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#f97316] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">商图智造</span>
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
      <section className="pt-40 pb-28 px-8 text-center bg-white">
        <p className="text-[#f97316] text-sm font-semibold tracking-widest uppercase mb-5">
          商图智造 · 电商素材全链路 Agent
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1d1d1f] leading-[1.08] tracking-tight mb-6 max-w-3xl mx-auto">
          三个让电商人<br />夜不能寐的瞬间
        </h1>
        <p className="text-xl text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
          这些不是极端案例。这是每天都在发生的事。
        </p>
      </section>

      {/* ── Scenes ── */}
      {SCENES.map((s, i) => (
        <section
          key={i}
          className={`py-24 px-8 ${s.dark ? "bg-[#1d1d1f]" : "bg-[#f5f5f7]"}`}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16"
            style={{ flexDirection: i % 2 === 1 ? "row-reverse" : "row" } as React.CSSProperties}
          >
            {/* 漫画图 */}
            <div className="md:w-[380px] shrink-0">
              <div className={`rounded-3xl overflow-hidden shadow-2xl ${s.dark ? "shadow-black/40" : "shadow-black/10"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt={s.problem}
                  className="w-full object-cover"
                  style={{ aspectRatio: "3/4" }}
                />
              </div>
            </div>

            {/* 文字 */}
            <div className="flex-1 space-y-8">
              <div>
                <p className={`text-sm font-semibold tracking-widest uppercase mb-4 ${s.dark ? "text-[#f97316]" : "text-[#f97316]"}`}>
                  {s.label}
                </p>
                <h2 className={`text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-5 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                  {s.problem}
                </h2>
                <p className={`text-lg leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                  {s.desc}
                </p>
              </div>

              {/* 解法 */}
              <div className={`rounded-2xl p-6 border ${s.dark ? "bg-white/[0.06] border-white/[0.1]" : "bg-white border-black/[0.06]"}`}>
                <p className="text-[#f97316] text-xs font-semibold tracking-widest uppercase mb-3">
                  商图智造的解法
                </p>
                <p className={`text-xl font-bold mb-2 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                  {s.fix}
                </p>
                <p className={`text-sm leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                  {s.fixDesc}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ── */}
      <section className="py-32 px-8 bg-white text-center">
        <p className="text-[#f97316] text-sm font-semibold tracking-widest uppercase mb-5">
          现在开始
        </p>
        <h2 className="text-5xl font-bold text-[#1d1d1f] tracking-tight mb-5">
          坑踩够了吗？
        </h2>
        <p className="text-xl text-[#6e6e73] mb-10">
          0 设计基础，1 分钟完成电商主图套图上架
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-base font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-[0_4px_32px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_40px_rgba(249,115,22,0.45)] hover:-translate-y-0.5"
        >
          免费开始使用
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-[#b0b0b5] text-sm mt-5">无需注册 · 即开即用</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/[0.08] py-6 px-8">
        <p className="text-center text-[#b0b0b5] text-xs">
          © 2026 商图智造 · Powered by Qwen
        </p>
      </footer>
    </div>
  );
}
