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
    <div className="h-screen bg-[#f5f5f7] flex flex-col font-sans overflow-hidden">

      {/* ── Nav ── */}
      <nav className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-black/[0.08] z-50">
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
      <div className="shrink-0 pt-8 pb-6 px-8 text-center bg-white">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] tracking-tight mb-2">
          困扰电商人的 3 个日常难题
        </h1>
        <p className="text-base text-[#6e6e73]">
          从出图到上架，耗时又费力，交给我们，让上新变得简单点～
        </p>
      </div>

      {/* ── Scenes Grid ── */}
      <div className="flex-1 px-6 py-5 min-h-0">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-3 gap-5">
          {SCENES.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden flex flex-col shadow-sm ${s.dark ? "bg-[#1d1d1f]" : "bg-white"}`}
            >
              {/* 漫画图 */}
              <div className="h-[45%] overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt={s.problem}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* 文字 */}
              <div className="flex-1 flex flex-col p-5 min-h-0">
                <p className="text-[#f97316] text-[11px] font-semibold tracking-widest uppercase mb-2">
                  {s.label}
                </p>
                <h2 className={`text-base font-bold leading-snug mb-2 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                  {s.problem}
                </h2>
                <p className={`text-xs leading-relaxed mb-3 ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                  {s.desc}
                </p>

                {/* 解法 */}
                <div className={`mt-auto rounded-xl p-4 border ${s.dark ? "bg-white/[0.06] border-white/[0.08]" : "bg-[#f5f5f7] border-black/[0.04]"}`}>
                  <p className="text-[#f97316] text-[10px] font-semibold tracking-widest uppercase mb-1.5">
                    商图智造的解法
                  </p>
                  <p className={`text-sm font-bold mb-1 ${s.dark ? "text-white" : "text-[#1d1d1f]"}`}>
                    {s.fix}
                  </p>
                  <p className={`text-xs leading-relaxed ${s.dark ? "text-[#a1a1a6]" : "text-[#6e6e73]"}`}>
                    {s.fixDesc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
