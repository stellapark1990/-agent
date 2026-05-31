export interface ProhibitedWord {
  word: string;
  category: string;
  replacement: string;
}

// 2026 国内电商违禁词库（来源：广告法 + 各平台规则）
export const PROHIBITED_WORDS: ProhibitedWord[] = [
  // 极限词
  { word: "最好", category: "极限词", replacement: "很受欢迎" },
  { word: "最强", category: "极限词", replacement: "出色性能" },
  { word: "最低价", category: "极限词", replacement: "优惠价" },
  { word: "最便宜", category: "极限词", replacement: "高性价比" },
  { word: "最先进", category: "极限词", replacement: "行业领先" },
  { word: "最专业", category: "极限词", replacement: "专业品质" },
  { word: "最火", category: "极限词", replacement: "广受好评" },
  { word: "最流行", category: "极限词", replacement: "深受喜爱" },
  { word: "最受欢迎", category: "极限词", replacement: "备受好评" },
  { word: "最顶级", category: "极限词", replacement: "高端品质" },
  // 第一类
  { word: "第一", category: "第一类", replacement: "前列" },
  { word: "全国第一", category: "第一类", replacement: "全国热销" },
  { word: "全网第一", category: "第一类", replacement: "全网热销" },
  { word: "销量第一", category: "第一类", replacement: "销量领先" },
  { word: "行业第一", category: "第一类", replacement: "行业优选" },
  { word: "NO.1", category: "第一类", replacement: "热销爆款" },
  { word: "冠军", category: "第一类", replacement: "明星款" },
  // 唯一类
  { word: "唯一", category: "唯一类", replacement: "特色款" },
  { word: "独家", category: "唯一类", replacement: "特色款" },
  { word: "独创", category: "唯一类", replacement: "自主研发" },
  { word: "首个", category: "唯一类", replacement: "创新款" },
  { word: "首选", category: "唯一类", replacement: "推荐" },
  { word: "独一无二", category: "唯一类", replacement: "品质出众" },
  // 极限类
  { word: "顶级", category: "极限类", replacement: "高品质" },
  { word: "极致", category: "极限类", replacement: "精心打磨" },
  { word: "完美", category: "极限类", replacement: "表现出色" },
  { word: "天花板", category: "极限类", replacement: "同类优选" },
  { word: "地表最强", category: "极限类", replacement: "性能卓越" },
  { word: "巅峰", category: "极限类", replacement: "高端" },
  { word: "神级", category: "极限类", replacement: "超高性价比" },
  // 价格营销词
  { word: "全网最低价", category: "价格词", replacement: "限时优惠" },
  { word: "跳楼价", category: "价格词", replacement: "特惠价" },
  { word: "亏本卖", category: "价格词", replacement: "回馈粉丝价" },
  { word: "最后一天", category: "价格词", replacement: "限时活动" },
  { word: "永不涨价", category: "价格词", replacement: "长期优惠" },
  { word: "随时恢复原价", category: "价格词", replacement: "活动期间" },
  // 功效类（美妆/食品/保健）
  { word: "治疗", category: "医疗词", replacement: "改善" },
  { word: "根治", category: "医疗词", replacement: "有效改善" },
  { word: "治愈", category: "医疗词", replacement: "舒缓" },
  { word: "抗癌", category: "医疗词", replacement: "健康生活" },
  { word: "降血压", category: "医疗词", replacement: "日常健康管理" },
  { word: "美白", category: "美妆词", replacement: "提亮肤色" },
  { word: "祛斑", category: "美妆词", replacement: "改善暗沉" },
  { word: "永久祛斑", category: "美妆词", replacement: "持续改善暗沉" },
  { word: "抗衰老", category: "美妆词", replacement: "淡化细纹" },
  { word: "逆龄", category: "美妆词", replacement: "焕活年轻感" },
  { word: "暴瘦", category: "减肥词", replacement: "身材管理" },
  { word: "燃脂神器", category: "减肥词", replacement: "运动辅助" },
  { word: "躺瘦", category: "减肥词", replacement: "轻松管理体型" },
  // 权威背书词
  { word: "国家级", category: "权威词", replacement: "品质可靠" },
  { word: "央视推荐", category: "权威词", replacement: "媒体关注" },
  { word: "官方指定", category: "权威词", replacement: "官方出品" },
  { word: "医生推荐", category: "权威词", replacement: "专业建议" },
  { word: "专家推荐", category: "权威词", replacement: "专业优选" },
  // 承诺词
  { word: "100%", category: "承诺词", replacement: "高达" },
  { word: "绝对", category: "承诺词", replacement: "非常" },
];

// 快查 Map
export const PROHIBITED_MAP = new Map(
  PROHIBITED_WORDS.map((pw) => [pw.word, pw])
);

// 本地字面匹配（快速初筛，语义检测由 LLM 做）
export function quickScan(text: string): ProhibitedWord[] {
  return PROHIBITED_WORDS.filter((pw) => text.includes(pw.word));
}
