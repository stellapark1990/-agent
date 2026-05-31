export type Platform = "taobao" | "pdd" | "jd";

export interface PlatformSpec {
  name: string;
  mainImage: { width: number; height: number; ratio: string; maxCount: number; maxSizeKB: number };
  detailImage: { width: number; maxHeight: number; count: string };
  format: string[];
}

export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  taobao: {
    name: "淘宝 / 天猫",
    mainImage: { width: 800, height: 800, ratio: "1:1", maxCount: 5, maxSizeKB: 3072 },
    detailImage: { width: 750, maxHeight: 1500, count: "8-15张" },
    format: ["JPG", "PNG"],
  },
  pdd: {
    name: "拼多多",
    mainImage: { width: 800, height: 800, ratio: "1:1", maxCount: 10, maxSizeKB: 1024 },
    detailImage: { width: 750, maxHeight: 1500, count: "5-20张" },
    format: ["JPG", "PNG"],
  },
  jd: {
    name: "京东",
    mainImage: { width: 1000, height: 1000, ratio: "1:1", maxCount: 10, maxSizeKB: 3072 },
    detailImage: { width: 790, maxHeight: 1000, count: "10-20张" },
    format: ["JPG", "PNG"],
  },
};

// 套图分镜模板（共 5 张）
export const IMAGE_SET_TEMPLATES = [
  { slot: 1, type: "主图", desc: "白底图 / 产品正面全景，凸显材质与设计感" },
  { slot: 2, type: "场景痛点图", desc: "真实使用场景，对比展示核心卖点" },
  { slot: 3, type: "功能细节图", desc: "放大关键部件，参数可视化" },
  { slot: 4, type: "氛围场景图", desc: "品质生活感，情感共鸣" },
  { slot: 5, type: "白底合规图", desc: "纯白底，符合平台搜索审核要求" },
];
