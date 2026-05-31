"use client";

interface QuickHit {
  word: string;
  category: string;
  replacement: string;
}

interface SemanticIssue {
  original: string;
  reason: string;
  suggestion: string;
}

interface ComplianceData {
  quickHits: QuickHit[];
  semantic: {
    issues: SemanticIssue[];
    overallRisk: string;
    summary: string;
  };
}

const RISK_CONFIG = {
  low: { label: "合规", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  medium: { label: "需注意", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  high: { label: "高风险", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export default function ComplianceReport({ data, hasFixed }: { data: ComplianceData; hasFixed: boolean }) {
  const risk = RISK_CONFIG[data.semantic.overallRisk as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.low;
  const totalIssues = (data.quickHits?.length ?? 0) + (data.semantic?.issues?.length ?? 0);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">广告合规检测</span>
          {hasFixed && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
              ✓ 已自动修复
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${risk.color}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
          {risk.label}
          {totalIssues > 0 && `（${totalIssues} 处）`}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 总结 */}
        <p className="text-sm text-gray-600">{data.semantic.summary}</p>

        {/* 字面命中 */}
        {data.quickHits?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">字面违禁词</p>
            <div className="flex flex-wrap gap-2">
              {data.quickHits.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 rounded-lg px-2 py-1"
                >
                  <span className="text-red-600 font-medium line-through">{h.word}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{h.replacement}</span>
                  <span className="text-gray-400 text-[10px]">[{h.category}]</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 语义问题 */}
        {data.semantic?.issues?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">语义违规（AI 语义检测）</p>
            <div className="space-y-2">
              {data.semantic.issues.map((issue, i) => (
                <div key={i} className="text-xs bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠</span>
                    <div>
                      <span className="font-medium text-orange-700">"{issue.original}"</span>
                      <span className="text-gray-500 ml-1">— {issue.reason}</span>
                      <p className="text-green-600 mt-0.5">建议：{issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalIssues === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span>✓</span>
            <span>未检测到违禁词，文案合规</span>
          </div>
        )}
      </div>
    </div>
  );
}
