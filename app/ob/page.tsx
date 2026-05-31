"use client";
import Link from "next/link";

const PAINS = [
  {
    img: "/1.png",
    tag: "01",
    tagColor: "#ef4444",
    title: "AI 生成驴唇不对马嘴？尺寸不对？",
    desc: "生成的图片商品对不上、尺寸不合规、上传平台直接被拒——白白浪费时间和金钱。",
    solution: "平台帮你精准适配",
    solDesc: "内置淘宝 / 拼多多 / 京东三大平台规范，生成即合规，不需要你懂任何参数。",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    img: "/2.png",
    tag: "02",
    tagColor: "#f97316",
    title: "踩广告法红线？一个字被罚一万？",
    desc: "\"最\"、\"第一\"、\"唯一\" 这些词 AI 随手就写，商家毫不知情，直到接到平台扣分或罚款通知。",
    solution: "平台帮你智能避坑！",
    solDesc: "双层合规检测：本地违禁词秒扫 + 大模型语义审核，有问题自动改，改完给你看。",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    img: "/3.png",
    tag: "03",
    tagColor: "#8b5cf6",
    title: "大促改图累瘫？每次都要重头来？",
    desc: "618、双11、中秋……每个节点都得重新做图，一套图弄三天，大促还没结束人先倒。",
    solution: "一键迭代热点素材",
    solDesc: "输入热点关键词，平台自动更新文案和视觉风格，原图资产全保留，分钟级完成换季。",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

export default function OBPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f97316] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-[#0b1c30]">商图智造</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            免费开始使用
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-white border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-[#fff7ed] border border-[#f97316]/20 text-[#f97316] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI 驱动 · 全链路自动化
          </div>
          <h1 className="text-4xl font-bold text-[#0b1c30] leading-tight mb-4">
            电商人每天面临的<br />
            <span className="text-[#f97316]">3 个真实噩梦</span>
          </h1>
          <p className="text-[#6b7280] text-base max-w-xl mx-auto leading-relaxed">
            从出图到上架，每一步都是坑。<br />商图智造帮你全部绕开。
          </p>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="max-w-5xl mx-auto px-6 py-14 space-y-8 w-full">
        {PAINS.map((pain, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row"
            style={{ flexDirection: i % 2 === 1 ? "row-reverse" : "row" } as React.CSSProperties}
          >
            {/* 漫画图 */}
            <div className="md:w-[340px] shrink-0 bg-[#f6f6f7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pain.img}
                alt={pain.title}
                className="w-full h-full object-cover"
                style={{ minHeight: 280, maxHeight: 380 }}
              />
            </div>

            {/* 文字区 */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center gap-6">
              {/* 痛点 */}
              <div>
                <span
                  className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 text-white"
                  style={{ backgroundColor: pain.tagColor }}
                >
                  {pain.tag}
                </span>
                <h2 className="text-xl font-bold text-[#0b1c30] leading-snug mb-2">{pain.title}</h2>
                <p className="text-sm text-[#6b7280] leading-relaxed">{pain.desc}</p>
              </div>

              {/* 分隔 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#f0f0f0]" />
                <span className="text-xs text-[#9ca3af] font-medium">商图智造的解法</span>
                <div className="flex-1 h-px bg-[#f0f0f0]" />
              </div>

              {/* 解法 */}
              <div className="bg-[#fff7ed] border border-[#f97316]/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[#f97316] font-bold text-base mb-2">
                  <span className="w-7 h-7 rounded-lg bg-[#f97316] flex items-center justify-center text-white shrink-0">
                    {pain.icon}
                  </span>
                  {pain.solution}
                </div>
                <p className="text-sm text-[#92400e] leading-relaxed">{pain.solDesc}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0b1c30] mt-4">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">坑踩够了吗？</h2>
          <p className="text-[#94a3b8] text-base mb-8">0 设计基础，1 分钟完成电商主图套图上架</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c0a] text-white text-base font-bold px-8 py-4 rounded-xl transition-colors shadow-[0_4px_24px_rgba(249,115,22,0.4)]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            免费开始使用
          </Link>
          <p className="text-[#475569] text-xs mt-4">无需注册 · 即开即用</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0b1c30] border-t border-white/10 py-5">
        <p className="text-center text-[#475569] text-xs">© 2026 商图智造 · Powered by Qwen</p>
      </footer>
    </div>
  );
}
